{$, EditorView, View} = require 'atom'
{$, EditorView} = require 'atom'


class FormView extends View
  @content: ->
    @div class: 'overlay nucleus-form from-top mini', =>
    	@form()
      @buttonLeft	buttonName
			@buttonRight buttonName

	buttonLeft: (buttonName) ->
		return unless buttonName
		
		@div class: 'pull-left', =>
			@button class: 'btn btn-xs', outlet: 'leftButton', buttonName
			
	buttonRight: (buttonName) ->
		return unless buttonName
		
		@div class: 'pull-right', =>
			@button class: 'btn btn-xs', outlet: 'rightButton', buttonName
			
  initialize: ->
		@leftButton.on 'click', => @submitLeft()
		@rightButton.on 'click', => @submitRight()
    
		@on 'core:confirm', => @submitRight()
		@on 'core:cancel', => @detach()


	submitLeft: ->
		@detach()
		
	submitRight: ->
		@detach()
		
  toggle: ->
    if @hasParent()
      @detach()
    else
      @attach()

  attach: ->
    atom.workspaceView.append(this)
    $('.nucleus-form input').first().focus();

	detach: ->
		super
		
	serialize: ->
	

module.exports = FormView