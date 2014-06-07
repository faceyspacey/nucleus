var AdapterConfig = require('./adapter_config'),
	Workspace = AdapterConfig.workspace,
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
	
	this.files = {};
	
	this.workspace = new Workspace;
	this.db = new DB(this.repoPath);
	this.app = new App(this, this.workspace, this.db);
	
	window.nucleus.project = this;
	window.nucleus.workspace = this.workspace;
	window.nucleus.db = this.db;
	
	console.log('ENTERING NUCLEUS', this.userName, this.githubRepo, this.meteorHost, this);
};


Project.prototype = {
	initialize: function() {
		File.createOpenFiles();
		this.bindEvents();		
		this.app.launch(this.onIframeLoad.bind(this));
	},

	//see, the purpose of Project is to be a thin controller, making it easy to move down to the next level
	bindEvents: function() {
		this.workspace.on('editor_opened', this.onEditorOpened.bind(this));
		this.workspace.on('selection', this.onSelection.bind(this));
		
		this.db.on('Files', 'child_added', this.onSharedFile.bind(this));
		this.db.on('Files', 'child_removed', this.onUnSharedFile.bind(this));
		
		this.DB.on('Events', 'child_added', this.onEvent.bind(this));
		this.DB.on('Messages', 'child_added', this.onMessage.bind(this));
	},
	
	onIframeLoad: function() {
		this.enterFormView.displayIframe(this.meteorHost, function(iframe) {
			this.workspace.iframe = iframe[0];
			this.app.syncEvents(iframe[0]);
		}.bind(this));
	},	
	onEditorOpened: function(editor) {
		File.createfromEditor(editor);
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
	onEvent: function(snapshot) {
		this.app.onEvent(snapshot);
	},
	onMessage: function(snapshot) {
		this.workspace.onMessage(snapshot);
	}
};

module.exports = Project;