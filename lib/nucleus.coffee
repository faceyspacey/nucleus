Project = require './sync/project'

module.exports =
  activate: (state) ->
		@enter = new EnterFormView(state.enter)
		atom.workspaceView.command "nucleus:enter", => @enter.toggle()
		
		@chat = new ChatFormView()
		atom.workspaceView.command "nucleus:chat", => @chat.toggle()
		
		@login = new LoginFormView()
		atom.workspaceView.command "nucleus:login", => @login.toggle()
		
		@go = new GoFormView()
		atom.workspaceView.command "nucleus:go", => @go.toggle()
		
		
  deactivate: ->
    @enter.detach()
		@chat.detach()
		@login.detach()
		@go.detach()


  serialize: ->
    enter: @enter.serialize()
