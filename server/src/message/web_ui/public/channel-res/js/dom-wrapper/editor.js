// ----- OneLineEditorDW -----

function OneLineEditorDW(dom, binding) {
	this.dom = dom
	this.binding = binding
	this.event_handler = {
		on_click_send: empty,
		on_switch_editor: empty
	}

	var self = this

	if (dom) {

		on_click(dom.querySelector('button.send'), function() {
			self.event_handler.on_click_send(self)
		})

	    on_click(dom.querySelector('.switch-editor'), function() {
	    	self.event_handler.on_switch_editor()
	    })

		// support ctrl+enter shortcut

		on_keydown(dom, function(e) {
			// ctrl+enter
			if (!(e.ctrlKey && e.keyCode === 13)) return
			self.event_handler.on_click_send(self)
		})

		on_keydown(dom.querySelector('.content textarea'), function(e) {
			if (e.keyCode === 13) {
				var value = self.dom.querySelector('.content textarea').value
				if (/^\s*hello\s*turing\s*$/i.test(value)) {
					self.event_handler.on_switch_editor(self)
					e.preventDefault()
					return
				}

				self.event_handler.on_click_send(self)
				e.preventDefault()
			}
		})
	}
}

OneLineEditorDW.prototype.get_content = function() {
	var value = this.dom.querySelector('.content textarea').value

	return {
		type: 'text',
		value: value
	}
}

OneLineEditorDW.prototype.clear_content = function() {
	this.dom.querySelector('.content textarea').value = ''
}

OneLineEditorDW.prototype.focus = function() {
	this.dom.querySelector('.content textarea').focus()
}

// ----- EditorDW -----

function CodeEditorDW(dom, binding) {
	var self = this

	this.dom = dom
	this.binding = binding
	this.event_handler = {
		on_click_send: function() {},
		on_switch_editor: function() {}
	}

	var select = dom.querySelector('select')

	on_click(dom.querySelector('button'), function() {
		self.event_handler.on_click_send(self)
	})

    on_click(dom.querySelector('.switch-editor'), function() {
    	self.event_handler.on_switch_editor()
    })

    on_change(select, function(e) {
    	var mode = 'ace/mode/' + (select.value)
    	self.mode = (select.value)
    	self.editor.getSession().setMode(mode)
    })

    var editor = this.editor = ace.edit(dom.querySelector('.ace-editor'))
    editor.setTheme('ace/theme/monokai')
    editor.setFontSize(16)
    editor.getSession().setMode('ace/mode/text')
    self.mode = 'text'

    select.querySelector('option[value=text]').setAttribute('selected', 'true')
}

CodeEditorDW.prototype.get_content = function() {
	var editor = this.editor
	var mode = this.mode
	var text = editor.getValue()

	return {
		type: 'code',
		mode: mode,
		value: text
	}
}

CodeEditorDW.prototype.clear_content = function() {
	this.editor.setValue('')
}

CodeEditorDW.prototype.focus = function() {
	this.editor.focus()
}

// ----- EditorDW -----

function EditorDW(dom, binding) {
	var self = this

	this.event_handler = {
		on_click_send: function() {}
	}

	this.one_line_editor = new OneLineEditorDW(dom.querySelector('.one-line-editor'), binding)
	this.one_line_editor.event_handler = {
		on_click_send: function() {
			self.event_handler.on_click_send.apply(self, arguments)
		},
		on_switch_editor: function() {
			add_class(dom.querySelector('.one-line-editor'), 'none')
			remove_class(dom.querySelector('.code-editor'), 'none')
			setTimeout(function(){
				bring_into_view(dom)

				setTimeout(function() {
					self.code_editor.focus()
				},0)

			})
		}
	}

	this.code_editor = new CodeEditorDW(dom.querySelector('.code-editor'), binding)
	this.code_editor.event_handler = {
		on_click_send: function() {
			self.event_handler.on_click_send.apply(self, arguments)
		},
		on_switch_editor: function() {
			add_class(dom.querySelector('.code-editor'), 'none')
			remove_class(dom.querySelector('.one-line-editor'), 'none')
			setTimeout(function(){
				bring_into_view(dom)

				setTimeout(function() {
					self.one_line_editor.focus()
				}, 0)

			})
		}
	}

	this.current_editor = this.one_line_editor
}

EditorDW.prototype.get_content = function() {
	return this.current_editor.get_content()
}

EditorDW.prototype.clear_content = function() {
	return this.current_editor.clear_content()
}