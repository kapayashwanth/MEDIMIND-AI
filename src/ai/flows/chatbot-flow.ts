
'use server';

/**
 * @fileOverview A conversational AI agent for the chatbot.
 *
 * - chat - A function that handles the chatbot conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the public-facing 'chat' function
const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })),
  message: z.string().describe('The latest message from the user.'),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

// Input schema for the internal prompt, which needs the isUser boolean
const ChatPromptInputSchema = z.object({
  history: z.array(z.object({
    isUser: z.boolean(),
    text: z.string(),
  })),
  message: z.string().describe('The latest message from the user.'),
});

// Output schema for both the flow and the public function
const ChatOutputSchema = z.object({
  response: z.string().describe('The AI model\'s response to the user.'),
});
type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Map the public input to the structure the prompt expects
  const promptInput = {
    history: input.history.map(h => ({
      isUser: h.role === 'user',
      text: h.content[0].text,
    })),
    message: input.message,
  };
  return chatFlow(promptInput);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatPromptInputSchema }, // Use the internal schema with the boolean
  output: { schema: ChatOutputSchema },
  system: `You are a friendly and helpful AI assistant for the MediMind AI application.
Your role is to assist users with their questions about the app's features or general health topics.
Keep your answers concise and helpful.

The app's features are:
- Medical Report Analysis: Users can upload medical reports (like X-rays or lab results) for an AI-powered summary of key findings.
- Prescription Interpretation: Users can upload a prescription to understand what the medications are for and their common side effects.
- Medicine Search: Users can search for information about specific medications.
- Medicine by Disease: Users can list diseases and get suggestions for medications.
- Book Appointment: Users can book a (simulated) doctor's appointment.

When asked about medical topics, ALWAYS include a disclaimer that you are an AI assistant and not a medical professional, and the user should consult with a doctor.
`,
  prompt: `Based on the following conversation history and the new user message, provide a helpful response.

{{#each history}}
  {{#if isUser}}
User: {{{text}}}
  {{else}}
Model: {{{text}}}
  {{/if}}
{{/each}}
User: {{{message}}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatPromptInputSchema, // Flow now uses the internal schema
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output;

    if (!output) {
      return { response: "I'm sorry, I couldn't generate a response. Please try again." };
    }

    return {
      response: output.response,
    };
  }
);
