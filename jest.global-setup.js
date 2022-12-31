//const slsVars = require('./.serverless/output.json')
const jest_dynalite = require('jest-dynalite');

module.exports = async () => {
	//process.env.API_URL = slsVars.ApiUrl
	//console.log('API url set: ', process.env.API_URL)

	jest_dynalite.setup(__dirname);
	await jest_dynalite.startDb();
	await jest_dynalite.createTables();
  };