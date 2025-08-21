const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// public folder ko static serve karna
app.use(express.static(path.join(__dirname, "public")));

// homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// example API (fake analysis)
app.get("/analyze", (req, res) => {
  const mockResult = {
    riskScore: Math.floor(Math.random() * 100),
    appName: "Sample Banking APK",
    version: "1.0.2",
    permissions: ["SMS", "Contacts", "Camera"],
    verdict: "Potentially Fake"
  };
  res.json(mockResult);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
