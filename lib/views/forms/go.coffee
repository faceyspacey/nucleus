Firebase = require 'firebase'
FormView = require './abstract_form'
{$, EditorView} = require 'atom'


class GoFormView extends FormView
	form: ->
		@subview 'routeInput', new EditorView(mini: true, placeholderText: 'Enter Route')
		
	buttonLeft: ->
		super 'Router'
			
	buttonRight: ->
		super 'MobiRouter'

	submitLeft: ->
		sendEvent('Router')
		
	submitRight: ->
		sendEvent('MobiRouter')
		
  sendEvent: (routerType)->
		ref = new Firebase('https://faceyspacey.farebasio.com'+window.NUCLEUS_REPO+'/events')
		ref.push({
			object: routerType,
			method: 'go'
			arguments: [@routeInput.getText()]
		});


module.exports = GoFormView