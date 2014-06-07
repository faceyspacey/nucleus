var $ = require('atom').$;

var Workspace = function() {
	window.nc = this.newMessage; //chat from the control with: nc('yo whatsup')
};

Workspace.prototype = {
	openFile: function(path, callback) {
		if(this.isFileOpen(path)) return; //this is the atom client that opened the file
		
		var absolutePath = this.absolutePath(path);
		
		atom.workspace.open(absolutePath).done(function(editor) {			
			callback.call(editor);
		});
	},
	closeFile: function(path) {
		var absolutePath = this.absolutePath(path),
			pane = this.paneForPath(absolutePath);
			
		if(pane) pane._view.detach(); //only other clients will have the pane to still detach
	},
	
	
	paneForPath: function(absolutePath) {
		return atom.workspace.paneForUri(absolutePath);
	},
	editorForPath: function(absolutePath) {
		return this.paneForPath(absolutePath).getActiveEditor();
	},
	getBasePath: function() {
		return atom.project.getPath();
	},
	absolutePath: function(path) {
		return this.getBasePath() + path;
	},
	
	
	getEditors: function() {
		return atom.workspace.getEditors();
	},
	isFileOpen: function(path) {
		return _.some(this.getEditors(), function(editor) {
			return editor.getPath() == this.absolutePath();
		}.bind(this));
	},
	
	
	on: function(type, callback) {
		switch(type) {
			case 'editor_opened': 
				atom.workspace.eachEditor(function(editor){
					var path = editor.getPath().replace(this.getBasePath(), '');
					callback(path); //see, we wanna deal with relative paths as much as possible
				}.bind(this));	
				break;
			case 'selection': 
				atom.workspaceView.command("nucleus:evaluate", function() {
					var selection = this.getCurrentSelection();
					callback(selection);
				});		
				break;
		}
	},
	
	
	evalSelection: function(selection) {
		this.iframe ? this.iframe.contentWindow.eval(selection): console.log('no iframe yet');
	},
	getCurrentSelection: function() {
		return atom.workspace.activeEditor().getSelection().getText();
	},
	
	newMessage: function(message) {
		var user = nucleus.project.userName;
		nucleus.db.Messages.push({user: user, message: message});
	},
	onMessage: function(snapshot) {
		console.log(snapshot.val().user+':', snapshot.val().message); //chats appear in the console!
	}
};

module.exports = Workspace;