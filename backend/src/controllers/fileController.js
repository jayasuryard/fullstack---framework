import * as fileService from '../services/fileService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export async function uploadFile(req, res, next) {
  try {
    const file = await fileService.uploadFile(req.user.id, req.file);
    sendSuccess(res, { file }, 'File uploaded', 201);
  } catch (error) {
    next(error);
  }
}

export async function listFiles(req, res, next) {
  try {
    const result = await fileService.listFiles(req.user.id, req.query);
    sendPaginated(res, result.files, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function deleteFile(req, res, next) {
  try {
    await fileService.deleteFile(req.user.id, req.params.id);
    sendSuccess(res, null, 'File deleted');
  } catch (error) {
    next(error);
  }
}
