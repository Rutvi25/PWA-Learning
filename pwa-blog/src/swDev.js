export default function swDev() {
  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  function determineAppServerKey() {
    var vapidPublicKey =
      'BEe5nc-1shUdjnNbezh2H3hq1uTZozU2HeP9FTuvjU7RV0rCX7pgzdB4xfuicBHHVt5AIQDQ73NBqCTA3LWeKrw';
    return urlBase64ToUint8Array(vapidPublicKey);
  }
  let swUrl = `${process.env.PUBLIC_URL}/sw.js`;
  navigator.serviceWorker.register(swUrl).then((response) => {
    console.warn('response', response.scope);
    return response.pushManager.getSubscription().then(function (subscription) {
      return response.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: determineAppServerKey(),
      });
    });
  });
}
