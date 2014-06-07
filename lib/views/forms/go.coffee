Firebase = require 'firebase'
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
		window.app.go('Router', [@routeInput.getText()])
		
	submitRight: ->
		window.app.go('MobiRouter', [@routeInput.getText()])

module.exports = GoFormView