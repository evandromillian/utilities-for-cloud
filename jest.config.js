module.exports = {
	preset: 'ts-jest',	
	collectCoverage: true,
	globalSetup: './jest.global-setup.js',
	globalTeardown: './jest.global-teardown.js',
}