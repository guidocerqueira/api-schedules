export default {
  bail: true,
  clearMocks: true,
  coverageProvider: "v8",
  testEnvironment: "node",
  testMatch: ["**/tests/*.test.ts"],
  preset: "ts-jest"
};
