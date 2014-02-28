{View, EditorView} = require 'atom'
Firebase = require 'firebase'
Firepad = require './firepad-lib'

class ShareView extends View
  @content: ->
    @div class: 'firepad overlay from-bottom', =>
      @div 'This file is being shared', class: 'message'

  show: ->
    atom.workspaceView.append(this)

module.exports =
class FirepadView extends View
  @activate: -> new FirepadView

  @content: ->
    @div class: 'firepad overlay from-top mini', =>
      @subview 'miniEditor', new EditorView(mini: true)
      @div class: 'message', outlet: 'message'

  detaching: false

  initialize: ->
    atom.workspaceView.command 'firepad:share', => @share()
    atom.workspaceView.command 'firepad:unshare', => @unshare()

    @miniEditor.hiddenInput.on 'focusout', => @detach() unless @detaching
    @on 'core:confirm', => @confirm()
    @on 'core:cancel', => @detach()

    @miniEditor.preempt 'textInput', (e) =>
      false unless e.originalEvent.data.match(/[a-zA-Z0-9\-]/)

  detach: ->
    return unless @hasParent()
    @detaching = true
    @miniEditor.setText('')
    super
    @detaching = false

  share: ->
    if editor = atom.workspace.getActiveEditor()
      atom.workspaceView.append(this)
      @message.text('Enter a string to identify this share session')
      @miniEditor.focus()

  confirm: ->
    shareId = @miniEditor.getText()
    @detach()
    @ref = new Firebase('https://atom-firepad.firebaseio.com').child(shareId);
    @pad = Firepad.fromAtom @ref, atom.workspace.getActiveEditor(), {sv_: Firebase.ServerValue.TIMESTAMP}
    @view = new ShareView()
    @view.show(shareId)

  unshare: ->
    @pad.dispose()
    @view.detach()
