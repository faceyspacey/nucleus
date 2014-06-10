var Firebase = require('firebase'),
	Firepad = require('../../../external/firepad');


var DB = function(host, repoPath) {
	console.log('Firebase HOST', host);
	this.host = host;
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
		console.log('SHARING FILE', file.getPath());
		file.changes = file.db.child('changes'); //so like i tuck everything in here to completely decouple firebase
		
		file.changes.once('value', function(snapshot) {
			var options = {sv_: Firebase.ServerValue.TIMESTAMP};

			if(!snapshot.val() && file.getEditor().getText() != '') options.overwrite = true;
			else file.getEditor().setText('');

		  	file.firepad = Firepad.fromAtom(file.changes, file.getRealEditor(), options); //FIREPAD!!!
		});
	},
	unShareFile: function(file) {
		if(file.firepad) file.firepad.dispose();
	},

	openFiles: function(callback) {
		this.once('Files', 'value', function(val, key, ref, snapshot) {
			snapshot.forEach(function(childSnapShot) {
				callback(childSnapShot.val().path, childSnapShot.ref());
			});
		});
	},

	on: function(Collection, type, callback) {
		this[Collection]().on(type, function(snapshot) {
			callback(snapshot.val(), snapshot.name(), snapshot.ref(), snapshot);
		});
	},
	once: function(Collection, type, callback) {
		this[Collection]().once(type, function(snapshot) {
			callback(snapshot.val(), snapshot.name(), snapshot.ref(), snapshot);
		});
	},

	push: function(Collection, doc) {
		return this[Collection]().push(doc);
	}
};

module.exports = DB;
