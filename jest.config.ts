import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },

  moduleNameMapper: {
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@constants$': '<rootDir>/constants',
    '^@contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@fonts/(.*)$': '<rootDir>/public/assets/fonts/$1',
    '^@images/(.*)$': '<rootDir>/assets/images/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@mocks/(.*)$': '<rootDir>/testsConfig/__mocks__/$1',
    '^@testing/(.*)$': '<rootDir>/testsConfig/$1',
    '^@utils/(.*)$': '<rootDir>/lib/utils/$1',
  },
};

export default config;
