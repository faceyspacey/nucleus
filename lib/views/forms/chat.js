Firebase = require 'firebase'
FormView = require './abstract_form'


class ChatFormView extends FormView
	@form: ->
		@subview 'messageInput', new EditorView(mini: true, placeholderText: 'Enter Message')
	
	buttonRight: ->
		super 'SEND MESSAGE'

  submitRight: ->
    message = @messageInput.getText()
		ref = new Firebase('https://faceyspacey.farebasio.com'+repo+'/messages')
		ref.push(message);


module.exports = ChatFormView