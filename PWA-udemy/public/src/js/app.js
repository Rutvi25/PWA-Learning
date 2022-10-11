var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll(
  '.enable-notifications'
);

if (!window.Promise) {
  window.Promise = Promise;
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('service worker registered!!!');
    })
    .catch(function (err) {
      console.log(err);
    });
}
window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstalledprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    var options = {
      body: 'you successfully subscribed to our notification service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr', //indicates direction, left to right
      lang: 'en-US',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification', // tag acts like an id for perticular notification.
      // In case of multiple notifications, the latest notification with same tag will replace the previous one with same tag.
      renotify: true, // if renotify is true, even if the same tag is used, new notification will vibrate again, and alert the user.
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
      ],
    };
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification('Successfully subscribed!(from SW)', options);
    });
  }
}
function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then(function (swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (sub === null) {
        // create a new subscription
        var vapidPublicKey =
          'BEe5nc-1shUdjnNbezh2H3hq1uTZozU2HeP9FTuvjU7RV0rCX7pgzdB4xfuicBHHVt5AIQDQ73NBqCTA3LWeKrw';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      } else {
      }
    })
    .then(function (newSub) {
      console.log(newSub);
      return fetch(
        'https://pwagram-d7a1c-default-rtdb.firebaseio.com/subscriptions.json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(newSub),
        }
      );
    })
    .then(function (res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}
function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log('User choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted');
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}
if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener(
      'click',
      askForNotificationPermission
    );
  }
}
