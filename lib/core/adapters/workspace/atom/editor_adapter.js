var Editor = function(editor) {
	this._editor = editor;
};


Editor.prototype = {
	getPath: function() {
		return nucleus.workspace.stripBasePath(this._absolutePath()); 
	},
	_absolutePath: function() { //don't use this; the whole app is supposed to think in terms of relative paths (getPath)
		return this._editor.getPath() || '';
	},
	getRealEditor: function() {
		return this._editor;
	},
	setText:function(text) {
		return this._editor.setText(text);
	},
	getText: function() {
		return this._editor.getText();
	},
	on: function(type, callback) {
		return this._editor.on(type, callback);
	}
};

module.exports = Editor;