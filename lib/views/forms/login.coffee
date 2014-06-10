FormView = require './abstract_form'
{$, EditorView} = require 'atom'


class LoginFormView extends FormView
	@form: ->
		@subview 'emailInput', new EditorView(mini: true, placeholderText: 'Enter Email')
		@subview 'passwordInput', new EditorView(mini: true, placeholderText: 'Enter Password')
		
	@buttonRight: ->
		super 'LOGIN'
	
	submitRight: ->
		email = @emailInput.getText()
		password = @passwordInput.getText()
		window.nucleus.app.login(email, password)
		@detach()


module.exports = LoginFormView