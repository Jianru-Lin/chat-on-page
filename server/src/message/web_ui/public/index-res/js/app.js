var config = get_local_obj('config')
if (config && config.author) {
	var author = config.author
	id('name').value = author.name || ''
	id('email').value = author.email || ''
}

on_click(id('enter-bt'), function() {
	var name = id('name').value
	var email = id('email').value

	if (!email) {
		id('email').focus()
		return
	}

	if (!name) {
		id('name').focus()
		return
	}

	set_local_obj('config', {
		author: {
			name: name, 
			email: email
		}
	})

	// jump
	redirect_to('/channel/intro')
})

on_click(id('clear-bt'), function() {
	remove_local_obj('config')
	id('email').value = ''
	id('name').value = ''
})