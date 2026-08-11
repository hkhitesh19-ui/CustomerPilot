import { setupServer } from 'msw/node';
import { googleHandlers } from './handlers/google';
import { evolutionHandlers } from './handlers/evolution';

export const server = setupServer(...googleHandlers, ...evolutionHandlers);
