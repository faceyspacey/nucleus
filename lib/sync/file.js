/** File Attributes
* 
* editor			Atom::Editor
* project			Nucleus::Project
* firebase			Firebase::reference
* firebaseChanges	Firebase::reference
* firepad			Firepad
*
**/

var File = function(editor, project) {
	this.editor = editor;
	this.project = project;
};

File.prototype = {
	getEditor: function() {
		return this.editor;
	},
	getOriginalPath: function() {
		return this.getEditor().getPath();
	},
	getPath: function() {
		return this._stripBasePath(this.getOriginalPath());
	},
	getFirebasePath: function() {
		return this.getPath().replace('.', '/');
	},
	_stripBasePath: function(path) {
	    return path.replace(this.project.basePath, '');
	},
	close: function() {
		atom.workspace.paneForUri(this.getPath())._view.detach();
	},
	share: function() {
		this.firebaseChanges = this.firebase.child('changes');
	    this.firepad = Firepad.fromAtom(this.firebaseChanges, this.editor, {sv_: Firebase.ServerValue.TIMESTAMP});
	},
	unshare: function() {
		this.firepad.dispose();
	}
};

module.exports = File;