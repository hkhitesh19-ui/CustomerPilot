import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => {
  // Establish API mocking before all tests.
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  // Reset any runtime request handlers added during tests.
  server.resetHandlers();
});

afterAll(() => {
  // Clean up once the tests are finished.
  server.close();
});
