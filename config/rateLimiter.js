const rateLimit = require('express-rate-limit');

const createShortUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Quá nhiều yêu cầu tạo link từ IP này, vui lòng thử lại sau 15 phút',
});

module.exports = { createShortUrlLimiter };