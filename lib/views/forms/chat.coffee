Firebase = require 'firebase'
FormView = require './abstract_form'
{$, EditorView} = require 'atom'


class ChatFormView extends FormView
	form: ->
		@subview 'messageInput', new EditorView(mini: true, placeholderText: 'Enter Message')
	
	buttonRight: ->
		super 'SEND MESSAGE'

  submitRight: ->
    message = @messageInput.getText()
		ref = new Firebase('https://faceyspacey.farebasio.com'+window.NUCLEUS_REPO+'/messages')
		ref.push
			user: window.NUCLEUS_USER
			message: message


module.exports = ChatFormView