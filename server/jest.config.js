module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testTimeout: 10000, // Increase the global timeout to 10 seconds
  maxWorkers: 1 // Run tests sequentially to avoid connection issues
};
