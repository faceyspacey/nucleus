EnterFormView = require './views/forms/enter'

module.exports = 
	activate: (state) ->
		window.nucleus = {}
		
		@enter = new EnterFormView(state.enter)
		atom.workspaceView.command "nucleus:enter", => @enter.attach()
		
		return; #below views need to be properly formatted coffee script. tabs are wrong.
		@chat = new ChatFormView(state.chat)
		atom.workspaceView.command "nucleus:chat", => @chat.attach()
		
		@login = new LoginFormView(state.login)
		atom.workspaceView.command "nucleus:login", => @login.attach()
			
		@go = new GoFormView(state.go)
		atom.workspaceView.command "nucleus:go", => @go.attach()