// Unified response envelope builder.
// Keys map to globals/response.json. Usage: apiResponse.response('SUCCESS', data)
const responseConfig = require('../globals/response.json');

// Envelope code → real HTTP status so proxies / monitoring / agents see the truth.
// Backwards compatible: response() alone stays 200-less; send() sets the status.
const HTTP_STATUS = {
  SUCCESS:              200,
  CREATED:              201,
  ACCEPTED:             202,
  INVALID_REQUEST:      400,
  VALIDATION_ERROR:     400,
  UNAUTHORIZED:         401,
  TOKEN_EXPIRED:        401,
  FORBIDDEN:            403,
  NOT_FOUND:            404,
  CONFLICT:             409,
  TOO_MANY_REQUESTS:    429,
  RATE_LIMIT_EXCEEDED:  429,
  SERVER_ERROR:         500,
  SERVICE_UNAVAILABLE:  503,
};

function response(key, data = {}) {
  const config = responseConfig[key];
  if (!config) {
    console.error(`[apiResponse] Unknown response key: "${key}"`);
    return {
      responseCode:    -1,
      responseMessage: `Unknown response key: ${key}`,
      responseData:    { result: data },
    };
  }
  return {
    responseCode:    config.code,
    responseMessage: config.message.en,
    responseData:    { result: data },
  };
}

/**
 * Send the envelope with a real HTTP status.
 * @param {import('express').Response} res
 * @param {string} key      response.json key
 * @param {object} [data]   payload
 */
function send(res, key, data = {}) {
  const status = HTTP_STATUS[key] || 200;
  // Local BigInt → String serializer. JS Number is only safe up to 2^53-1
  // (Number.MAX_SAFE_INTEGER); a Prisma BigInt (e.g. a money amount stored in
  // minor units, or a large row count) above that boundary would silently lose
  // precision if coerced with Number(value). JSON has no native arbitrary-precision
  // numeric type, so we serialize as a string — the standard safe pattern — instead
  // of a lossy Number. DO NOT touch BigInt.prototype (global mutation breaks
  // third-party JSON output — e.g. drivers that return BigInts for counts get
  // silently coerced even outside the API envelope). Any future money field
  // should use Decimal / integer-minor-units, never Float, for the same reason.
  return res.status(status).json(JSON.parse(JSON.stringify(
    response(key, data),
    (_, value) => typeof value === 'bigint' ? value.toString() : value
  )));
}

module.exports = { response, send, HTTP_STATUS };
