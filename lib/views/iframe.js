{View} = require 'atom'


class IframeView extends View
  @content: ->
    @div class: 'nucleus-frame tool-panel panel-right', =>
      @div class: 'block', =>
        @button class: 'btn close-button', outlet: 'closeButton', 'Close Nucleus', =>
      @iframe class: 'web-frame', outlet: 'iframe', =>
      @div class: 'block', =>
        @button class: 'btn refresh-button', outlet: 'refreshButton', 'Refresh App'

  initialize: (serializeState) ->
    @closeButton.on 'click', => @detach()
    @refreshButton.on 'click', => @refresh() 

  refresh: ->
    if @hasParent()
      @iframe[0].contentDocument.location.reload()

  toggle: (url) ->
    if @hasParent()
      @detach()
    else
      if url
        @iframe.attr('src', url)
        atom.workspaceView.appendToRight(this)


module.exports = IframeView
