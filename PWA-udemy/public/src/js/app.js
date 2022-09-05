// var deferredPrompt;
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

setTimeout(function () {
  console.log('This is executed once the timer is done!!!')
}, 3000);
console.log('this is executed right after setTimeOut!!!')