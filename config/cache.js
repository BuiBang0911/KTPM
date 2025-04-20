const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 30,
  checkperiod: 30,
  maxKeys: 100000
});

const perfStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  totalDBTime: 0,
  totalCacheTime: 0
};

function logPerformance() {
  const avgDBTime = perfStats.cacheMisses > 0 
    ? (perfStats.totalDBTime / perfStats.cacheMisses).toFixed(2) + 'ms'
    : 'N/A';
  
  const avgCacheTime = perfStats.cacheHits > 0
    ? (perfStats.totalCacheTime / perfStats.cacheHits).toFixed(2) + 'ms'
    : 'N/A';

  const hitRate = perfStats.totalRequests > 0
    ? ((perfStats.cacheHits / perfStats.totalRequests) * 100).toFixed(2) + '%'
    : '0%';

  console.log(`
  ========== Performance Report ==========
  Total Requests:     ${perfStats.totalRequests}
  Cache Hits:         ${perfStats.cacheHits}
  Cache Misses:       ${perfStats.cacheMisses}
  Cache Hit Rate:     ${hitRate}
  Avg DB Time:        ${avgDBTime}
  Avg Cache Time:     ${avgCacheTime}
  Current Cache Size: ${cache.keys().length}
  ========================================
  `);
}

module.exports = { cache, perfStats, logPerformance };