var $ = require('atom').$
	_ = require('underscore-plus'),
	Editor = require('./editor_adapter');

var Workspace = function() {
	window.mess = window.m = this.newMessage; //chat from the control with: nc('yo whatsup')
	
	setInterval(function() {
		if(!atom.workspace.getActiveEditor()) return;
		var selection = atom.workspace.getActiveEditor().getSelection().getText();
		if(selection) nucleus.lastSelection = selection; //this is a dumb hack to make context menu work when it empties selection
	}, 300);
};

Workspace.prototype = {
	openFile: function(path, callback) {
		if(this.isFileOpen(path)) return; //this is the atom client that opened the file

		var absolutePath = this._absolutePath(path); //all files are a relative path until this point. 

		atom.workspace.open(absolutePath).done(function(editor) {
			if(!editor.getPath()) return;
			var editor = new Editor(editor);
			callback(editor);
		});
	},
	closeFile: function(path) {
		var pane = this.paneForPath(path);
		if(pane) pane._view.detach(); //only other clients will have the pane to still detach
	},


	paneForPath: function(path) {
		var absolutePath = this._absolutePath(path);
		return atom.workspace.paneForUri(absolutePath);
	},
	editorForPath: function(path) {
		var editor = this.paneForPath(path).getActiveEditor();
		return new Editor(editor);
	},
	getBasePath: function() {
		return atom.project.getPath();
	},
	_absolutePath: function(path) {
		if(path.indexOf(this.getBasePath()) !== -1) return path;
		return this.getBasePath() + path;
	},
	stripBasePath: function(path) {
		return path.replace(this.getBasePath(), '');
	},
	getAppsBasePath: function() {
		return atom.config.getUserConfigPath().replace('/.atom/config.cson', '') + '/Atom';
	},
	setProjectBasePath: function(githubUser, githubRepo) {
		atom.project.setPath(this.getAppsBasePath() + '/' + githubUser + '/' + githubRepo);
		atom.workspaceView.trigger('tree-view:show');
	},


	getEditors: function() {
		return _.map(atom.workspace.getEditors(), function(editor) {
			return new Editor(editor);
		});
	},
	isFileOpen: function(path) {
		var path = this.stripBasePath(path); //just in case it has the absolute path, which it doesnt in any current client code
		return _.some(this.getEditors(), function(editor) {
			return editor.getPath() == path;
		}.bind(this));
	},


	on: function(type, callback) {
		switch(type) {
			case 'editor_opened':
				atom.workspace.eachEditor(function(editor) {
					if(!editor.getPath()) return;
					var editor = new Editor(editor);
					callback(editor);
				}.bind(this));
				break;
			case 'selection':
				atom.workspaceView.command("nucleus:evaluate", function() {
					var selection = this.getCurrentSelection();
					console.log('SELECTION', selection);
					callback(selection);
				}.bind(this));
				break;
		}
	},


	evalSelection: function(selectionJs) {
		if(!this.iframe) return console.log('no iframe yet');
		
		nucleus.db.Events().push({
			object: 'window',
			method: 'eval',
  			arguments: [selectionJs]
		});
	},
	getCurrentSelection: function() {
		return atom.workspace.getActiveEditor().getSelection().getText() || nucleus.lastSelection;
	},

	newMessage: function(message) {
		var user = nucleus.project.userName;
		nucleus.db.Messages().push({user: user, message: message});
	},
	onMessage: function(val) {
		console.log(val.user+':', val.message); //chats appear in the console!
	}
};

module.exports = Workspace;
