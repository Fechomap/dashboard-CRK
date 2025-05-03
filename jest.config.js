// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  };
  
  // jest.setup.js
  import '@testing-library/jest-dom';