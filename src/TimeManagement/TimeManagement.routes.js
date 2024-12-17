const express = require("express");
const {  createTimeSheetManagement,getPhotoTypeId,getProjectTypeMaster, createLogTimeSheetManagement, getbyId } = require("./TimeManagement.controller");

const router =express.Router()

router.post('/createTimeSheetManagement',createTimeSheetManagement);

router.get('/photoType',getPhotoTypeId);

router.get('/projectType',getProjectTypeMaster);

router.post('/createLogTimeManage',createLogTimeSheetManagement);

router.get('/timemanage',getbyId)


// router.post('/image',createImageTransaction);






module.exports =router