// const FCM = require('fcm-push');
const dotenv = require("dotenv")
dotenv.config()
// const serverKey = process.env.FCM_SERVER_KEY || "AAAAI4hmuJs:APA91bG4RwF3fwhwjV_ARn0tQnzlpqCO_9US1u2iaNsHQK-O1hotpXDNAq3UkY9xUI2MZbN1jhuxnN-GyQg_6kjxzqQ9CJbDnb2iMKwywgRjedDt8rmmOWbEclN3gXpZ42Gshp7k-ILr";
// console.log(serverKey)
// const fcm = new FCM(serverKey);
const model = require("../database/model")
const sql = require('mssql');


const admin = require("firebase-admin");

var serviceAccount = require("../../service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = {
    sendPushNotification: async (data, callback) => {
        const { projectType, PhotoType, userName, Location, userId } = data
        try {
            const request = model.db.request();
            // let query = `SELECT FCMToken FROM UserMasterDetail WHERE Userid = @Userid;`
            // request.input("Userid", sql.Int, userId)
            let query = `SELECT userName, FCMToken FROM UserMasterDetail WHERE userName IN ('IC002','G5024857M')`
            const response = await request.query(query)
            console.log("response.recordset", response.recordset)
            if (response.recordset.length > 0) {
                // if (response.recordset[0].FCMToken === null) {
                //     return callback(null, "FCM Token Not Found")
                // }

                response.recordset.forEach(async (token) => {

                    const payload = {
                        token: token.FCMToken,
                        notification: {
                            title: userName,
                            body: `${projectType} - ${PhotoType} at ${Location}`,
                        },
                        data: {
                            message: PhotoType
                        }

                    };
                    try {
                        const result = await admin.messaging().send(payload);
                        return callback(null, result)
                    } catch (err) {
                        if (err.code === 'messaging/registration-token-not-registered') {
                            console.error('Token not registered.');
                        } else {
                            console.error('Error sending message:', err);
                        }
                    }
                })

            } else {
                callback(null, "userNotFount")
            }

        } catch (err) {
            console.log("err", err)
            return callback(err)
        }

    }
}




