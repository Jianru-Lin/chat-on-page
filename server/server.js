var Friends = new Mongo.Collection('Friends')

if (Meteor.isClient) {

	Meteor.startup(function() {
		// DEBUG ONLY
		//$('a[href="#all-user"]').click()
	})

	Session.set('showSignUpDisplay', false)

	Template.headerDisplay.helpers({
		myName: function() {
			var me = Meteor.user()
			return me ? me.profile.name : ''
		}
	})

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
					faceImage: {
						type: 'gravatar',
						hash: md5(email.toLowerCase())
					}
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

	Template.userDisplay.helpers({
		faceImageUrl: function() {
			var data = Template.currentData()
			var hash = data.profile.faceImage.hash
			return 'http://www.gravatar.com/avatar/' + hash + '?s=100&d=identicon'
		},
		canAddFriend: function() {
			if (!Meteor.user()) return false
			var data = Template.currentData()
			var myId = Meteor.userId()
			var friendId = data._id
			return !(Friends.find({myId: myId, friendId: friendId}).count() > 0)
		},
		canRemoveFriend: function() {
			if (!Meteor.user()) return false
			var data = Template.currentData()
			var myId = Meteor.userId()
			var friendId = data._id
			return Friends.find({myId: myId, friendId: friendId}).count() > 0
		}
	})

	Template.userDisplay.events({
		'click a.add-friend': function(event, instance) {
			var friendId = instance.data._id
			Meteor.call('addFriend', friendId, function(err) {
				if (err) {
					alert(err)
				}
				else {
					alert('ok')
				}
			})
		},
		'click a.remove-friend': function(event, instance) {
			var friendId = instance.data._id
			Meteor.call('removeFriend', friendId, function(err) {
				if (err) {
					alert(err)
				}
				else {
					alert('ok')
				}
			})
		}
	})

	Template.allFriendDisplay.helpers({
		allFriend: function() {
			var r = Friends.find({myId: Meteor.userId()}).fetch()
			console.log(r)
			return r
		}
	})

	Template.friendDisplay.helpers({
		faceImageUrl: function() {
			var data = Template.currentData()
			var hash = data.friendProfile.faceImage.hash
			return 'http://www.gravatar.com/avatar/' + hash + '?s=48&d=identicon'
		}
	})

	Template.chatDisplay.helpers({
		myFaceImageUrl: function() {
			var me = Meteor.user()
			if (!me) return
			var hash = me.profile.faceImage.hash
			return 'http://www.gravatar.com/avatar/' + hash + '?s=48&d=identicon'
		}
	})
}
else if (Meteor.isServer) {

	Meteor.startup(function() {

		Meteor.methods({
			addFriend: function(friendId) {
				if (!this.userId) {
					throw new Meteor.Error('invalid-operation', 'not signed in')
				}

				var myId = this.userId

				if (myId == friendId) {
					throw new Meteor.Error('invalid-operation', 'you can\'t add your self as friend')				
				}

				var alreadyFriend = Friends.find({myId: this.userId, friendId: friendId}).count() != 0
				if (alreadyFriend) {
					throw new Meteor.Error('invalid-operation', 'you are friend already')
				}

				var me = Meteor.users.find({_id: myId}).fetch()
				if (!me || me.length < 1) {
					throw new Meteor.Error('invalid-operation', 'me not found')
				}
				var myProfile = me[0].profile
				
				var friend = Meteor.users.find({_id: friendId}).fetch()
				if (!friend || friend.length < 1) {
					throw new Meteor.Error('invalid-operation', 'friend not found')					
				}
				var friendProfile = friend[0].profile

				Friends.insert({
					myId: myId,
					friendId: friendId,
					friendProfile: friendProfile
				})

				Friends.insert({
					myId: friendId,
					friendId: myId,
					friendProfile: myProfile
				})

			},
			removeFriend: function(friendId) {
				if (!this.userId) {
					throw new Meteor.Error('invalid-operation', 'not signed in')
				}

				var myId = this.userId
				Friends.remove({myId: myId, friendId: friendId})
				Friends.remove({myId: friendId, friendId: myId})
			}
		})
	})
}