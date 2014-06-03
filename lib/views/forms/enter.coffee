FormView = require './abstract_form'
IframeView = require './iframe'
Project = require '../sync/project'
fs = require 'fs'
git = require 'gitty'
{spawn} = require 'child_process'.spawn
{$, EditorView} = require 'atom'


class EnterFormView extends FormView
	form: ->
		@subview 'nameInput', new @EditorView(mini: true, placeholderText: 'Enter User Name')
		@subview 'githubInput', new @EditorView(mini: true, placeholderText: 'Enter Github Repo URL')
		@subview 'dirInput', new @EditorView(mini: true, placeholderText: 'Enter Local Directory')
		@subview 'hostInput', new @EditorView(mini: true, placeholderText: 'Enter Local Host URL')
		@subview 'mongoInput', new @EditorView(mini: true, placeholderText: 'Enter Mongo URL')
		
		
	buttonRight: ->
		super 'ENTER NUCLEUS'


  submitRight: ->
		name = window.NUCLEUS_USER = @nameInput.getText()
		github = @githubInput.getText()
		dir = @dirInput.getText()
		host = @hostInput.getText()
		mongo = @mongoInput.getText()
		
		@project = new Project(github, dir)
		@project.initialize();
		
		@launchMeteorApp(dir, host, mongo)

    super


	launchMeteorApp: (dir, host, mongo) ->
		@repo = git(dir)
		@repo.pull 'origin', 'master' #support for clone needs to be added if not cloned yet
		mrt = spawn('sudo mrt', ['--port', '80'], 
			env: 
				ROOT_URL: host
				MONGO_URL: mongo
		)
		
		mrt.stdout.on 'data', (data) => 
			if data.indexOf 'App running at' isnt -1 
				@displayIframe()
		
		
	displayIframe: ->
		@iframe = @iframe || new IframeView()
    @iframe.toggle(host)
		@project.overWriteGoStatements(@iframe);


	detach: -> 
		@iframe.detach()
		
		
		
module.exports = EnterFormView