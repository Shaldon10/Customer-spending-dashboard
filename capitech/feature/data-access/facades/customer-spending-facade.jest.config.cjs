module.exports = {
  rootDir: '../../..',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }],
  },
  testMatch: ['**/feature/data-access/facades/*.spec.ts'],
};
