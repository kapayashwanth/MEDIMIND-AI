
'use server';

import { chat } from '@/ai/flows/chatbot-flow';
import { z } from 'zod';

export type ChatbotState = {
  response?: string | null;
  error?: string | null;
};

// Define the schema inside the action file, as it's the only place it's used for validation.
const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })),
  message: z.string().min(1, "Message cannot be empty."),
});

export async function chatbotAction(
  prevState: ChatbotState,
  formData: FormData
): Promise<ChatbotState> {
  const history = formData.getAll('history').map(h => {
      const parsed = JSON.parse(h as string);
      return { role: parsed.role, content: [{ text: parsed.text }]};
  });
  
  const validatedFields = ChatInputSchema.safeParse({
    history: history,
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.flatten().fieldErrors.message?.[0] || 'Invalid input.';
    return {
      error: errorMessage,
      response: null,
    };
  }
  
  try {
    // The `chat` function still expects the same input structure, but we don't need to import the type.
    const result = await chat(validatedFields.data);
    return {
      response: result.response,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      error: `Server error: ${errorMessage}`,
      response: null,
    };
  }
}
