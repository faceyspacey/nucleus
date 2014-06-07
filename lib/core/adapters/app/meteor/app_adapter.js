var ChildProcess = require('child_process'),
	ErrorMessages = require('../../../config/error_messages');

var App = function(project, workspace, db) {
	this.project = project;
	this.workspace = workspace;
	this.db = db;
};

App.prototype = {
	launch: function(setupIframeCallback) {
		var command = this._generateCommand(),
			meteor = ChildProcess.exec(command);
		
		meteor.stderr.on('data', function(consoleStream) {
			console.log('METEOR STDERR: ' + consoleStream);
			
			if(consoleStream.indexOf('Please, commit') !== -1) return alert(ErrorMessages.commitChanges);
			if(consoleStream.indexOf('no askpass') !== -1) return alert(ErrorMessages.noAskpass);
		}.bind(this));
			
		meteor.stdout.on('data', function(consoleStream) {
			console.log('METEOR STDOUT: ' + consoleStream);
			
			if(consoleStream.indexOf('App running at') !== -1) setupIframeCallback();
		}.bind(this));
	},
	_generateCommand: function() { //sudo kill -9 `ps ax | grep node | grep meteor | awk '{print $1}'`
		var command  = 'cd '+this.basePath;
			command += '; git pull origin master';
			command += '; sudo ROOT_URL='+this.meteorHost;
			command += this.mongoUrl ? ' MONGO_URL='+this.mongoUrl : ''; 
			command += ' meteor --port '+this.meteorPort;
		
		console.log("COMMAND", command);
		return command;
	},


	syncEvents: function(iframe) {
		this.iframe = iframe;
		this.overWriteGoStatements();
		//eventually we'll hook into more types of events
		//perhaps a real event replication system if needed, but I'm trying to avoid that for now
	},
	overWriteGoStatements: function() {
		return; //not tested yet
		
		this.iframe.contentWindow.Router.goOriginal = this.iframe.contentWindow.Router.go;
		this.iframe.contentWindow.MobiRouter.goOriginal = this.iframe.contentWindow.MobiRouter.go;
		
		//overwite the go() methods completely because onEvent will execute the old one	
		this.iframe.contentWindow.Router.go = function() {	
			this.db.Events().push({
				object: 'Router',
				method: 'go',
      			arguments: Array.prototype.slice.call(arguments, 0)
	    	});
		};
		
		this.iframe.contentWindow.MobiRouter.go = function() {
			this.db.Events().push({
				object: 'MobiRouter',
				method: 'go',
      			arguments: Array.prototype.slice.call(arguments, 0)
	    	});
		};
	},
	onEvent: function(snapshot) {	
		if(!this.iframe) return; //in case events are handled before the iframe is ready
		
		var event = snapshot.val(),
			object = this.iframe.contentWindow[event.object],
			method = event.method;
		
		object[method+'Original'].apply(object, event.arguments); //events are unserialized & played in all client iframes
	},
};

module.exports = App;