const rateLimits = new Map();
const WINDOW = 60 * 1000; // 1 minute
const LIMIT = 100;

export default function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, []);
  }
  const timestamps = rateLimits.get(ip).filter(ts => now - ts < WINDOW);
  if (timestamps.length >= LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  timestamps.push(now);
  rateLimits.set(ip, timestamps);
  next();
} 