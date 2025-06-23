const express = require('express');
const app = express();

// ==============================================
// App Settings & Configuration
// ==============================================

// Trust proxy configuration for deployment environments (Render, etc.)
// Enables proper handling of X-Forwarded-* headers from reverse proxies
app.set('trust proxy', 1);

// Routing configuration for consistent URL handling
app.set('case sensitive routing', true);
app.set('strict routing', true);

// ==============================================
// Middleware Stack
// ==============================================

// Core body parsing middleware
app.use(express.json());

// TODO: Add security middleware (helmet)
// TODO: Add CORS configuration
// TODO: Add request logging (morgan)
// TODO: Add rate limiting
// TODO: Add static file serving

// ==============================================
// Routes
// ==============================================

// Health check endpoint
app.get('/', (req, res) => res.send('Backend is running'));

// TODO: Add API routes
// TODO: Add authentication routes
// TODO: Add webhook routes

// ==============================================
// Server Configuration
// ==============================================

// Match Render's port or local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
