import * as aiService from '../ai/aiService.js';
import { sendSuccess } from '../utils/response.js';

export async function chat(req, res, next) {
  try {
    const { prompt, context, type } = req.body;
    const result = await aiService.generateResponse(prompt, context, type);
    sendSuccess(res, { response: result.content, usage: result.usage });
  } catch (error) {
    next(error);
  }
}

export async function streamChat(req, res, next) {
  try {
    const { prompt, context, type } = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = aiService.generateStreamingResponse(prompt, context, type);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
}
