// Input validation middleware (zod).
// Usage:
//   const { validateBody, z } = require('../../../middleware/validate');
//   router.post('/login', validateBody(z.object({ userName: z.string() })), handler);
// Invalid payload → 400 + VALIDATION_ERROR envelope. Parsed data replaces req.body.
const { z } = require('zod');
const apiResponse = require('../helpers/apiResponse');

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
        .join('; ');
      return apiResponse.send(res, 'VALIDATION_ERROR', { message });
    }
    req.body = parsed.data;
    return next();
  };
}

module.exports = { validateBody, z };
