// server.js

// server.js

const app = require('./app');

// Prefer Railway's PORT, fallback to 5000 only in dev mode
const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 5000 : undefined);

// Fail loudly if no port is set
if (!PORT) {
  throw new Error("❌ Railway did not provide PORT. App cannot start.");
}

// ✅ IMPORTANT: Bind to 0.0.0.0 (not localhost) for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
