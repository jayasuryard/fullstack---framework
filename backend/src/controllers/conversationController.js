import * as conversationService from '../services/conversationService.js';
import { sendSuccess } from '../utils/response.js';

export async function create(req, res, next) {
  try {
    const conversation = await conversationService.createConversation(req.user.id, req.body.title);
    sendSuccess(res, { conversation }, 'Conversation created', 201);
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const conversations = await conversationService.listConversations(req.user.id);
    sendSuccess(res, { conversations });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const conversation = await conversationService.getConversation(req.params.id, req.user.id);
    sendSuccess(res, { conversation });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await conversationService.deleteConversation(req.params.id, req.user.id);
    sendSuccess(res, null, 'Conversation deleted');
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    const result = await conversationService.sendMessage(req.params.id, req.user.id, content);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function streamMessage(req, res, next) {
  try {
    const { content } = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = conversationService.streamMessage(req.params.id, req.user.id, content);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
}
