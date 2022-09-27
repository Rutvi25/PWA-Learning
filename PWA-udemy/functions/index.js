var functions = require('firebase-functions');
var admin = require('firebase-admin');
const {
  serviceAccountFromShorthand,
} = require('firebase-functions/lib/common/encoding');
var cors = require('cors')({ origin: true });
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-d7a1c-default-rtdb.firebaseio.com/',
});
exports.storePostData = functions.https.onRequest(function (request, response) {
  cors(request, response, function () {
    admin
      .database()
      .ref('posts')
      .push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image,
      })
      .then(function () {
        webpush.setVapidDetails(
          'mailto: abc@gmail.com',
          'BJgnF5WstHD_rV68pmWWzgCWv8VAaqq66bnHWp_cy4jbu4Umi21ViSDC2GV67eiYpWkY3J9BdIwXHK92oa5Nz7E',
          'qkh9i7O2IaLlkIjDNvEoFGAC6rzwao1A-GJY2j5vreo'
        );
        return admin.database().ref('subscriptions').once('value');
      })
      .then(function (subscriptions) {
        subscriptions.forEach(function (sub) {
          var pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh,
            },
          };
          webpush
            .sendNotification(
              pushConfig,
              JSON.stringify({
                title: 'New Post',
                content: 'New post added!',
                openURL: '/help'
              })
            )
            .catch(function (err) {
              console.log(err);
            });
        });
        response
          .status(201)
          .json({ message: 'Data stored', id: request.body.id });
      })
      .catch(function (err) {
        response.status(500).json({ error: err });
      });
  });
});
