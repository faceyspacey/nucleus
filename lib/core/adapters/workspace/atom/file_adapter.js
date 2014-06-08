var File = function(editor, ref) {
	this.editor = editor;
	this.db = ref;
	
	this.share();
	
	this.editor.on('destroyed', function() {
		File.remove(this.getPath());
	}.bind(this));
};


File.prototype = {
	share: function() {
		nucleus.db.shareFile(this);//yes it may appear it's weird that we do this; but it's intentional
	},
	remove: function() { 
		nucleus.db.unShareFile(this);//...to maintain an interface & decouple firebase perfectly 
		if(this.db) this.db.remove(); //this db is different than the project db.	
		this.workspace.closeFile(this.getPath());
	},
	
	getEditor: function() {
		return this.editor;
	},
	getPath: function() {
		var basePath = this.workspace.getBasePath();
		return this.getAbsolutePath().replace(basePath, '');
	},
	getAbsolutePath: function() {
		return this.getEditor().getPath();
	}
};


//having files required to be created in 2 inverse ways was a complex challege to refactor well
File.create = function(editor, ref) {
	console.log('FILE CREATE', path);
	var file = new File(editor, ref);
	return nucleus.project.files[file.getPath()] = file;
};

//files opened by other clients (inverse 1)
File.createFromPathAndRef = function(path, ref) {
	nucleus.workspace.openFile(path, function(editor) {
		if(nucleus.project.files[editor.getPath()]) return; //don't trigger inverse factory
		
		File.create(editor, ref); //reduce to same interface
	});
};

//files first opened by this client (inverse 2)
File.createfromEditor = function(editor) {
	if(nucleus.project.files[editor.getPath()]) return; //don't trigger inverse factory
	
	var ref = nucleus.project.db.push('Files', {path: file.getPath(), changes: null});
	File.create(editor, ref); //reduce to same interface
};

File.remove = function(path) {
	console.log('FILE REMOVE', path);		
	nucleus.project.files[path].remove();
	delete nucleus.project.files[path];
};

File.createOpenFiles = function() {
	nucleus.project.db.openFiles(function(path, ref) {
		File.createFromPathAndRef(path, ref);
	});
};

module.exports = File;