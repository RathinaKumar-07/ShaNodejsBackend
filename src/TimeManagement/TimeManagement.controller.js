const { createTimeSheetManagement, getPhotoTypeId, getProjectTypeMaster, createLogTimeSheetManageent, getbyId, createLogTimeSheetManagement } = require('./TimeManagement.services')
module.exports = {
    createTimeSheetManagement: (req, res) => {
        const body = req.body
        createTimeSheetManagement(body, (err, result) => {
            if (err) {
                //     console.log("du",err)
                // if (err.message.startsWith("")) {
                //     const duplicateKeyValue = err.message.match(/value is \(([^)]+)\)/)[1];

                //     return res.status(403).json({
                //         success: 0,
                //         message: `WorkId ${duplicateKeyValue} is Already Exist`
                //     });
                // } else {
                // console.log("err", err)
                return res.status(500).json({
                    success: 0,
                    message: "Internal server Error",
                    err
                });
                // }
            }
            return res.status(200).json({
                success: 1,
                message: "Time Sheet Upload Successfully"
            })
        })
    },
    getPhotoTypeId: (req, res) => {
        getPhotoTypeId((err, result) => {
            if (err) {
                // console.log(err)
                res.status(500).json({
                    success: 0,
                    message: "Interal Server Error"
                })
            }
            return res.status(200).json({
                success: 1,
                data: result
            })
        })
    },
    getProjectTypeMaster: (req, res) => {
        getProjectTypeMaster((err, result) => {
            if (err) {
                // console.log(err)
                res.status(500).json({
                    success: 0,
                    message: "Interal Server Error",
                    err
                })
            }
            return res.status(200).json({
                success: 1,
                data: result
            })
        })
    },
    createLogTimeSheetManagement: (req, res) => {
        const body = req.body
        createLogTimeSheetManagement(body, (err, result) => {
            if (err) {
                // console.log(err)
                return res.status(500).json({
                    success: 0,
                    message: "Internal Server Error",
                    err
                })
            }
            else if (result == "Time issuse") {
                return res.status(409).json({
                    success: 0,
                    message: "Timing issuse"
                })
            }
            else if (result == "Record exists") {
                return res.status(409).json({
                    success: 0,
                    message: "Please give EndTime"
                })
            }
            else if (result == "No Record") {
                return res.status(403).json({
                    success: 0,
                    message: "Start Time Must be Given First"
                })
            }
            else if (result == "project not Exists") {
                return res.status(403).json({
                    success: 0,
                    message: "Different Project Name Entry"
                })
            }
            else {
                return res.status(200).json({
                    success: 1,
                    message: "Time Sheet Upload Successfull!"
                })
            }

        })
    },
    getbyId: (req, res) => {
        const body = req.body
        getbyId(body, (err, result) => {
            if (err) {
                // console.log(err)
                return res.status(500).json({
                    success: 0,
                    message: "Internal Server Error"
                })
            }
            return res.status(200).json({
                success: 1,
                data: result
            })
        })
    },

}