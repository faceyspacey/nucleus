var ChildProcess = require('child_process'),
	ErrorMessages = require('../../../config/error_messages');

var App = function(project, workspace, db) {
	this.project = project;
	this.workspace = workspace;
	this.db = db;
};

App.prototype = {
	launch: function(setupIframeCallback) {
		this.killMeteor();
		
		var command = this._generateCommand(),
			meteor = ChildProcess.exec(command);
		
		meteor.stderr.on('data', function(consoleStream) {
			console.log('METEOR STDERR: ' + consoleStream);
			
			if(consoleStream.indexOf('Please, commit') !== -1) return alert(ErrorMessages.commitChanges);
			if(consoleStream.indexOf('no askpass') !== -1) return alert(ErrorMessages.noAskpass);
		}.bind(this));
			
		meteor.stdout.on('data', function(consoleStream) {
			console.log('METEOR STDOUT: ' + consoleStream);
			
			if(consoleStream.indexOf('App running at') !== -1) {
				this.workspace.setProjectBasePath(this.project.getGithubUser(), this.project.getGithubRepo());
				setupIframeCallback();
			}
		}.bind(this));
	},
	_generateCommand: function() { 	
		var atomDir = nucleus.workspace.getAppsBasePath(),
			githubUser = this.project.getGithubUser(),
			githubRepo = this.project.getGithubRepo(),
			githubRepoUrl = this.project.githubRepo;
			
		var command  = 'export PATH=$PATH:/usr/local/bin';
			command += 'mkdir '+atomDir+'; cd '+atomDir+';mkdir '+githubUser+'; cd '+githubUser;
			command += "; [ ! -d ./"+githubRepo+" ] && git clone "+githubRepoUrl+" && cd "+githubRepo+" || cd "+githubRepo+"; git pull origin master";
			command += '; sudo ROOT_URL='+this.project.meteorHost;
			command += this.mongoUrl ? ' MONGO_URL='+this.project.mongoUrl : ''; 
			command += ' meteor --port '+this.project.meteorPort;
			
		console.log("COMMAND", command);
		return command;
	},
	killMeteor: function() {
		ChildProcess.exec("sudo kill -9 `ps ax | grep node | grep meteor | awk '{print $1}'`")
	},


	syncEvents: function(iframe) {
		this.iframe = this.workspace.iframe = iframe;
		this.overWriteGoStatements();
		//eventually we'll hook into more types of events
		//perhaps a real event replication system if needed, but I'm trying to avoid that for now
	},
	overWriteGoStatements: function() {
		var win = this.iframe.contentWindow;
		
		console.log('SYNCING EVENTS - OVERWRITING GO STATEMENTS', this.iframe, win);
		
		win.Router.goOriginal = win.Router.go;
		win.MobiRouter.goOriginal = win.MobiRouter.go;
		win.Meteor.loginWithPasswordOriginal = win.Meteor.loginWithPassword;
		
		//overwite the go() methods completely because onEvent will execute the old one	
		win.Router.go = this.routerGo;
		win.MobiRouter.go = this.mobiRouterGo;
		win.Meteor.loginWithPassword = this.login;
		
		nucleus.app.win = nucleus.win = win;
		nucleus.app.Meteor = nucleus.Meteor = win.Meteor;
	},
	routerGo: function() {
		nucleus.app.go('Router', Array.prototype.slice.call(arguments, 0));			
	},
	mobiRouterGo: function() {
		nucleus.app.go('MobiRouter', Array.prototype.slice.call(arguments, 0));			
	},
	go: function(routerType, arguments) {
		nucleus.db.Events().push({
			object: routerType,
			method: 'go',
  			arguments: arguments
		});
	},
	login: function(email, password) {
		nucleus.db.Events().push({
			object: 'Meteor',
			method: 'loginWithPassword',
  			arguments: [email, password]
		});
	},
	
	//mimic Meteor interface on nucleus.app. (e.g. nucleus.app.Meteor.loginWithPassword(email, password))
	Router: {
		go: function() {
			nucleus.app.go('Router', Array.prototype.slice.call(arguments, 0));			
		}
	},
	MobiRouter: {
		go: function() {
			nucleus.app.go('MobiRouter', Array.prototype.slice.call(arguments, 0));			
		}
	},
	
	onEvent: function(event) {	
		if(!this.iframe) return; //in case events are handled before the iframe is ready
		
		var object = this.iframe.contentWindow[event.object],
			method = event.method;
		
		if(object[method+'Original']) object[method+'Original'].apply(object, event.arguments); //events are unserialized & played in all client iframes
		else object[method].apply(object, event.arguments);
	},
	
};

module.exports = App;