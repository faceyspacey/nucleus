ErrorMessages = {
	commitChanges: function() {
		return 'Please commit your local changes before Nucleus calls git pull.';
	},
	noAskpass: function() {
		return 'Behind the scenes we are using sudo, which requires a password. To turn off password confirmations, from the command line type "sudo visudo" and make sure the file that is opened has this line: "%sudo ALL=(ALL:ALL) NOPASSWD: ALL"';
	}
};

module.exports = ErrorMessages;