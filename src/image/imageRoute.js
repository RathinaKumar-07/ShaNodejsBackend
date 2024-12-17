const { upload } = require("../database/imageMulter")
const express = require("express");
const router = express.Router()

const moment = require('moment-timezone');

router.post('/timeUpload', upload.array('photos', 10), async (req, res) => {

    try {
        const data = [...req.files];
        console.log("dataArray", data)
        const times = Array.isArray(req.body.time) ? req.body.time : [req.body.time];

        console.log("times", times)
        const longitudes = Array.isArray(req.body.longitude) ? req.body.longitude : [req.body.longitude];
        const latitudes = Array.isArray(req.body.latitude) ? req.body.latitude : [req.body.latitude];
        // const dateStringArray = times.map(time => moment.unix(time).tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss.SSS'));

        // console.log("dateStringArray", dateStringArray)
        const longitudeArray = longitudes.map(longitude => longitude);
        const latitudeArray = latitudes.map(latitude => latitude);
        // console.log("time",dateStringArray)
        if (req.files) {

            const updatedData = data.map((file, index) => {
                return {
                    ...file,
                    // "dateTime": dateStringArray[index],
                    "dateTime": req.body.time,
                    "longitude": longitudeArray[index],
                    "latitude": latitudeArray[index]
                };
            });
            console.log("updatedData", updatedData)
            res.json({
                status: 200,
                message: "Image Uploaded",
                data: updatedData
            });
            // console.log(updatedData)
        }

    }
    catch (err) {
        // console.log(err)
        return res.status(500).json({
            success: 0,
            message: "Image Upload Error!"
        })
    }
});

module.exports = router
