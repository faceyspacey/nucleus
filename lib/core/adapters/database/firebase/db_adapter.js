var Firebase = require('firebase'),
	Firepad = require('../../../external/firepad'),
	AdapterConfig = require('../../../config/adapter_config');

DB = function(repoPath) {
	this.host = AdapterConfig.db_host;
	this.repoPath = repoPath;
};

DB.prototype = {
	connection: function() {
		return this._connection || (this._connection = this._firebase());
	},
	_firebase: function() {
		return new Firebase(this.host+this.repoPath);
	},

	Files: function() {
		return this._files || (this._files = this.connection().child('files'));
	},
	Events: function() {
		return this._events || (this._events = this.connection().child('events'));
	},
	Messages: function() {
		return this._messages || (this._messages = this.connection().child('messages'));
	},

	shareFile: function(file) {
		file.changes = file.db.child('changes'); //so like i tuck everything in here to completely decouple firebase
	  	file.firepad = Firepad.fromAtom(file.changes, this.editor, {sv_: Firebase.ServerValue.TIMESTAMP}); //FIREPAD!!!
	},
	unShareFile: function(file) {
		if(file.firepad) file.firepad.dispose();
	},

	openFiles: function(callback) {
		this.once('Files', 'value', function(snapshot) {
			snapshot.forEach(function(childSnapShot) {
				callback(childSnapShot.val().path, childSnapShot.ref());
			});
		});
	},

	on: function(Collection, type, callback) {
		this[Collection]().on(type, function(snapshot) {
			callback(snapshot.val(), snapshot.name(), snapshot.ref());
		});
	},
	once: function(Collection, type, callback) {
		this[Collection]().once(type, function(snapshot) {
			callback(snapshot.val(), snapshot.name(), snapshot.ref());
		});
	},

	push: function(Collection, doc) {
		return this[Collection]().push(doc);
	}
};

module.exports = DB;
