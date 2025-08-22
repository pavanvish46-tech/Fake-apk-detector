const express = require("express");
const multer = require("multer");
const ApkReader = require("apk-parser3");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend files

// Multer setup for APK upload
const upload = multer({ dest: "uploads/" });

// Upload endpoint
app.post("/upload", upload.single("apkFile"), async (req, res) => {
  try {
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

    if (manifest.versionName && manifest.versionName.includes("beta")) {
      score += 20;
      reasons.push("App in beta version");
    }

    // Fake confidence %
    const confidence = Math.min(100, score);

    // Clean up file
    fs.unlinkSync(filePath);

    res.json({
      package: manifest.package,
      version: manifest.versionName,
      label: manifest.application?.label,
      confidence,
      reasons,
    });
  } catch (err) {
    console.error("Error parsing APK:", err);
    res.status(500).json({ error: "Failed to analyze APK" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
