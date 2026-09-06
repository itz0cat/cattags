module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/dist/__tests__/**/*.test.js'],
  verbose: true,
  moduleNameMapper: {
    '^better-auth$': '<rootDir>/src/__mocks__/better-auth.js',
    '^better-auth/node$': '<rootDir>/src/__mocks__/better-auth-node.js',
    '^better-auth/plugins$': '<rootDir>/src/__mocks__/better-auth-plugins.js',
    '^better-auth/adapters/memory$': '<rootDir>/src/__mocks__/better-auth-memory.js',
    '^kysely$': '<rootDir>/src/__mocks__/kysely.js'
  }
};
