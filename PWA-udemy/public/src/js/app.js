var deferredPrompt;
if(!window.Promise) {
  window.Promise = Promise;
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function () {
    console.log('service worker registered!!!');
  });
}
window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstalledprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});