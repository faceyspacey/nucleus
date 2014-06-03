FormView = require './abstract_form'
IframeView = require './iframe'


class EnterFormView extends FormView
	@form: ->
		@subview 'nameInput', new EditorView(mini: true, placeholderText: 'Enter User Name')
		@subview 'dirInput', new EditorView(mini: true, placeholderText: 'Enter Local Directory')
		@subview 'githubInput', new EditorView(mini: true, placeholderText: 'Enter Github Repo URL')
		@subview 'hostInput', new EditorView(mini: true, placeholderText: 'Enter Local Host URL')
		@subview 'mongoInput', new EditorView(mini: true, placeholderText: 'Enter Mongo URL')
		
	buttonRight: ->
		super 'ENTER NUCLEUS'

  submitRight: ->
    url = @hostInput.getText()

		@iframe = @iframe || new IframeView()
    @iframe.toggle(url)

    super


module.exports = EnterFormView