var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true})
var formidable = require('formidable');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
var serviceAccount = require("./pwagram-fbKey.json");

var gcconfig = {
  projectId: 'pwagram-d7a1c',
  keyFilename: 'pwagram-fbkey.json'
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  databaseURL: 'https://pwagram-d7a1c-default-rtdb.firebaseio.com/'
})
exports.storePostData = functions.https.onRequest(function (request, response) {
  cors(request, response, function(request, response) {
    admin.database().ref('posts').push({
      id: request.body.id
      title: request.body.title
      location: request.body.location
      image: request.body.image
    })
    .then(function() {
      webpush.setVapidDetails('mailto: business@academind.com', 
        'BEe5nc-1shUdjnNbezh2H3hq1uTZozU2HeP9FTuvjU7RV0rCX7pgzdB4xfuicBHHVt5AIQDQ73NBqCTA3LWeKrw', 
        'pmV3pOkCVM7RdF2nmnAsL6HFuX-wvhm2gOCn3rrgfpg'
      )
      return admin.database().ref('subscriptions').once('value')
    })
    .then(function(subscription) {
      subscriptions.forEach(function(sub){
        var pushConfig = {
          endpoint: sub.val().endpoint
          keys: {
            auth: sub.val().keys.auth()
            p256dh: sub.val().keys.p256dh
          }
        }
        webpush.sendNotification(pushConfig, JSON.stringify({
          title: 'New Post', 
          content: 'New post added!', 
          openURL: '/help'
        }))
          .catch(function(err) {
            console.log(err)
          })
      })
      response.status(201).json({message: 'Data stored!', id: request.body.id})
    })
    .catch(function(err) {
      response.status(500).json({error: err})
    })
  })
});
