const path = require('path');
const lib = require('../utils');
const { cache, perfStats } = require('../config/cache');
const { createShortUrlLimiter } = require('../config/rateLimiter');

// Controller functions
const serveHomepage = (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
};

const redirectShortUrl = async (req, res) => {
  const id = req.params.id;
  
  try {
    console.log(`[Request Start] ID: ${id} | Time: ${new Date().toISOString()}`);

    // Check cache
    const cacheStart = Date.now();
    const cachedUrl = cache.get(id);
    const cacheCheckTime = Date.now() - cacheStart;
    
    if (cachedUrl) {
      perfStats.cacheHits++;
      perfStats.totalCacheTime += cacheCheckTime;
      const totalTime = Date.now() - req.startTime;
      console.log(`[Cache Hit] ID: ${id} | Cache Check: ${cacheCheckTime}ms | Total: ${totalTime}ms`);
      return res.redirect(cachedUrl);
    }

    // Query database if cache miss
    console.log(`[Cache Miss] ID: ${id} | Cache Check: ${cacheCheckTime}ms`);
    perfStats.cacheMisses++;
    
    const dbQueryStart = Date.now();
    const url = await lib.findOrigin(id);
    const dbQueryTime = Date.now() - dbQueryStart;
    perfStats.totalDBTime += dbQueryTime;
    
    if (!url) {
      console.log(`[Not Found] ID: ${id} | DB Query: ${dbQueryTime}ms`);
      return res.status(404).send("<h1>404 Not Found</h1>");
    }

    // Save to cache and redirect
    const cacheSaveStart = Date.now();
    cache.set(id, url);
    const cacheSaveTime = Date.now() - cacheSaveStart;
    
    const totalTime = Date.now() - req.startTime;
    
    console.log(`[Request Complete] ID: ${id} | ` +
      `DB Query: ${dbQueryTime}ms | ` +
      `Cache Save: ${cacheSaveTime}ms | ` +
      `Total: ${totalTime}ms`);
    
    res.redirect(url);
  } catch (err) {
    console.error(`[Error] ID: ${id} | Error: ${err.message}`);
    res.status(500).send('Internal Server Error');
  }
};

const createShortUrl = async (req, res) => {
  try {
    const url = req.query.url;
    const newID = await lib.shortUrl(url);

    // Cache warming
    cache.set(newID, url);
    console.log(`[Cache] Pre-cached ${newID}`);

    res.send(newID);
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).send('Failed to create short URL');
  }
};

// Middleware for URL validation
const validateUrl = (req, res, next) => {
  if (!req.query.url) {
    return res.status(400).send('URL parameter is required');
  }
  next();
};

module.exports = {
  serveHomepage,
  redirectShortUrl,
  createShortUrl,
  validateUrl,
  createShortUrlLimiter
};