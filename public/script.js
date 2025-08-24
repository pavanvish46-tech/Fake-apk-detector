<script>
  let alreadyChecked = false; // ✅ Flag for one-time check

  // Toggle dark/light
  function toggleMode() {
    document.body.classList.toggle("light");
  }

  // APK Check Simulation (Only Once)
  function checkApk() {
    if (alreadyChecked) {
      alert("⚠️ APK already checked! You can scan only once.");
      return;
    }

    const fileInput = document.getElementById("apkFile");
    const loader = document.getElementById("loader");
    const resultBox = document.getElementById("result");

    if (!fileInput.files.length) {
      alert("⚠️ Please select an APK file first!");
      return;
    }

    const file = fileInput.files[0];

    // Show loader
    loader.style.display = "block";
    resultBox.style.display = "none";

    setTimeout(() => {
      loader.style.display = "none";

      const confidence = Math.floor(Math.random() * 100);
      let status = confidence > 70 ? "⚠️ Suspicious APK detected!" : "✅ Safe APK (Low Risk)";
      let color = confidence > 70 ? "#f87171" : "#34d399";

      resultBox.style.display = "block";
      resultBox.style.background = "rgba(255,255,255,0.1)";
      resultBox.innerHTML = `
        <h2 style="color:${color};">${status}</h2>
        <p><b>File:</b> ${file.name} (${(file.size/1024).toFixed(2)} KB)</p>
        <div class="progress">
          <div class="progress-bar" style="background:${color}; width:${confidence}%;">
            ${confidence}%
          </div>
        </div>
      `;

      alreadyChecked = true; // ✅ Only one scan allowed
    }, 2000); // Simulate scan delay
  }
</script>
