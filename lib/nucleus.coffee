Project = require './sync/project'

module.exports =
  activate: (state) ->
		@enter = new EnterFormView(state.enter)
		atom.workspaceView.command "nucleus:toggle", => @enter.toggle()
		
    @project = new Project(state.project)
		atom.workspaceView.command "nucleus:evaluate", => @project.evalSelection()

  deactivate: ->
    @enter.destroy()
		@project.destroy()

  serialize: ->
    enter: @enter.serialize()
		project: @project.serialize()