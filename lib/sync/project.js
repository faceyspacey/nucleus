Firebase = require('firebase');
Firepad = require('./external/firepad-lib');
File = require('./file');

var Project = function(githubUrl, basePath) {
	var githubUrl = githubUrl || 'https://github.com/celebvidy/celebvidy',
		basePath = basePath || '~/Meteor/celebvidy';

	this.repo = githubUrl.replace('https://github.com', '');
	this.basePath = basePath;
	this.files = {};
	
	this.firebase = new Firebase('https://faceyspacey.firebaseio.com'+this.repo);
	this.firebaseFiles = this.firebase.child('files');
	this.firebaseEvents = this.firebase.child('events');
	this.firebaseMessages  = this.firebase.child('messages');
};


Project.protoype = {
	intialize: function() {
		atom.workspaceView.command "nucleus:evaluate", => this.evalSelection()
		
		atom.workspace.eachEditors(this.onEditorOpened.bind(this));
		this.firebaseFiles.on('child_added', this.onSharedFile.bind(this));
		this.firebaseFiles.on('child_removed', this.onUnSharedFile.bind(this));
	},
	
	
	
	onEditorOpened: function(editor) {
		var liveFile = new File(editor, this);
		
		liveFile.getEditor().on('destroyed', function() {
			this.onEditorClosed(liveFile);
		}.bind(this));
		
		liveFile.firebase = this.firebaseFiles.push({
			path: liveFile.getPath(),
			changes: 'none yet'
		});
		
	    this.files[liveFile.getPath()] = liveFile;
	},
	onEditorClosed: function(liveFile) {
		liveFile.unshare();
		liveFile.firebase.remove();
		delete this.files[liveFile.getPath()];
	},
	
	
	
	onSharedFile: function(snapshot) {
		var localPath = this._prepareFullPath(snapshot.val().path);

		if(this._isFileOpen(localPath)) return; //this is the atom client that oepend the file
		
	    atom.workspace.open(localPath).done(function(editor) {
			var liveFile = new File(editor, this);
				
			lifeFile.firebase = snapshot.ref(); //firebase reference to poll /changes child in share()
			lifeFile.share(); 
			this.files[liveFile.getPath()] = liveFile;
		}.bind(this));
	},
	onUnSharedFile: function(snapshot) {
		var path = snapshot.val().path;

		if(!this.files[path]) return; //this is the atom client that opened the file
		
		this.files[path].close();
		this.files[path].unshare();
		delete this.files[path];
	},
	
	
	
	_prepareFullPath: function(path) {
            return this.basePath + path;
    },
	_isFileOpen: function(localPath) {
		return _.some(atom.workspace.getEditors(), function(editor) {
			return editor.getPath() == localPath;
		});
	},
	
	
	evalSelection: function() {
		var selection = atom.workspace.activeEditor().getSelection().getText();
		this.iframe.contentWindow.eval(selection);
	},
	overWriteGoStatements: function() {
		var oldRouterGo = this.iframe.contentWindow.Router.go,
			oldMobiRouterGo = this.iframe.contentWindow.MobiRouter.go;
		
		this.iframe.contentWindow.Router.goFake = oldRouterGo;
		this.iframe.contentWindow.Router.MobiRouter = oldMobiRouterGo;
			
		this.iframe.contentWindow.Router.go = function() {
			var parent = window.parent,
				arguments = Array.prototype.slice.call(arguments, 0);
			
			parent.firebaseEvents.push({
					object: 'Router',
					method: 'go',
	      	arguments: arguments
	    	});
		};
		
		this.iframe.contentWindow.MobiRouter.go = function() {
			var parent = window.parent,
				arguments = Array.prototype.slice.call(arguments, 0);
			
			parent.firebaseEvents.push({
					object: 'MobiRouter',
					method: 'go',
	      	arguments: arguments
	    	});
		};
		
		this.firebaseEvents.on('child_added', this.onEvent.bind(this));
	},
	onEvent: function(snapshot) {
		var event = snapshot.val(),
			object = this.iframe.contentWindow[event.object],
			method = event.method;
		
		object[method+'Fake'].apply(object, event.arguments);
	}
};

module.exports = Project;



