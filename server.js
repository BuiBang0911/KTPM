const express = require('express');
const setupMiddleware = require('./config/middleware');
const { 
  serveHomepage,
  redirectShortUrl,
  createShortUrl,
  validateUrl,
  createShortUrlLimiter
} = require('./controller/shortUrlController');
const { logPerformance } = require('./config/cache');

const app = express();
const port = 3001;

// Setup middleware
setupMiddleware(app);

// Routes
app.get('/', serveHomepage);
app.get('/short/:id', redirectShortUrl);
app.post('/create', validateUrl, createShortUrlLimiter, createShortUrl);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Log performance every 30 minutes
setInterval(logPerformance, 30 * 60 * 1000);

app.listen(port, () => {
  console.log(`
  Ứng dụng đang chạy tại: http://localhost:${port}
  Endpoints:
    - GET  /short/:id    - Redirect
    - POST /create?url=  - Tạo short URL (rate limited)
  `);
});