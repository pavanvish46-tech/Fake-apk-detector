const express = require("express");
const multer = require("multer");
const ApkReader = require("apk-parser3");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Temporary in-memory DB (later you can use MongoDB)
const userChecks = new Map(); // { userId: true/false }

// Multer setup for APK upload
const upload = multer({ dest: "uploads/" });

// Upload endpoint
app.post("/upload/:userId", upload.single("apkFile"), async (req, res) => {
  try {
    const userId = req.params.userId;

    // ❌ Already checked
    if (userChecks.get(userId)) {
      return res.status(403).json({
        message: "❌ You have already checked an APK. Only 1 check allowed.",
      });
    }

    const filePath = req.file.path;

    // Parse the APK
    const reader = await ApkReader.open(filePath);
    const manifest = await reader.readManifest();

    // Example scoring logic (fake detector)
    let score = 0;
    let reasons = [];

    if (!manifest.package) {
      score += 50;
      reasons.push("Missing package name");
    }

    if (manifest.usesPermissions) {
      const perms = manifest.usesPermissions.map((p) => p.name).join(", ");
      if (perms.includes("SEND_SMS") || perms.includes("READ_SMS")) {
        score += 30;
        reasons.push("Suspicious SMS permissions");
      }
    }

    if (manifest.versionName && manifest.versionName.toLowerCase().includes("beta")) {
      score += 20;
      reasons.push("App in beta version");
    }

    // Fake confidence %
    const confidence = Math.min(100, score);

    // Clean up file
    fs.unlinkSync(filePath);

    // ✅ Mark this user as "already checked"
    userChecks.set(userId, true);

    // Send response
    res.json({
      package: manifest.package,
      version: manifest.versionName,
      label: manifest.application?.label,
      confidence,
      reasons,
      message: "✅ APK analyzed successfully (1-time check used).",
    });
  } catch (err) {
    console.error("Error parsing APK:", err);
    res.status(500).json({ error: "Failed to analyze APK" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
