const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Triggers when a user starts a conversation with a friend and sends a notification.
 *
 * conversations `/chats/{messageId}`.
 */

exports.sendPushNotification = functions.database.ref('/chats/{chatHead}/{messageId}').onWrite(event => {

    if (!event.data) {
        console.log('data is null');
        return
    }
    console.log('data =  ', event.data.val());

    const senderId = event.data.val().senderId;
    const receiverId = event.data.val().receiverId;
    const message = event.data.val().message;

    if(!senderId) {
        console.log('No sender found')
        return;
    }

    if(!receiverId) {
        console.log('No receiver found')
        return;
    }

    if(!message) {
        console.log('No message found')
        return;
    }

    const payload = {
        data : {
            title  : 'Fire Chat',
            sender : senderId,
            message  : message
        }
    }

    const options = {
        priority : 'high',
        content_available : true
    }

    return admin.database().ref('users/${receiver}/fcmToken').once('value')
        .then((results) => {
            admin.messaging.sendToDevice(results, payload, options)
                .then(function(response) {
                    console.log("Successfully sent message:", response);
                })
                .catch(function(error) {
                    console.log("Error sending message:", error);
                });
        });
});
