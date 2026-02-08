// Registers service worker, handles install prompt and provides a small install button.
let deferredPwaPrompt = null;

function createInstallUI() {
  if (document.getElementById('pwa-install-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'pwa-install-btn';
  btn.innerText = 'Install app';
  btn.style.position = 'fixed';
  btn.style.right = '16px';
  btn.style.bottom = '18px';
  btn.style.zIndex = '9999';
  btn.style.background = '#0ea5a4';
  btn.style.color = '#ffffff';
  btn.style.border = 'none';
  btn.style.padding = '10px 14px';
  btn.style.borderRadius = '8px';
  btn.style.boxShadow = '0 6px 18px rgba(14,165,164,0.18)';
  btn.style.cursor = 'pointer';
  btn.style.fontWeight = '600';

  btn.addEventListener('click', async () => {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    const choice = await deferredPwaPrompt.userChoice;
    // hide button after user responds
    btn.remove();
    deferredPwaPrompt = null;
    console.log('PWA install choice:', choice.outcome);
  });

  document.body.appendChild(btn);
}

function removeInstallUI() {
  const el = document.getElementById('pwa-install-btn');
  if (el) el.remove();
}

function createFooterCTA() {
  if (document.getElementById('pwa-install-footer-cta')) return;
  const btn = document.createElement('button');
  btn.id = 'pwa-install-footer-cta';
  btn.innerText = 'Install Elite Hub';
  btn.style.display = 'none';
  btn.style.position = 'fixed';
  btn.style.right = '12px';
  btn.style.bottom = '12px';
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '20px';
  btn.style.background = '#2563eb';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  btn.style.zIndex = '9999';
  btn.style.fontSize = '14px';
  btn.style.cursor = 'pointer';

  btn.addEventListener('click', async () => {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    const choice = await deferredPwaPrompt.userChoice;
    // hide after response
    btn.style.display = 'none';
    deferredPwaPrompt = null;
    console.log('PWA install choice (footer):', choice.outcome);
    removeInstallUI();
  });

  document.body.appendChild(btn);
}

function showFooterCTA() {
  createFooterCTA();
  const el = document.getElementById('pwa-install-footer-cta');
  if (!el) return;
  el.style.display = 'inline-block';
}

function hideFooterCTA() {
  const el = document.getElementById('pwa-install-footer-cta');
  if (!el) return;
  el.style.display = 'none';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('ServiceWorker registered.', reg))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  });
}

// Listen for the beforeinstallprompt event to show an install button
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  createInstallUI();
  // show footer CTA if present
  try { showFooterCTA(); } catch (err) { /* ignore */ }
});

// Optionally hide the button after install
window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  deferredPwaPrompt = null;
  removeInstallUI();
  try { hideFooterCTA(); } catch (err) { /* ignore */ }
});

// If the page becomes visible and deferred prompt exists, ensure UI is visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && deferredPwaPrompt) createInstallUI();
});

