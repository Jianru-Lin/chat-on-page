if (Meteor.isClient) {

	Meteor.startup(function() {
		// DEBUG ONLY
		$('a[href="#all-user"]').click()
	})

	Session.set('showSignUpDisplay', false)

	Template.headerDisplay.events({
		'click a.sign-out': function(event, instance) {
			Meteor.logout()
		}
	})

	Template.modalDisplay.helpers({
		showSignUpDisplay: function() {
			return Session.get('showSignUpDisplay');
		}
	})

	Template.signInDisplay.events({
		'click .btn-primary': function(event, instance) {
			var email = instance.$('input.email').val()
			var password = instance.$('input.password').val()

			Meteor.loginWithPassword({email: email}, password, function(err) {
				if (err) {
					alert(err)
				}
				else {
					// clear info
					instance.$('input.email').val('')
					instance.$('input.password').val('')

					$('#modal').modal('hide')
				}
			})
		},
		'click a.sign-up': function() {
			Session.set('showSignUpDisplay', true)
		}
	})

	Template.signUpDisplay.events({
		'click .btn-primary': function(event, instance) {
			var name = instance.$('input.name').val()
			var email = instance.$('input.email').val()
			var password = instance.$('input.password').val()

			Accounts.createUser({
				email: email,
				password: password,
				profile: {
					email: email,
					name: name,
					faceImageUrl: gravatar(email)
				}
			}, function(err) {
				if (err) {
					alert(err)
				} else {
					// clear info
					instance.$('input.name').val('')
					instance.$('input.email').val('')
					instance.$('input.password').val('')

					$('#modal').modal('hide')
				}
			})
		},
		'click a.sign-in': function() {
			Session.set('showSignUpDisplay', false)
		}
	})

	Template.allUserDisplay.helpers({
		allUser: function() {
			return Meteor.users.find()
		}
	})

	function gravatar(email) {
		email = email || '';
		email = email.toLowerCase();
		var hash = md5(email);
		return 'http://www.gravatar.com/avatar/' + hash + '?s=50&d=identicon';
	}
}