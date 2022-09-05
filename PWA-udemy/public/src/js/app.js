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

var promise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve('This is executed once the timer is done!!!');
  }, 3000);
});
promise.then(function(text) {
  return text 
  console.log(text);
}).then(function(newText) {
  console.log(newText)
});
console.log('this is executed right after setTimeOut!!!');
