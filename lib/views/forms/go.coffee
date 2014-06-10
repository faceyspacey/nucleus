FormView = require './abstract_form'
{$, EditorView} = require 'atom'


class GoFormView extends FormView
	@form: ->
		@subview 'routeInput', new EditorView(mini: true, placeholderText: 'Enter Route')
		
	@buttonLeft: ->
		super 'Router'
	
	@buttonRight: ->
		super 'MobiRouter'

	submitLeft: ->
		window.nucleus.app.go('Router', [@routeInput.getText()])
		@detach()
		
	submitRight: ->
		window.nucleus.app.go('MobiRouter', [@routeInput.getText()])
		@detach()

module.exports = GoFormView