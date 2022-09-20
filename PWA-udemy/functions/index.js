var functions = require('firebase-functions');
var admin = require('firebase-admin');
const { serviceAccountFromShorthand } = require('firebase-functions/lib/common/encoding');
var cors = require('cors')({ origin: true });

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
        response
          .status(201)
          .json({ message: 'Data stored', id: request.body.id });
      })
      .catch(function (err) {
        response.status(500).json({ error: err });
      });
  });
});
