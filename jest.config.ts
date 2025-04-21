import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@constants$': '<rootDir>/constants',
    '^@contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@fonts/(.*)$': '<rootDir>/public/assets/fonts/$1',
    '^@images/(.*)$': '<rootDir>/assets/images/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@test-utils/(.*)$': '<rootDir>/test-utils/$1',
    '^@utils/(.*)$': '<rootDir>/lib/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^styled-components$': '<rootDir>/node_modules/styled-components',
  },
  testMatch: ['**/components/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(styled-components|@babel/runtime)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};

export default config;
