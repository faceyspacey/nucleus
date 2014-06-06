ChildProcess = require('child_process');
Firebase = require('firebase');
File = require('./file');
$ = require('atom').$;
_ = require('underscore-plus');

var Project = function(userName, githubUrl, basePath, meteorHost, mongoUrl, EnterFormView) {
	var userName = userName || 'anonymous_'+(new Date).getTime(),
		githubUrl = githubUrl || 'https://github.com/celebvidy/celebvidy',
		basePath = basePath || '~/Meteor/celebvidy',
		meteorHost = meteorHost || 'http://127.0.0.1',
		meteorPort = meteorHost.split(':')[2] || '80',
		mongoUrl = mongoUrl;
	
	console.log('ENTERING NUCLEUS WITH THESE CREDENTIALS', userName, githubUrl, basePath, meteorHost, mongoUrl);
	
	this.userName = userName;
	this.githubRepo = githubUrl;
	this.repoPath = githubUrl.replace('https://github.com', '');
	this.basePath = basePath;
	this.meteorHost = meteorHost;
	this.meteorPort = meteorPort;
	this.mongoUrl = mongoUrl;
	this.enterFormView = EnterFormView;
	
	this.files = {};
	
	this.firebase = new Firebase('https://faceyspacey.firebaseio.com'+this.repoPath);
	this.firebaseFiles = this.firebase.child('files');
	this.firebaseEvents = this.firebase.child('events');
	this.firebaseMessages  = this.firebase.child('messages');
	
	window.nucleus.project = this;
};


Project.prototype = {
	initialize: function() {
		this.launchMeteorApp(function() {
			this.enterFormView.displayIframe(this.meteorHost);
			this.bindAtomEvents();
			//this.bindIframeEvents();
		}.bind(this));
	},
	
	launchMeteorApp: function(setupIframeCallback) {
		var command  = 'cd '+this.basePath;
			command += '; git pull origin master';
			command += '; sudo ROOT_URL='+this.meteorHost;
			command += this.mongoUrl ? ' MONGO_URL='+this.mongoUrl : ''; 
			command += ' meteor --port '+this.meteorPort;
		
		console.log("COMMAND", command);
		
		var mrt = ChildProcess.exec(command);
		
		mrt.stderr.on('data', function(consoleStream) {
			console.log('METEOR STDERR: ' + consoleStream);
			
			if(consoleStream.indexOf('Please, commit') !== -1) 
				return alert('Please commit your local changes before Nucleus calls git pull.');
			
			if(consoleStream.indexOf('no askpass') !== -1)
				return alert('Behind the scenes we are using sudo, which requires a password. To turn off password confirmations, from the command line type "sudo visudo" and make sure the file that is opened has this line: "%sudo ALL=(ALL:ALL) NOPASSWD: ALL"');
		}.bind(this));
		
		
		mrt.stdout.on('data', function(consoleStream) {
			console.log('METEOR STDOUT: ' + consoleStream);
			
			if(consoleStream.indexOf('App running at') !== -1 && !this.iframeSetup) {
				this.iframeSetup = true;
				setupIframeCallback.call(this);
			}
		}.bind(this));
	},
	
	//KILL METEOR
	//sudo kill -9 `ps ax | grep node | grep meteor | awk '{print $1}'`
	
	bindAtomEvents: function() {
		atom.workspace.eachEditor(this.onEditorOpened.bind(this));
		
		this.firebaseFiles.on('child_added', this.onSharedFile.bind(this));
		this.firebaseFiles.on('child_removed', this.onUnSharedFile.bind(this));
		
		this.firebaseEvents.on('child_added', this.onEvent.bind(this));
		this.firebaseMessages.on('child_added', this.onMessage.bind(this));
		
		atom.workspaceView.command("nucleus:evaluate", this.evalSelection.bind(this));
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
				
			liveFile.firebase = snapshot.ref(); //firebase reference to poll /changes child in share()
			liveFile.share(); 
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
	
	onMessage: function(snapshot) {
			console.log(snapshot.val().user, snapshot.val().message); //chats appear in the console!
	},
	
	
	
	bindIframeEvents: function() {
		this.overWriteGoStatements();
		//eventually we'll hook into more types of events
		//perhaps a real event replication system if needed, but I'm trying to avoid that for now
	},
	overWriteGoStatements: function() {
		return;
		this.iframe = $('.nucleus-frame iframe')[0].contentWindow;
		
		var oldRouterGo = iframe.contentWindow.Router.go,
			oldMobiRouterGo = iframe.contentWindow.MobiRouter.go;
		
		iframe.contentWindow.Router.goFake = oldRouterGo;
		iframe.contentWindow.Router.MobiRouter = oldMobiRouterGo;
			
		iframe.contentWindow.Router.go = function() {
			var parent = window.parent,
				arguments = Array.prototype.slice.call(arguments, 0);
			
			parent.firebaseEvents.push({
					object: 'Router',
					method: 'go',
	      	arguments: arguments
	    	});
		};
		
		iframe.contentWindow.MobiRouter.go = function() {
			var parent = window.parent,
				arguments = Array.prototype.slice.call(arguments, 0);
			
			parent.firebaseEvents.push({
					object: 'MobiRouter',
					method: 'go',
	      	arguments: arguments
	    	});
		};
	},
	onEvent: function(snapshot) {
		var event = snapshot.val(),
			object = this.iframe.contentWindow[event.object],
			method = event.method;
		
		object[method+'Fake'].apply(object, event.arguments); //events are unserialized & played in all client iframes
	}
};


module.exports = Project;



