addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled(event.scheduledTime))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/login' && request.method === 'POST') {
    const formData = await request.formData()
    const password = formData.get('password')
    
    if (password === PASSWORD) {
      const response = new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
      response.headers.set('Set-Cookie', `auth=${PASSWORD}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`)
      return response
    } else {
      return new Response(JSON.stringify({ success: false }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } else if (url.pathname === '/run' && request.method === 'POST') {
    if (!isAuthenticated(request)) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    await handleScheduled(new Date().toISOString())
    const results = await CRON_RESULTS.get('lastResults', 'json')
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (url.pathname === '/results' && request.method === 'GET') {
    if (!isAuthenticated(request)) {
      return new Response(JSON.stringify({ authenticated: false }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    const results = await CRON_RESULTS.get('lastResults', 'json')
    return new Response(JSON.stringify({ authenticated: true, results: results || [] }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (url.pathname === '/check-auth' && request.method === 'GET') {
    return new Response(JSON.stringify({ authenticated: isAuthenticated(request) }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (url.pathname === '/run-account' && request.method === 'POST') {
    if (!isAuthenticated(request)) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Get the username of the account to run
    const data = await request.json()
    const username = data.username
    
    // Find the corresponding account from the configuration
    const accountsData = JSON.parse(ACCOUNTS_JSON)
    const account = accountsData.accounts.find(acc => acc.username === username)
    
    if (!account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Only run this specific account
    const result = await loginAccount(account)
    
    // Get the previous results and update
    let allResults = await CRON_RESULTS.get('lastResults', 'json') || []
    const index = allResults.findIndex(r => r.username === username)
    if (index >= 0) {
      allResults[index] = result
    } else {
      allResults.push(result)
    }
    await CRON_RESULTS.put('lastResults', JSON.stringify(allResults))

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else {
    // Display the login page or results page HTML
    return new Response(getHtmlContent(), {
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

function isAuthenticated(request) {
  const cookies = request.headers.get('Cookie')
  if (cookies) {
    const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='))
    if (authCookie) {
      const authValue = authCookie.split('=')[1]
      return authValue === PASSWORD
    }
  }
  return false
}

function getHtmlContent() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="Serv00 Monitor - Server Monitoring Panel">
    <meta name="keywords" content="serv00, monitor, dashboard">
    <meta name="author" content="YYDS666">
    <meta name="theme-color" content="#ee7752">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    
    <!-- Website icon -->
    <link rel="icon" type="image/png" href="https://api.dicebear.com/7.x/bottts/svg?seed=monitor">
    <link rel="apple-touch-icon" href="https://api.dicebear.com/7.x/bottts/svg?seed=monitor">
    
    <title>Serv00 Monitor | Server Monitoring Panel</title>

    <!-- Existing stylesheet links -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
    
    <!-- Current styles code -->
  `
}
    <style>
      :root {
        --light-bg: #ffffff;
        --light-surface: #f8fafc;
        --light-text: #0f172a;
        --light-text-secondary: #64748b;
        --light-border: #e2e8f0;
        --light-primary: #3b82f6;
        
        --dark-bg: #0f172a;
        --dark-surface: #1e293b;
        --dark-text: #f8fafc;
        --dark-text-secondary: #94a3b8;
        --dark-border: #334155;
        --dark-primary: #60a5fa;
        
        --success-color: #10b981;
        --failed-color: #ef4444;
        
        --gradient-1: #ee7752;
        --gradient-2: #e73c7e;
        --gradient-3: #23a6d5;
        --gradient-4: #23d5ab;
        
        --dark-gradient-1: #2d3748;
        --dark-gradient-2: #1a202c;
        --dark-gradient-3: #2c5282;
        --dark-gradient-4: #2d3748;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      }

      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
        background: linear-gradient(to right, rgb(64, 224, 208), rgb(255, 140, 0), rgb(255, 0, 128));
        background-attachment: fixed;
        background-size: cover;
        -webkit-overflow-scrolling: touch;
      }

      body.dark {
        background: linear-gradient(to right, rgb(32, 112, 104), rgb(128, 70, 0), rgb(128, 0, 64));
        background-attachment: fixed;
        background-size: 100% 100%;
      }

      .theme-toggle {
        position: absolute;
        top: calc(20px + env(safe-area-inset-top));
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        background: transparent !important;
        box-shadow: none !important;
        -webkit-tap-highlight-color: transparent;
      }

      .theme-toggle:hover {
        background: transparent !important;
        transform: none;
      }

      .theme-toggle:active {
        background: transparent !important;
      }

      .theme-toggle i {
        font-size: 24px;
        transition: all 0.3s ease;
        background: transparent !important;
      }

      .theme-toggle.light i {
        color: #f59e0b;
      }

      .theme-toggle.dark i {
        color: #e5e7eb;
      }

      .theme-toggle.light,
      .theme-toggle.dark {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }

      .login-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 400px;
        padding: 2rem;
        display: none;
      }

      #loginForm {
        padding: 2rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      #loginForm.dark {
        background: rgba(30, 41, 59, 0.9);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .logo {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 2rem;
        text-align: center;
        color: var(--light-text);
      }

      .logo.dark {
        color: var(--dark-text);
      }

      .logo span {
        color: inherit;
      }

      input {
        width: 100%;
        padding: 1rem;
        border-radius: 12px;
        border: 2px solid transparent;
        font-size: 1rem;
        margin-bottom: 1rem;
        transition: all 0.2s;
      }

      input.light {
        background: var(--light-bg);
        border-color: var(--light-border);
        color: var(--light-text);
      }

      input.dark {
        background: var(--dark-surface);
        border-color: var(--dark-border);
        color: var(--dark-text);
      }

      button {
        width: 100%;
        padding: 1rem;
        border-radius: 12px;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      button.light {
        background: var(--light-primary);
        color: white;
      }

      button.dark {
        background: var(--dark-primary);
        color: var(--dark-bg);
      }

      button:hover {
        opacity: 0.9;
      }

      #dashboard {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--light-bg);
        transition: background-color 0.2s;
        margin: 0;
        padding: 0;
        display: none;
      }

      #dashboard.dark {
        background: var(--dark-bg);
      }

      .dashboard-header {
        position: relative;
        width: 100%;
        height: 240px;
        background: linear-gradient(to right, rgb(64, 224, 208), rgb(255, 140, 0), rgb(255, 0, 128));
        background-size: 100% 100%;
        margin: 0 0 40px 0;
        padding-bottom: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
      }

      .dark .dashboard-header {
        background: linear-gradient(to right, rgb(32, 112, 104), rgb(128, 70, 0), rgb(128, 0, 64));
        background-size: 100% 100%;
      }

      .dashboard-header h1 {
        color: white;
        font-size: 2.2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        letter-spacing: 0.1em;
      }

      .dashboard-header h3 {
        color: white;
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.7;
      }

      .dashboard-header button {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 200px;
        padding: 1.2rem 2.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 50px;
        background: linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61));
        color: white;
        border: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dashboard-header button:hover,
      .dashboard-header button.light:hover,
      .dashboard-header button.dark:hover {
        transform: translateX(-50%);
        background: linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61));
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        opacity: 1;
      }

      .dashboard-header button:active,
      .dashboard-header button.light:active,
      .dashboard-header button.dark:active {
        transform: translateX(-50%);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .dashboard-header button.light,
      .dashboard-header button.dark {
        background: linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61));
        color: white;
      }

      #status {
        width: 100%;
        margin: 2rem 0 0 0;
        text-align: center;
        font-size: 14px;
        min-height: 24px;
        color: var(--light-text);
      }

      #dashboard.dark #status {
        color: var(--dark-text);
      }

      .dashboard-grid {
        flex: 1;
        padding-bottom: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        width: 100%;
        max-width: 1400px;
        margin: 30px auto;
        padding: 0 2rem;
        margin-top: 2rem;
      }

      @media (min-width: 1200px) {
        .dashboard-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (max-width: 1199px) {
        .dashboard-grid {
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }
      }

      .account-card {
        position: relative;
        padding: 1.5rem;
        background: var(--light-surface);
        border: 1px solid var(--light-border);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .account-card.dark {
        background: var(--dark-surface);
        border-color: var(--dark-border);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .account-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .account-card.dark:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .account-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .account-header.dark {
        border-color: var(--dark-border);
      }

      .account-info-group {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .account-info {
        flex-grow: 1;
      }

      .account-name {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
        color: var(--light-text);
      }

      .account-name.dark {
        color: var(--dark-text);
      }

      .account-type {
        color: var(--light-text-secondary);
        font-size: 0.875rem;
      }

      .cron-item {
        position: relative;
        padding: 0.75rem;
        background: var(--light-bg);
        border-radius: 8px;
        border: 1px solid var(--light-border);
      }

      .cron-item.dark {
        background: var(--dark-bg);
        border-color: var(--dark-border);
      }

      .cron-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .cron-status i {
        font-size: 18px;
      }

      .cron-message {
        margin-top: 0.5rem;
        padding: 0.75rem;
        background: var(--light-bg);
        border-radius: 6px;
        font-family: monospace;
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--light-text);
        word-break: break-word;
        overflow-wrap: break-word;
        max-height: 150px;
        overflow-y: auto;
        display: none;
      }

      .cron-message.dark {
        background: var(--dark-bg);
        color: var(--dark-text);
      }

      .last-run {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--light-text-secondary);
        margin-top: 0.5rem;
      }

      .last-run.dark {
        color: var(--dark-text-secondary);
      }

      .last-run i {
        font-size: 14px;
      }

      .account-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--light-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .account-avatar.dark {
        background: var(--dark-bg);
      }

      .account-avatar i {
        font-size: 24px;
        color: var(--light-text-secondary);
      }

      .account-type {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--light-text-secondary);
      }

      .account-type.dark {
        color: var(--dark-text-secondary);
      }

      .cron-status {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cron-status i {
        font-size: 20px;
      }

      .last-run {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .last-run i {
        color: var(--light-text-secondary);
      }

      .last-run.dark i {
        color: var(--dark-text-secondary);
      }

      /* 美化滚动条 */
      .cron-message::-webkit-scrollbar {
        width: 6px;
      }

      .cron-message::-webkit-scrollbar-track {
        background: transparent;
      }

      .cron-message::-webkit-scrollbar-thumb {
        background-color: var(--light-border);
        border-radius: 3px;
      }

      .cron-message.dark::-webkit-scrollbar-thumb {
        background-color: var(--dark-border);
      }

      .cron-status i.success {
        color: var(--success-color);
      }

      .cron-status i.failed {
        color: var(--failed-color);
      }

      .cron-status span.success {
        color: var(--success-color);
      }

      .cron-status span.failed {
        color: var(--failed-color);
      }

      .dark .cron-status i.success {
        color: #4ade80;
      }

      .dark .cron-status i.failed {
        color: #f87171;
      }

      .dark .cron-status span.success {
        color: #4ade80;
      }

      .dark .cron-status span.failed {
        color: #f87171;
      }

      .dark .cron-message.success {
        background: var(--dark-success-bg);
        color: var(--dark-message-success-color);
      }

      .dark .cron-message.failed {
        background: var(--dark-failed-bg);
        color: var(--dark-message-failed-color);
      }

      .cron-message.show {
        display: block;
      }
      /* 修改成功状态脚本路径样式 light */
      .cron-message.success.light {
        background: var(--light-bg);
        color: var(--light-text-secondary);
      }
      /* 修改成功动态脚本路径样式 dark */
      .cron-message.success.dark {
        background: var(--dark-bg);
        color: var(--dark-text-secondary);
      }

      /* 添加一个加载状态的容器 */
      .loading-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100vh;
        height: -webkit-fill-available;
        background: linear-gradient(to right, rgb(64, 224, 208), rgb(255, 140, 0), rgb(255, 0, 128));
        z-index: 1000;
      }
<!-- Add loading state container -->
<div class="loading-container">
  <!-- Removed <span>Loading...</span> -->
</div>

<div class="page-container">
  <div class="content-wrapper">
    <!-- Login container -->
    <div class="login-container">
      <div id="loginForm" class="light">
        <div class="logo">
          <span>Serv00 Monitor</span>
        </div>
        <input type="password" id="password" placeholder="Password" class="light">
        <button onclick="login()" class="light">Login</button>
      </div>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="light">
      <div class="dashboard-header">
        <h1>Serv00 Monitor</h1>
        <h3>Serv00 Panel for Cloudflare Workers</h3>
        <button onclick="runScript()" class="light">Run All Scripts</button>
      </div>
      <div id="status"></div>
      <div id="resultsGrid" class="dashboard-grid"></div>
      
      <!-- Add footer -->
      <footer class="footer light">
        <span>&copy; MJJ <span id="year"></span> . All rights reserved.</span>
      </footer>
    </div>
  </div>
</div>

<script>
  let password = ''; // Variable to store the password

  // Function to show the login form
  function showLoginForm() {
    document.querySelector('.loading-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
  }

  // Function to show the dashboard after successful login
  function showDashboard() {
    document.querySelector('.loading-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    fetchResults();
  }

  // Function to check if the user is authenticated
  async function checkAuth() {
    try {
      const response = await fetch('/check-auth');
      const data = await response.json();
      if (data.authenticated) {
        showDashboard();
      } else {
        showLoginForm();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showLoginForm();
    }
  }

  // Function to handle login action
  async function login() {
    password = document.getElementById('password').value; // Retrieve password entered by user
    const formData = new FormData();
    formData.append('password', password);
    const response = await fetch('/login', { 
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      showDashboard();
    } else {
      alert('Incorrect password');
    }
  }

  // Function to toggle between light and dark themes
  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    // Update status bar color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (newTheme === 'dark') {
      metaThemeColor.setAttribute('content', '#000000'); // Black for dark mode
    } else {
      metaThemeColor.setAttribute('content', '#ffffff'); // White for light mode
    }
    
    // Original theme toggle logic
    document.querySelectorAll('[class*="dark"], [class*="light"]').forEach(element => {
      element.classList.remove('dark', 'light');
      element.classList.add(newTheme);
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="material-icons-round">' + 
        (newTheme === 'dark' ? 'dark_mode' : 'light_mode') + '</i>';
    }

    // Update footer style
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.classList.remove('dark', 'light');
      footer.classList.add(newTheme);
    }

    // Update dashboard-header button style
    const dashboardButton = document.querySelector('.dashboard-header button');
    if (dashboardButton) {
      dashboardButton.className = 'light';
      dashboardButton.classList.add(newTheme);
    }
  }

  // Trigger login function when pressing Enter on the password field
  document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      login();
    }
  });

  // Run authentication check on page load
  document.addEventListener('DOMContentLoaded', checkAuth);

  // Function to run all scripts
  async function runScript() {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Running all scripts, please wait a few minutes...';
    try {
      const response = await fetch('/run', { method: 'POST' });
      if (response.ok) {
        const results = await response.json();
        displayResults(results);
        statusDiv.textContent = 'All scripts have been successfully executed!';
      } else if (response.status === 401) {
        statusDiv.textContent = 'Unauthorized, please log in again';
        showLoginForm();  
      } else {
        statusDiv.textContent = 'Some scripts failed, please check!';
      }
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
    }
  }

  // Function to fetch and display results
  async function fetchResults() {
    try {
      const response = await fetch('/results');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          displayResults(data.results);
        } else {
          showLoginForm();
        }
      } else {
        console.error('Failed to fetch results');
        showLoginForm();
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      showLoginForm();
    }
  }

  // Function to display results in the dashboard
  function displayResults(results) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    
    results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'account-card ' + theme;
      
      let panelInfo;
      if (result.type === 'ct8') {
        panelInfo = 'CT8';
      } else {
        panelInfo = 'Serv00 ' + result.panelnum + ' Area';
      }
      
      const avatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(result.username);
      
      card.innerHTML = 
        '<div class="account-header ' + theme + '">' +
          '<div class="account-info-group">' +
            '<div class="account-avatar ' + theme + '">' +
              '<img src="' + avatarUrl + '" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%;">' +
            '</div>' +
            '<div class="account-info">' +
              '<div class="account-name ' + theme + '">' + result.username + '</div>' +
              '<div class="account-type ' + theme + '">' +
                '<span>' + panelInfo + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button onclick="runSingleAccount(\\\'' + result.username + '\\\')" class="run-single-btn ' + theme + '">' +
            'Run' +
          '</button>' +
        '</div>' +
        '<div class="cron-results-container">' +
          result.cronResults.map(cronResult => {
            const statusIcon = cronResult.success ? 'check_circle' : 'error';
            return '<div class="cron-item ' + theme + '">' +
              '<div class="cron-header">' +
                '<div class="cron-status">' +
                  '<i class="material-icons-round ' + (cronResult.success ? 'success' : 'failed') + '">' +
                    statusIcon +
                  '</i>' +
                  '<span class="' + (cronResult.success ? 'success' : 'failed') + '">' +
                    (cronResult.success ? 'success' : 'failed') +
                  '</span>' +
                '</div>' +
                '<div class="last-run ' + theme + '">' +
                  '<i class="material-icons-round">schedule</i>' +
                  '<span>' + new Date(result.lastRun).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="message-toggle ' + theme + '" onclick="toggleMessage(this)">View Script ▼</div>' +
              '<div class="cron-message ' + theme + ' ' + (cronResult.success ? 'success' : 'failed') + '">' + 
                cronResult.message + 
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
      
      grid.appendChild(card);
    });

    document.querySelectorAll('.message-toggle').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const message = this.nextElementSibling;
        const isShown = message.classList.contains('show');
        message.classList.toggle('show');
        this.textContent = isShown ? 'View Script ▼' : 'Hide Script ▲';
      });
    });
  }

  // Event listener to toggle the visibility of script messages
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('message-toggle')) {
      const messageElement = e.target.nextElementSibling;
      const isShown = messageElement.classList.contains('show');
      
      messageElement.classList.toggle('show');
      e.target.textContent = isShown ? 'View Script ▼' : 'Hide Script ▲';
    }
  });

  // Set the initial status bar color based on the system theme
  document.addEventListener('DOMContentLoaded', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // Set initial theme
    if (prefersDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      metaThemeColor.setAttribute('content', '#000000');
      
      // Update all elements with theme classes
      document.querySelectorAll('[class*="light"]').forEach(element => {
        element.classList.remove('light');
        element.classList.add('dark');
      });
      
      // Update theme toggle button
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.classList.remove('light');
        themeToggle.classList.add('dark');
        themeToggle.innerHTML = '<i class="material-icons-round">dark_mode</i>';
      }
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      metaThemeColor.setAttribute('content', '#ffffff');
      
      // Update all elements with theme classes
      document.querySelectorAll('[class*="dark"]').forEach(element => {
        element.classList.remove('dark');
        element.classList.add('light');
      });
      
      // Update theme toggle button
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.classList.remove('dark');
        themeToggle.classList.add('light');
        themeToggle.innerHTML = '<i class="material-icons-round">light_mode</i>';
      }
    }
  });

  // Set dynamic year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Function to run a single account's script
  async function runSingleAccount(username) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Running ' + username + ' account script...';
    
    try {
      const response = await fetch('/run-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (response.ok) {
        const result = await response.json();
        const results = await (await fetch('/results')).json();
        if (results.authenticated) {
          displayResults(results.results);
          statusDiv.textContent = username + ' account script completed!';
        }
      } else if (response.status === 401) {
        statusDiv.textContent = 'Unauthorized. Please log in again';
        showLoginForm();
      } else {
        statusDiv.textContent = username + ' account script execution error!';
      }
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
    }
  }

  // Function to toggle the visibility of script messages
  function toggleMessage(element) {
    const message = element.nextElementSibling;
    const isShown = message.classList.contains('show');
    message.classList.toggle('show');
    element.textContent = isShown ? 'View Script ▼' : 'Hide Script ▲';
  }

<div class="page-container">
  <div class="content-wrapper">
    <!-- Login container -->
    <div class="login-container">
      <div id="loginForm" class="light">
        <div class="logo">
          <span>Serv00 Monitor</span>
        </div>
        <input type="password" id="password" placeholder="Password" class="light">
        <button onclick="login()" class="light">Login</button>
      </div>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="light">
      <div class="dashboard-header">
        <h1>Serv00 Monitor</h1>
        <h3>Serv00 Panel for Cloudflare Workers</h3>
        <button onclick="runScript()" class="light">Run All Scripts</button>
      </div>
      <div id="status"></div>
      <div id="resultsGrid" class="dashboard-grid"></div>
      
      <!-- Add footer -->
      <footer class="footer light">
        <span>&copy; MJJ <span id="year"></span> . All rights reserved.</span>
      </footer>
    </div>
  </div>
</div>

<script>
  let password = '';

  function showLoginForm() {
    document.querySelector('.loading-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
  }

  function showDashboard() {
    document.querySelector('.loading-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    fetchResults();
  }

  async function checkAuth() {
    try {
      const response = await fetch('/check-auth');
      const data = await response.json();
      if (data.authenticated) {
        showDashboard();
      } else {
        showLoginForm();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showLoginForm();
    }
  }

  async function login() {
    password = document.getElementById('password').value;
    const formData = new FormData();
    formData.append('password', password);
    const response = await fetch('/login', { 
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      showDashboard();
    } else {
      alert('Incorrect password');
    }
  }

  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    // Update status bar color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (newTheme === 'dark') {
      metaThemeColor.setAttribute('content', '#000000'); // Black for dark mode
    } else {
      metaThemeColor.setAttribute('content', '#ffffff'); // White for light mode
    }
    
    // Original theme toggle logic
    document.querySelectorAll('[class*="dark"], [class*="light"]').forEach(element => {
      element.classList.remove('dark', 'light');
      element.classList.add(newTheme);
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="material-icons-round">' + 
        (newTheme === 'dark' ? 'dark_mode' : 'light_mode') + '</i>';
    }

    // Update footer style
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.classList.remove('dark', 'light');
      footer.classList.add(newTheme);
    }

    // Update dashboard-header button style
    const dashboardButton = document.querySelector('.dashboard-header button');
    if (dashboardButton) {
      dashboardButton.className = 'light';
      dashboardButton.classList.add(newTheme);
    }
  }

  document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      login();
    }
  });

  document.addEventListener('DOMContentLoaded', checkAuth);

  async function runScript() {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Running all scripts, please wait a few minutes...';
    try {
      const response = await fetch('/run', { method: 'POST' });
      if (response.ok) {
        const results = await response.json();
        displayResults(results);
        statusDiv.textContent = 'All scripts have been successfully executed!';
      } else if (response.status === 401) {
        statusDiv.textContent = 'Unauthorized, please log in again';
        showLoginForm();  
      } else {
        statusDiv.textContent = 'Some scripts failed, please check!';
      }
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
    }
  }

  async function fetchResults() {
    try {
      const response = await fetch('/results');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          displayResults(data.results);
        } else {
          showLoginForm();
        }
      } else {
        console.error('Failed to fetch results');
        showLoginForm();
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      showLoginForm();
    }
  }

  function displayResults(results) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    
    results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'account-card ' + theme;
      
      let panelInfo;
      if (result.type === 'ct8') {
        panelInfo = 'CT8';
      } else {
        panelInfo = 'Serv00 ' + result.panelnum + ' Area';
      }
      
      const avatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(result.username);
      
      card.innerHTML = 
        '<div class="account-header ' + theme + '">' +
          '<div class="account-info-group">' +
            '<div class="account-avatar ' + theme + '">' +
              '<img src="' + avatarUrl + '" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%;">' +
            '</div>' +
            '<div class="account-info">' +
              '<div class="account-name ' + theme + '">' + result.username + '</div>' +
              '<div class="account-type ' + theme + '">' +
                '<span>' + panelInfo + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button onclick="runSingleAccount(\\\'' + result.username + '\\\')" class="run-single-btn ' + theme + '">' +
            'Run' +
          '</button>' +
        '</div>' +
        '<div class="cron-results-container">' +
          result.cronResults.map(cronResult => {
            const statusIcon = cronResult.success ? 'check_circle' : 'error';
            return '<div class="cron-item ' + theme + '">' +
              '<div class="cron-header">' +
                '<div class="cron-status">' +
                  '<i class="material-icons-round ' + (cronResult.success ? 'success' : 'failed') + '">' +
                    statusIcon +
                  '</i>' +
                  '<span class="' + (cronResult.success ? 'success' : 'failed') + '">' +
                    (cronResult.success ? 'success' : 'failed') +
                  '</span>' +
                '</div>' +
                '<div class="last-run ' + theme + '">' +
                  '<i class="material-icons-round">schedule</i>' +
                  '<span>' + new Date(result.lastRun).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="message-toggle ' + theme + '" onclick="toggleMessage(this)">View Script ▼</div>' +
              '<div class="cron-message ' + theme + ' ' + (cronResult.success ? 'success' : 'failed') + '">' + 
                cronResult.message + 
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
      
      grid.appendChild(card);
    });

    document.querySelectorAll('.message-toggle').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const message = this.nextElementSibling;
        const isShown = message.classList.contains('show');
        message.classList.toggle('show');
        this.textContent = isShown ? 'View Script ▼' : 'Hide Script ▲';
      });
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('message-toggle')) {
      const messageElement = e.target.nextElementSibling;
      const isShown = messageElement.classList.contains('show');
      
      messageElement.classList.toggle('show');
      e.target.textContent = isShown ? 'View Script ▼' : 'Hide Script ▲';
    }
  });

  // Set the initial status bar color based on the system theme
  document.addEventListener('DOMContentLoaded', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // Set initial theme
    if (prefersDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      metaThemeColor.setAttribute('content', '#000000');
      
      // Update all elements with theme classes
      document.querySelectorAll('[class*="light"]').forEach(element => {
        element.classList.remove('light');
        element.classList.add('dark');
      });
      
      // Update theme toggle button
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.classList.remove('light');
        themeToggle.classList.add('dark');
        themeToggle.innerHTML = '<i class="material-icons-round">dark_mode</i>';
      }
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      metaThemeColor.setAttribute('content', '#ffffff');
      
      // Update all elements with theme classes
      document.querySelectorAll('[class*="dark"]').forEach(element => {
        element.classList.remove('dark');
        element.classList.add('light');
      });
      
      // Update theme toggle button
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.classList.remove('dark');
        themeToggle.classList.add('light');
        themeToggle.innerHTML = '<i class="material-icons-round">light_mode</i>';
      }
    }
  });

  // Set dynamic year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Add function to run a single account
  async function runSingleAccount(username) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Running ' + username + ' account script...';
    
    try {
      const response = await fetch('/run-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (response.ok) {
        const result = await response.json();
        const results = await (await fetch('/results')).json();
        if (results.authenticated) {
          displayResults(results.results);
          statusDiv.textContent = username + ' account script completed!';
        }
      } else if (response.status === 401) {
        statusDiv.textContent = 'Unauthorized. Please log in again';
        showLoginForm();
      } else {
        statusDiv.textContent = username + ' account script execution error!';
      }
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
    }
  }

  function toggleMessage(element) {
    const message = element.nextElementSibling;
    const isShown = message.classList.contains('show');
    message.classList.toggle('show');
    element.textContent = isShown ? 'View Script ▼' : 'Hide Script ▲';
  }

function generateRandomUserAgent() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const browser = browsers[Math.floor(Math.random() * browsers.length)];
  const version = Math.floor(Math.random() * 100) + 1;
  const os = ['Windows NT 10.0', 'Macintosh', 'X11'];
  const selectedOS = os[Math.floor(Math.random() * os.length)];
  const osVersion = selectedOS === 'X11' ? 'Linux x86_64' : selectedOS === 'Macintosh' ? 'Intel Mac OS X 10_15_7' : 'Win64; x64';

  return `Mozilla/5.0 (${selectedOS}; ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version}.0.0.0 Safari/537.36`;
}

async function loginAccount(account) {
  const { username, password, panelnum, type, cronCommands } = account;
  let baseUrl = type === 'ct8' 
    ? 'https://panel.ct8.pl' 
    : `https://panel${panelnum}.serv00.com`;
  let loginUrl = `${baseUrl}/login/?next=/cron/`;

  const userAgent = generateRandomUserAgent();

  try {
    const response = await fetch(loginUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
      },
    })

    const pageContent = await response.text()
    const csrfMatch = pageContent.match(/name="csrfmiddlewaretoken" value="([^"]*)"/)
    const csrfToken = csrfMatch ? csrfMatch[1] : null

    if (!csrfToken) {
      throw new Error('CSRF token not found')
    }

    const initialCookies = response.headers.get('set-cookie') || ''

const formData = new URLSearchParams({
  'username': username,
  'password': password,
  'csrfmiddlewaretoken': csrfToken,
  'next': '/cron/'
})

const loginResponse = await fetch(loginUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': loginUrl,
    'User-Agent': userAgent,
    'Cookie': initialCookies,
  },
  body: formData.toString(),
  redirect: 'manual'
})

if (loginResponse.status === 302 && loginResponse.headers.get('location') === '/cron/') {
  const loginCookies = loginResponse.headers.get('set-cookie') || ''
  const allCookies = combineCookies(initialCookies, loginCookies)

  // Access cron list page
  const cronListUrl = `${baseUrl}/cron/`
  const cronListResponse = await fetch(cronListUrl, {
    headers: {
      'Cookie': allCookies,
      'User-Agent': userAgent,
    }
  })
  const cronListContent = await cronListResponse.text()

  console.log(`Cron list URL: ${cronListUrl}`)
  console.log(`Cron list response status: ${cronListResponse.status}`)
  console.log(`Cron list content (first 1000 chars): ${cronListContent.substring(0, 1000)}`)

  let cronResults = [];
  for (const cronCommand of cronCommands) {
    if (!cronListContent.includes(cronCommand)) {
      // Access the add cron task page
      const addCronUrl = `${baseUrl}/cron/add`
      const addCronPageResponse = await fetch(addCronUrl, {
        headers: {
          'Cookie': allCookies,
          'User-Agent': userAgent,
          'Referer': cronListUrl,
        }
      })
      const addCronPageContent = await addCronPageResponse.text()

      console.log(`Add cron page URL: ${addCronUrl}`)
      console.log(`Add cron page response status: ${addCronPageResponse.status}`)
      console.log(`Add cron page content (first 1000 chars): ${addCronPageContent.substring(0, 1000)}`)

      const newCsrfMatch = addCronPageContent.match(/name="csrfmiddlewaretoken" value="([^"]*)"/)
      const newCsrfToken = newCsrfMatch ? newCsrfMatch[1] : null

      if (!newCsrfToken) {
        throw new Error('New CSRF token not found for adding cron task')
      }

      const formData = new URLSearchParams({
        'csrfmiddlewaretoken': newCsrfToken,
        'spec': 'manual',
        'minute_time_interval': 'on',
        'minute': '15',
        'hour_time_interval': 'each',
        'hour': '*',
        'day_time_interval': 'each',
        'day': '*',
        'month_time_interval': 'each',
        'month': '*',
        'dow_time_interval': 'each',
        'dow': '*',
        'command': cronCommand,
        'comment': 'Auto added cron job'
      })

      console.log('Form data being sent:', formData.toString())

      const { success, response: addCronResponse, content: addCronResponseContent } = await addCronWithRetry(addCronUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': allCookies,
          'User-Agent': userAgent,
          'Referer': addCronUrl,
          'Origin': baseUrl,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Upgrade-Insecure-Requests': '1'
        },
        body: formData.toString(),
      })

      console.log('Full response content:', addCronResponseContent)

      if (success) {
        if (addCronResponseContent.includes('Cron job has been added') || addCronResponseContent.includes('Zadanie cron zostało dodane')) {
          const message = `Added new cron job: ${cronCommand}`;
          console.log(message);
          await sendTelegramMessage(`Account ${username} (${type}) ${message}`);
          cronResults.push({ success: true, message });
        } else {
          // If success message is not found in the response, recheck the cron list
          const checkCronListResponse = await fetch(cronListUrl, {
            headers: {
              'Cookie': allCookies,
              'User-Agent': userAgent,
            }
          });
          const checkCronListContent = await checkCronListResponse.text();
          
          if (checkCronListContent.includes(cronCommand)) {
            const message = `Added new cron job: ${cronCommand}`;
            console.log(message);
            await sendTelegramMessage(`Account ${username} (${type}) ${message}`);
            cronResults.push({ success: true, message });
          } else {
            const message = `Tried to add cron job: ${cronCommand}, but couldn't find it in the list (may have failed)`;
            console.error(message);
            cronResults.push({ success: false, message });
          }
        }
      } else {
        const message = `Failed to add cron job: ${cronCommand}`;
        console.error(message);
        cronResults.push({ success: false, message });
      }
    } else {
      const message = `${cronCommand}`;
      console.log(message);
      cronResults.push({ success: true, message });
    }
  }
  return { 
    username, 
    type, 
    panelnum,
    cronResults, 
    lastRun: new Date().toISOString() 
  };
} else {
  const message = `Login failed, reason not found. Please check if the username and password are correct`;
  console.error(message);
  return { 
    username, 
    type, 
    panelnum,
    cronResults: [{ success: false, message }], 
    lastRun: new Date().toISOString() 
  };
}
} catch (error) {
  const message = `Error occurred during login or adding cron task: ${error.message}`;
  console.error(message);
  return { 
    username, 
    type, 
    panelnum,
    cronResults: [{ success: false, message }], 
    lastRun: new Date().toISOString() 
  };
}
}

async function addCronWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const responseContent = await response.text();
      console.log(`Attempt ${i + 1} response status:`, response.status);
      console.log(`Attempt ${i + 1} response content (first 1000 chars):`, responseContent.substring(0, 1000));
      
      if (response.status === 200 || response.status === 302 || responseContent.includes('Cron job has been added') || responseContent.includes('Zadanie cron zostało dodane')) {
        return { success: true, response, content: responseContent };
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
    }
    await delay(2000); // Wait 2 seconds before retrying
  }
  return { success: false };
}

function combineCookies(cookies1, cookies2) {
  const cookieMap = new Map()
  
  const parseCookies = (cookieString) => {
    cookieString.split(',').forEach(cookie => {
      const [fullCookie] = cookie.trim().split(';')
      const [name, value] = fullCookie.split('=')
      if (name && value) {
        cookieMap.set(name.trim(), value.trim())
      }
    })
  }

  parseCookies(cookies1)
  parseCookies(cookies2)

  return Array.from(cookieMap.entries()).map(([name, value]) => `${name}=${value}`).join('; ')
}

async function sendTelegramMessage(message) {
  const telegramConfig = JSON.parse(TELEGRAM_JSON)
  const { telegramBotToken, telegramBotUserId } = telegramConfig
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramBotUserId,
        text: message
      })
    })
  } catch (error) {
    console.error('Error sending Telegram message:', error)
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
