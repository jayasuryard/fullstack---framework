// Unified response envelope builder.
// Keys map to globals/response.json. Usage: apiResponse.response('SUCCESS', data)
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
