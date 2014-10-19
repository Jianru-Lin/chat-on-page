if (Meteor.isClient) {

	Session.set('showSignUpDisplay', false)

	Template.modal.helpers({
		showSignUpDisplay: function() {
			return Session.get('showSignUpDisplay');
		}
	})

	Template.signInDisplay.events({
		'click a.sign-up': function() {
			Session.set('showSignUpDisplay', true)
		}
	})

	Template.signUpDisplay.events({
		'click a.sign-in': function() {
			Session.set('showSignUpDisplay', false)
		}
	})
}