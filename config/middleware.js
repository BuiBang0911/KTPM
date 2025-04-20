const helmet = require('helmet');
const compression = require('compression');
const express = require('express');
const path = require('path');
const { perfStats } = require('./cache');

function setupMiddleware(app) {
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    req.startTime = Date.now();
    perfStats.totalRequests++;
    next();
  });
}

module.exports = setupMiddleware;