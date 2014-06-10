FormView = require './abstract_form'
IframeView = require '../iframe'
Project = require '../../core/project'
{$, EditorView} = require 'atom'


class EnterFormView extends FormView		
	@form: ->
		@subview 'nameInput', new EditorView(mini: true, placeholderText: 'User Name')
		@subview 'githubInput', new EditorView(mini: true, placeholderText: 'Github Repo URL')
		@subview 'hostInput', new EditorView(mini: true, placeholderText: 'Local Host URL')
		@subview 'mongoInput', new EditorView(mini: true, placeholderText: 'Mongo URL')

	@buttonRight: ->
		super 'ENTER NUCLEUS'
	
	submitRight: ->
		name = window.NUCLEUS_USER = @nameInput.getText()
		github = @githubInput.getText()
		host = @hostInput.getText()
		mongo = @mongoInput.getText()
		
		@project = new Project(this, name, github, host, mongo)
		@project.initialize()
		@detach()
			
	displayIframe: (host, callback) ->
		@iframe = @iframe || new IframeView()
		@iframe.attach(host)
		@iframe.iframe.on 'load', =>
			callback(@iframe.iframe)
			
module.exports = EnterFormView