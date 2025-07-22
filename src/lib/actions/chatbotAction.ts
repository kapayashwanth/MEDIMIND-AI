
'use server';

import { chat, ChatInputSchema, ChatInput } from '@/ai/flows/chatbot-flow';

export type ChatbotState = {
  response?: string | null;
  error?: string | null;
};

export async function chatbotAction(
  prevState: ChatbotState,
  formData: FormData
): Promise<ChatbotState> {
  const history = formData.getAll('history').map(h => JSON.parse(h as string));
  
  const validatedFields = ChatInputSchema.safeParse({
    history: history.map(h => ({ role: h.role, content: [{ text: h.text }] })),
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
