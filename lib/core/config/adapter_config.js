module.exports = {
	Workspace: require('./atom/workspace_adapter'), //:) fuck the world!
	File: require('./atom/file_adapter'), //one more time for good measure
	App: require('../app/meteor/app_adapter'), //and we are the king of decoupling/indirection
	
	DB: require('./firebase/database_adapter'), //firebase is expensive ;)
	db_host: 'https://faceyspacey.firebaseio.com'
};