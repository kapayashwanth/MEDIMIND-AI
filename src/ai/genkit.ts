
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Explicitly get the API key from the environment variables.
// Next.js loads variables from the .env file into process.env for server-side code.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    'CRITICAL: GEMINI_API_KEY is not defined in the environment. ' +
    'Genkit AI features will likely fail. Make sure the key is set in your .env file ' +
    'and the Next.js server process has access to it.'
  );
  // Note: If the API key is essential for the application to function,
  // you might consider throwing an error here to halt server startup.
  // For now, we'll let it proceed, and AI calls will likely fail if the key is missing,
  // which should ideally be caught by the server actions' error handling.
}

export const ai = genkit({
  plugins: [
    // Pass the apiKey to the googleAI plugin configuration.
    // If apiKey is undefined here, the googleAI plugin will likely throw an error
    // when an actual API call is attempted, which should be caught by server actions.
    googleAI({ apiKey: apiKey })
  ],
  model: 'googleai/gemini-1.5-flash', // Default model to use for ai.generate calls
});
