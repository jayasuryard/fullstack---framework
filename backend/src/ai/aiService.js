import { aiProvider } from './provider.js';
import { buildChatMessages, getSystemPrompt } from './promptManager.js';

export async function generateResponse(prompt, context = null, type = 'default') {
  const messages = buildChatMessages(prompt, context, type);
  return aiProvider.chat(messages);
}

export async function* generateStreamingResponse(prompt, context = null, type = 'default') {
  const messages = buildChatMessages(prompt, context, type);
  yield* aiProvider.streamChat(messages);
}

export async function codeReview(code, language = 'javascript') {
  const prompt = `Review the following ${language} code and provide feedback:\n\n\`\`\`${language}\n${code}\n\`\`\``;
  return generateResponse(prompt, null, 'codeReview');
}

export async function generateSchema(description) {
  const prompt = `Generate a Prisma schema for the following requirements:\n\n${description}\n\nReturn only the Prisma schema code.`;
  return generateResponse(prompt, null, 'database');
}
