const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Public folder serve karna (jaha index.html, css, js rakha hai)
app.use(express.static(path.join(__dirname, "public")));

// Default route -> index.html serve karega
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
