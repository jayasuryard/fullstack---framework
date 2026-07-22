export function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendPaginated(res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  });
}

export function sendError(res, message = 'Error', statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}
