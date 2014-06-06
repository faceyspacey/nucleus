FormView = require './abstract_form'
IframeView = require '../iframe'
Project = require '../../sync/project'
{$, EditorView} = require 'atom'


class EnterFormView extends FormView		
	@form: ->
		@subview 'nameInput', new EditorView(mini: true, placeholderText: 'User Name')
		@subview 'githubInput', new EditorView(mini: true, placeholderText: 'Github Repo URL')
		@subview 'dirInput', new EditorView(mini: true, placeholderText: 'Local Directory')
		@subview 'hostInput', new EditorView(mini: true, placeholderText: 'Local Host URL')
		@subview 'mongoInput', new EditorView(mini: true, placeholderText: 'Mongo URL')

	@buttonRight: ->
		super 'ENTER NUCLEUS'
	
	submitRight: ->
		name = window.NUCLEUS_USER = @nameInput.getText()
		github = @githubInput.getText()
		dir = @dirInput.getText()
		host = @hostInput.getText()
		mongo = @mongoInput.getText()
		
		@project = new Project(name, github, dir, host, mongo, this)
		@project.initialize();
			
	displayIframe: (host) ->
		@iframe = @iframe || new IframeView()
		@iframe.attach(host)
		
	detach: ->
		@iframe.detach()
		super
			
module.exports = EnterFormView