import * as searchService from '../services/searchService.js';
import { sendSuccess } from '../utils/response.js';

export async function search(req, res, next) {
  try {
    const { q } = req.query;
    const result = await searchService.globalSearch(q, req.user.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
