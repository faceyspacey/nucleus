FormView = require './abstract_form'
{$, EditorView} = require 'atom'


class ChatFormView extends FormView
	@form: ->
		@subview 'messageInput', new EditorView(mini: true, placeholderText: 'Enter Message')
		
	@buttonRight: ->
		super 'SEND MESSAGE'
	
	submitRight: ->
		message = @messageInput.getText()
		window.nucleus.workspace.newMessage(message)
		@messageInput.val('')
		@detach()


module.exports = ChatFormView