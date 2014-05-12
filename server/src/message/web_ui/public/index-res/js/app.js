var config = get_local_obj('config')
if (config) {
	id('email').value = config.email
}

on_click(id('enter-bt'), function() {
	var email = id('email').value
	set_local_obj('config', {email: email})

	if (!email) return

	// jump
	redirect_to('/channel')
})

on_click(id('clear-bt'), function() {
	remove_local_obj('config')
	id('email').value = ''
})