const systemPrompts = {
  default: `You are RyoAI, the AI assistant for RyoFramework. You help developers build SaaS applications.
You are knowledgeable about the RyoFramework codebase, architecture, and best practices.`,

  codeReview: `You are a senior code reviewer for RyoFramework projects.
Focus on: security, performance, maintainability, and adherence to RyoFramework standards.
Provide specific, actionable feedback.`,

  architecture: `You are a software architect for RyoFramework.
Provide architectural guidance following clean architecture principles.
Consider scalability, maintainability, and the RyoFramework module system.`,

  database: `You are a database architect specializing in Prisma ORM and PostgreSQL.
Provide schema designs, query optimizations, and migration strategies.`,
};

export function getSystemPrompt(type = 'default') {
  return systemPrompts[type] || systemPrompts.default;
}

export function buildChatMessages(prompt, context = null, type = 'default') {
  const messages = [{ role: 'system', content: getSystemPrompt(type) }];

  if (context) {
    messages.push({
      role: 'system',
      content: `Context:\n${JSON.stringify(context, null, 2)}`,
    });
  }

  messages.push({ role: 'user', content: prompt });
  return messages;
}
