document.getElementById("uploadForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const file = document.getElementById("apkFile").files[0];
  const result = document.getElementById("result");

  if (!file) {
    result.textContent = "⚠️ Please select an APK file!";
    result.style.color = "yellow";
    return;
  }

  // Fake scan simulation
  result.textContent = "⏳ Scanning " + file.name + "...";
  result.style.color = "white";

  setTimeout(() => {
    const suspicious = Math.random() > 0.5; // Random for demo
    if (suspicious) {
      result.textContent = "❌ This APK seems suspicious!";
      result.style.color = "red";
    } else {
      result.textContent = "✅ This APK looks safe!";
      result.style.color = "lightgreen";
    }
  }, 2000);
});
