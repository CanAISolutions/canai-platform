// TODO: Replace with real Memberstack auth in production
export default function auth(req, res, next) {
  // For now, allow all requests
  next();
} 