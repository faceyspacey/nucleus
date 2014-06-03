Firebase = require 'firebase'
FormView = require './abstract_form'


class LoginFormView extends FormView
	@form: ->
		@subview 'emailInput', new EditorView(mini: true, placeholderText: 'Enter Email')
		@subview 'passwordInput', new EditorView(mini: true, placeholderText: 'Enter Password')
	
	buttonRight: ->
		super 'LOGIN'

  submitRight: ->
		email = @emailInput.getText()
		password = @passwordInput.getText()
		
    $('iframe.nucleus-frame')[0].contentWindow.Meteor.loginWithPassword(email, password)

		ref = new Firebase('https://faceyspacey.farebasio.com'+repo+'/events')
		ref.push({
			object: 'Meteor',
			method: 'loginWithPassword'
			arguments: [email, password]
		});


module.exports = LoginFormView