var AdapterConfig = require('./config/adapter_config'),
	Workspace = AdapterConfig.Workspace,
	File = AdapterConfig.File,
	App = AdapterConfig.App,
	DB = AdapterConfig.DB;

var Project = function(EnterFormView, userName, githubUrl, meteorHost, mongoUrl) {
	this.userName = userName || 'anonymous_'+(new Date).getTime();
	this.githubRepo = githubUrl || 'https://github.com/celebvidy/celebvidy';
	this.repoPath = this.githubRepo.replace('https://github.com', '');
	this.meteorHost = meteorHost || 'http://127.0.0.1';
	this.meteorPort = this.meteorHost.split(':')[2] || '80';
	this.mongoUrl = mongoUrl;
	this.enterFormView = EnterFormView;
	
	if(this.meteorHost.indexOf('http://') === -1) this.meteorHost = 'http://' + this.meteorHost;
	
	this.files = {};

	this.workspace = new Workspace;
	this.db = new DB(AdapterConfig.db_host, this.repoPath);
	this.app = new App(this, this.workspace, this.db);

	window.nucleus.project = this;
	window.nucleus.workspace = this.workspace;
	window.nucleus.db = this.db;
	window.nucleus.app = this.app

	console.log('ENTERING NUCLEUS', this.userName, this.githubRepo, this.meteorHost, this);
};


Project.prototype = {
	initialize: function() {
		this.app.launch(function() {	
			this.onIframeLoad();
			File.createOpenFiles();
			this.bindEvents();
		}.bind(this));
	},

	//see, the purpose of Project is to be a thin controller, making it easy to move down to the next level
	bindEvents: function() {
		this.workspace.on('editor_opened', this.onEditorOpened.bind(this));
		this.workspace.on('selection', this.onSelection.bind(this));

		this.db.on('Files', 'child_added', this.onSharedFile.bind(this));
		this.db.on('Files', 'child_removed', this.onUnSharedFile.bind(this));

		this.db.on('Events', 'child_added_new', this.onEvent.bind(this));
		this.db.on('Messages', 'child_added_new', this.onMessage.bind(this));
	},

	onIframeLoad: function() {
		this.enterFormView.displayIframe(this.meteorHost, function(iframe) {
			this.app.syncEvents(iframe[0]);
		}.bind(this));
	},
	onEditorOpened: function(editor) {
		File.createfromPathAndEditor(editor.getPath(), editor);
	},
	onSelection: function(selection) {
		this.workspace.evalSelection(selection);
	},
	onSharedFile: function(val, key, ref) {
		File.createFromPathAndRef(val.path, ref);
	},
	onUnSharedFile: function(val, key, ref) {
		File.remove(val.path);
	},
	onEvent: function(val) {
		this.app.onEvent(val);
	},
	onMessage: function(val) {
		this.workspace.onMessage(val);
	},
	
	getGithubUser: function() {
		return this.repoPath.substr(1).split('/')[0];
	},
	getGithubRepo: function() {
		return this.repoPath.substr(1).split('/')[1];
	}
};

module.exports = Project;
