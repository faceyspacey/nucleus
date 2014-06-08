module.exports = {
	Workspace: require('../adapters/workspace/atom/workspace_adapter'), //:) fuck the world!
	File: require('../adapters/workspace/atom/file_adapter'), //one more time for good measure
	App: require('../adapters/app/meteor/app_adapter'), //and we are the king of decoupling/indirection

	DB: require('../adapters/database/firebase/db_adapter'), //firebase is expensive ;)
	db_host: 'https://faceyspacey.firebaseio.com'
};
