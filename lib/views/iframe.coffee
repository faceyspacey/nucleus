{View} = require 'atom'


class IframeView extends View
	@content: ->
		sandbox = 'allow-forms allow-same-origin allow-pointer-lock allow-popups allow-scripts allow-top-navigation'
		@div class: 'nucleus-frame tool-panel panel-right', =>
			@div class: 'block', =>
				@button class: 'btn close-button', outlet: 'closeButton', 'Close App', =>
			@iframe class: 'web-frame', outlet: 'iframe', sandbox: sandbox, =>
			@div class: 'block', =>
				@button class: 'btn refresh-button', outlet: 'refreshButton', 'Refresh'
					
	initialize: (serializeState) ->
		@closeButton.on 'click', => @remove()
		@refreshButton.on 'click', => @refresh()
		
	refresh: ->
		@iframe[0].contentDocument.location.reload()

	toggle: (url) ->
		if @hasParent()
			@detach()
		else
			@attach(url)

	attach: (url) ->
		@setUrl(url) if url
		console.log('FROM IframeView', url, this)
		atom.workspaceView.appendToRight(this)
		
	setUrl: (url) ->
		@iframe.attr('src', url)

module.exports = IframeView