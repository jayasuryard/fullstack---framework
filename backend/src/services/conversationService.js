import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { aiProvider } from '../ai/provider.js';

export async function createConversation(userId, title) {
  return prisma.conversation.create({
    data: { userId, title: title || 'New conversation' },
  });
}

export async function listConversations(userId) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  });
}

export async function getConversation(conversationId, userId) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conversation) throw ApiError.notFound('Conversation not found');
  return conversation;
}

export async function deleteConversation(conversationId, userId) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conversation) throw ApiError.notFound('Conversation not found');
  await prisma.conversation.delete({ where: { id: conversationId } });
}

export async function sendMessage(conversationId, userId, content) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conversation) throw ApiError.notFound('Conversation not found');

  await prisma.message.create({
    data: { conversationId, role: 'user', content },
  });

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  const response = await aiProvider.chat(messages);

  const assistantMsg = await prisma.message.create({
    data: {
      conversationId,
      role: 'assistant',
      content: response.content,
      tokens: response.usage?.total_tokens,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { title: history.length === 1 ? content.slice(0, 100) : undefined },
  });

  return { message: assistantMsg, usage: response.usage };
}

export async function* streamMessage(conversationId, userId, content) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conversation) throw ApiError.notFound('Conversation not found');

  await prisma.message.create({
    data: { conversationId, role: 'user', content },
  });

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  let fullContent = '';

  for await (const chunk of aiProvider.streamChat(messages)) {
    fullContent += chunk;
    yield chunk;
  }

  await prisma.message.create({
    data: { conversationId, role: 'assistant', content: fullContent },
  });
}
