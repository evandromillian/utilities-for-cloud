const jest_dynalite = require('jest-dynalite');

module.exports = async () => {
  
  // Cleanup after tests
  await jest_dynalite.deleteTables();
  await jest_dynalite.stopDb();
};