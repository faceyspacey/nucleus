EnterFormView = require './views/forms/enter'

module.exports = 
	activate: (state) ->
		window.nucleus = {}
		@enter = new EnterFormView(state.enter)
		atom.workspaceView.command "nucleus:enter", => @enter.attach()
		
	