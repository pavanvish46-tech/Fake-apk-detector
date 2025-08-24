// routes/apk.js
const express = require("express");
const multer = require("multer");
const ApkReader = require("apk-parser3");
const fs = require("fs");
const User = require("../models/userModel");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload/:userId", upload.single("apkFile"), async (req, res) => {
  try {
    const userId = req.params.userId;
    let user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Restriction: Only 1 APK check
    if (user.apkCheckCount >= 1) {
      return res.status(403).json({ error: "❌ You already used your one free check" });
    }

    // Parse the APK
    const reader = await ApkReader.open(req.file.path);
    const manifest = await reader.readManifest();

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

    const confidence = Math.min(100, score);

    // Mark user as used once
    user.apkCheckCount += 1;
    await user.save();

    fs.unlinkSync(req.file.path);

    res.json({
      package: manifest.package,
      version: manifest.versionName,
      label: manifest.application?.label,
      confidence,
      reasons,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze APK" });
  }
});

module.exports = router;
