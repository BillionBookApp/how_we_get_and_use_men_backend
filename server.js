// server.js

// server.js

const app = require('./app');

const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 5000 : undefined);

if (!PORT) {
  throw new Error("❌ Railway did not provide PORT. App cannot start.");
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
