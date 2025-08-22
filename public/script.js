async function checkApk() {
  const fileInput = document.getElementById("apkFile");
  const resultDiv = document.getElementById("result");

  if (fileInput.files.length === 0) {
    resultDiv.innerHTML = `<p style="color:red;">⚠️ Please select an APK file!</p>`;
    return;
  }

  const formData = new FormData();
  formData.append("apk", fileInput.files[0]);

  resultDiv.innerHTML = `<p>⏳ Analyzing APK...</p>`;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      resultDiv.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
    } else {
      resultDiv.innerHTML = `
        <div style="padding:15px; border-radius:10px; background:#f4f4f4;">
          <h3>📱 APK Analysis Report</h3>
          <p><strong>Package:</strong> ${data.package}</p>
          <p><strong>Version:</strong> ${data.versionName} (Code: ${data.versionCode})</p>
          <p><strong>Fake Probability:</strong> 
            <span style="font-size:18px; font-weight:bold; color:${parseFloat(data.fakeProbability) > 60 ? 'red' : 'green'};">
              ${data.fakeProbability}
            </span>
          </p>
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = `<p style="color:red;">⚠️ Error analyzing APK</p>`;
  }
}

// Profile & Login Modals
function showProfile() {
  document.getElementById("profileModal").style.display = "block";
}

function showLogin() {
  document.getElementById("loginModal").style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}
