// server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Simple API route (example for fake APK check)
app.get("/api/check", (req, res) => {
  // Dummy logic - later we can add real APK detection
  res.json({ status: "safe", message: "This APK looks safe ✅" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
