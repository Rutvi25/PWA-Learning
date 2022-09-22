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
      badge: '/src/images/ions/app-icon-96x96.png',
      tag: 'confirm-notification', // tag acts like an id for perticular notification.
      // In case of multiple notifications, the latest notification with same tag will replace the previous one with same tag.
      renotify: true, // if renotify is true, even if the same tag is used, new notification will vibrate again, and alert the user.
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/src/images/ions/app-icon-96x96.png',
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/src/images/ions/app-icon-96x96.png',
        },
      ],
    };
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification('Successfully subscribed (from SW)!', options);
    });
  }
}
function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log('User choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted');
    } else {
      displayConfirmNotification();
    }
  });
}
if ('Notification' in window) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener(
      'click',
      askForNotificationPermission
    );
  }
}
