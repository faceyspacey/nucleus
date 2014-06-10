{$, EditorView, View} = require 'atom'


class FormView extends View
	@content: ->
		@div class: "overlay nucleus-form from-top mini", =>
			@form()
			@buttonLeft()
			@buttonRight()
			
	@buttonLeft: (buttonName) ->
		return unless buttonName
		@div class: 'pull-left', =>
			@button class: 'btn btn-xs', outlet: 'leftButton', buttonName
			
	@buttonRight: (buttonName) ->
		return unless buttonName
		
		@div class: 'pull-right', =>
			@button class: 'btn btn-xs', outlet: 'rightButton', buttonName
	
	initialize: ->
		if @leftButton
			@leftButton.on 'click', => @submitLeft()
		
		if @rightButton
			@rightButton.on 'click', => @submitRight()
    
		@on 'core:confirm', => @submitRight()
		@on 'core:cancel', => @detach()
		
	attach: ->
		atom.workspaceView.append(this)
		$('.nucleus-form input').first().focus()
	
	detach: ->
		super
		
	submitLeft: ->
		@detach()
		
	submitRight: ->
		@detach()
		
  toggle: ->
    if @hasParent()
      @detach()
    else
      @attach()


	serialize: ->
	

module.exports = FormView