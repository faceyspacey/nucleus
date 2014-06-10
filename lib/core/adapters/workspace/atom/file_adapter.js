var File = function(path, editor, ref) {
	this.path = path;
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
		nucleus.workspace.closeFile(this.getPath());
	},
	
	getEditor: function() {
		return this.editor;
	},
	getRealEditor: function() {
		return this.editor.getRealEditor();
	},
	getPath: function() {
		return this.path;
		//return this.getEditor().getPath(); //we used to not have path as a param to new File(path, editor, ref)
	}
};


//having files required to be created in 2 inverse ways was a complex challege to refactor well
File.create = function(path, editor, ref) {
	console.log('FILE CREATE', path);
	return nucleus.project.files[path] = new File(path, editor, ref);
};

//files opened by other clients (inverse 1)
File.createFromPathAndRef = function(path, ref) {
	console.log('CREATE FILE FROM PATH AND REF', path);
	
	if(nucleus.project.files[path]) return; //don't trigger inverse factory
	nucleus.project.files[path] = true; //flag file as true (for now) so createfromEditor won't be triggered from the next line
	
	nucleus.workspace.openFile(path, function(editor) {
		File.create(path, editor, ref); //reduce to same interface
	});
};

//files first opened by this client (inverse 2)
File.createfromPathAndEditor = function(path, editor) {
	console.log('CREATE FILE FROM EDITOR', path);
	
	if(nucleus.project.files[path]) return; //don't trigger inverse factory	
	nucleus.project.files[path] = true; //flag file as true (for now) so createFromPathAndRef won't be triggered from the next line
	
	var ref = nucleus.project.db.push('Files', {path: path, changes: null});
		
	File.create(path, editor, ref); //reduce to same interface
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