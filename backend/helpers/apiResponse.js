// Unified response envelope builder.
// Source: Product/backend/helpers/apiResponse.js
const responseConfig = require('../globals/response.json');

function response(key, data = {}) {
  const config = responseConfig[key];
  return {
    responseCode:    config.code,
    responseMessage: config.message.en,
    responseData:    { result: data },
  };
}

module.exports = { response };
