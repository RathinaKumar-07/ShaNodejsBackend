const express = require('express');
const cors = require('cors');
const body_parser = require('body-parser');
const dotenv = require('dotenv')
const userRoutes = require('./src/user/user.routes');
const imageRoute = require('./src/image/imageRoute');
const timeManagement = require('./src/TimeManagement/TimeManagement.routes')
const jobSheet = require("./src/JobSheet/JobSheet.routes")
// const notify = require("./src/PushNotification/PushNotifiy.routes")
dotenv.config();

const app = express();

app.use(cors({
    origin: '*'
    , credentials: true
}))

app.use(body_parser.json())

app.use("/images", express.static("uploads"));


app.get('/', (req, res) => {
    res.json({
        message: "home"
    })
})

app.use('/user', userRoutes);

app.use('/img', imageRoute);

app.use('/timemanagement', timeManagement)

app.use("/jobSheet", jobSheet)

// app.use("/notify", notify)


const port = 4001;

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})