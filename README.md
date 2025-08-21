# Fake-apk-detector
<!DOCTYPE html><html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafeBank Detector 🔒</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
      min-height: 100vh;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .btn-animated {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn-animated:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body class="font-sans">  <!-- Header -->  <header class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
    <h1 class="text-3xl font-extrabold tracking-wide">SafeBank Detector 🔒</h1>
    <p class="text-sm mt-1 opacity-90">Detect Fake Banking Apps Instantly</p>
  </header>  <!-- Upload Section -->  <section class="flex flex-col items-center mt-16">
    <div class="glass-card p-10 rounded-3xl shadow-xl w-96 text-center">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Upload APK File</h2>
      <label for="apkUpload" class="cursor-pointer block border-2 border-dashed border-gray-400 rounded-2xl p-8 hover:bg-blue-50 transition">
        <span class="text-gray-600 font-medium">📂 Drag & Drop or Click to Upload</span>
        <input type="file" id="apkUpload" accept=".apk" class="hidden">
      </label>
      <p id="fileName" class="text-sm text-gray-500 mt-3 italic"></p>
      <button onclick="analyzeAPK()" class="btn-animated mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:opacity-90">Analyze</button>
    </div>
  </section>  <!-- Results Section -->  <section id="results" class="hidden flex flex-col items-center mt-12 mb-10">
    <div class="glass-card p-10 rounded-3xl shadow-xl w-96 text-center">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Analysis Result</h2>
      <p id="riskText" class="text-lg font-bold mb-6"></p>
      <div class="flex justify-center mb-6">
        <canvas id="riskChart" width="250" height="250"></canvas>
      </div>
      <div class="mt-4 text-left text-sm text-gray-700">
        <p><strong>App Name:</strong> <span id="appName">Demo Bank App</span></p>
        <p><strong>Version:</strong> <span id="appVersion">1.0.0</span></p>
        <p><strong>Permissions:</strong> <span id="appPermissions">SMS, Contacts, Camera</span></p>
      </div>
    </div>
  </section> 

<script>
  const apkUpload = document.getElementById('apkUpload');
  const fileName = document.getElementById('fileName');
  const results = document.getElementById('results');
  const riskText = document.getElementById('riskText');
  const appName = document.getElementById('appName');
  const appVersion = document.getElementById('appVersion');
  const appPermissions = document.getElementById('appPermissions');

  apkUpload.addEventListener('change', () => {
    if (apkUpload.files.length > 0) {
      fileName.textContent = `Selected: ${apkUpload.files[0].name}`;
    }
  });

  async function analyzeAPK() {
    if (!apkUpload.files.length) {
      alert("Please upload an APK first!");
      return;
    }

    // Call backend API
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: apkUpload.files[0].name })
    });

    const data = await response.json();

    results.classList.remove('hidden');

    // Update result text
    if (data.riskScore < 40) {
      riskText.textContent = `✅ Safe App (Risk Score: ${data.riskScore})`;
      riskText.className = "text-green-600 font-extrabold text-lg";
    } else {
      riskText.textContent = `❌ Suspicious App (Risk Score: ${data.riskScore})`;
      riskText.className = "text-red-600 font-extrabold text-lg";
    }

    // Update details
    appName.textContent = data.appName;
    appVersion.textContent = data.version;
    appPermissions.textContent = data.permissions.join(', ');

    // Chart.js risk circle
    const ctx = document.getElementById('riskChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Risk', 'Safe'],
        datasets: [{
          data: [data.riskScore, 100 - data.riskScore],
          backgroundColor: ['#ef4444', '#22c55e']
        }]
      },
      options: {
        responsive: false,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
  }
</script>
</body>
</html>
