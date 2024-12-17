const model = require('../database/model');
const sql = require('mssql');

module.exports = {

  createTimeSheetManagement: async (data, callback) => {

    try {
      const request = model.db.request();
      const worker_id = data.user_id
      const projectTypeId = data.projectTypeId
      const projectName = data.projectName
      const photoTypeId = data.photoTypeId
      const path = data.image[0].path
      const latitude = data.image[0].latitude
      const longitude = data.image[0].longitude
      const dateTime = data.image[0].dateTime
      const createBy = data.user_id

      // console.log(worker_id, projectTypeId, projectName, photoTypeId, path, latitude, longitude, dateTime)

      query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                      @workers_id,@projectTypeId,@projectName,@createBy
                  )`;
      request
        .input('workers_id', sql.Int, worker_id)
        .input('projectTypeId', sql.Int, projectTypeId)
        .input('projectName', projectName)
        .input('createBy', createBy);


      await request.query(query);

      // query = "insert into workOrderImage (ImagePath, WorkOrderId, StartTime) values " +
      //  .map(function (x) {
      //     return "('" + x.path + "'," + workID +",'"+x.time +"')";
      //   }).join(", ");

      query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
      let response = await request.query(query);
      // console.log(response.recordset);
      const TimeSheetId = await response.recordset[0].TimeSheetId
      query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
        @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
    )`;

      request
        .input('TimesheetId', sql.Int, TimeSheetId)
        .input('Latitude', sql.VarChar(50), latitude)
        .input('Longitude', sql.VarChar(50), longitude)
        .input('StartTime', dateTime)
        .input('photoTypeId', photoTypeId)
        .input('photopath', path)
        .input('createdBy', createBy)




      response = await request.query(query);

      // console.log(response)

      return callback(null, response);

      // }

    } catch (err) {
      return callback(err);
    }
  },
  getPhotoTypeId: async (callback) => {
    try {
      const request = model.db.request();
      let query = `select PhotoTypeId,PhotoType from PhotoTypeID`
      const response = await request.query(query);
      return callback(null, response.recordset);
    }
    catch (err) {
      return callback(err)
    }
  },
  getProjectTypeMaster: async (callback) => {
    try {
      const request = model.db.request();
      let query = `select ProjectTypeId,ProjectType from ProjectTypeMaster`;
      const response = await request.query(query);
      return callback(null, response.recordset);
    }
    catch (err) {
      return callback(err);
    }
  },
  createLogTimeSheetManageent: async (data, callback) => {
    try {
      const request = model.db.request();

      const worker_id = data.user_id
      const projectTypeId = data.projectTypeId
      const projectName = data.projectName
      const photoTypeId = data.photoTypeId
      const path = data.image[0].path
      const latitude = data.image[0].latitude
      const longitude = data.image[0].longitude
      const dateTime = data.image[0].dateTime
      const createBy = data.user_id
      const workerid = data.user_id
      let startTimelength = 0
      let EndTimeLength = 0



      let query = `SELECT * FROM TimeManagement tm 
              JOIN TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID 
              WHERE ts.WorkersId = @workersid 
              AND CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) or CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1));`;

      request.input('workersid', sql.Int, worker_id);
      let response = await request.query(query);

      // console.log(response.recordset)

      if (response.recordset && response.recordset.length > 0) {
        console.log("record Found!")


        const dateObject = new Date(dateTime.replace(' ', 'T'));

        const currentHour = dateObject.getHours();

        console.log(dateTime, currentHour)

        if (currentHour >= 8 && currentHour < 20) {


          // console.log("8 to 8 pm", worker_id);

          query = `SELECT ts.ProjectTypeId
          FROM dbo.TimeManagement tm
          JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
          WHERE  CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()))
          AND  DatePART(HOUR,tm.EntryTime)BETWEEN 8 AND 20 and PhotoTypeId=1 and ts.WorkersId =${worker_id}`


          response = await request.query(query);

          // console.log(response.recordset)


          if (response.recordset && response.recordset.length > 0) {

            startTimelength = response.recordset.length
            // console.log(startTimelength)

            // console.log("startime Exists", startTimelength)

            let projecttypeid = response.recordset[startTimelength - 1].ProjectTypeId

            // console.log(projecttypeid, projectTypeId)

            query = `SELECT ts.ProjectTypeId
            FROM dbo.TimeManagement tm
            JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            WHERE PhotoTypeId=2 and ts.WorkersId =${worker_id} 
            and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE,dateadd(hh,8,GETUTCDATE()))
            AND  DatePART(HOUR,tm.EntryTime)BETWEEN 8 AND 20`


            response = await request.query(query);

            if (response.recordset && response.recordset.length > 0) {
              EndTimeLength = response.recordset.length
              // console.log("endtime exists", EndTimeLength)

              if (startTimelength === EndTimeLength) {
                // console.log("even condition start time insert ")

                if (photoTypeId === 1) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                      @workers_id,@projectTypeId,@projectName,@createBy
                  )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('projectName', projectName)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                    )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else {
                  // console.log("Need start time to insert");
                  return callback(null, "No Record");
                }

              }
              else {
                // console.log("odd condition insert end time ")
                if (projecttypeid != projectTypeId) {
                  //  console.log("project not exists")
                  return callback(null, "project not Exists")
                }
                else {
                  //  console.log("Project exists")
                  if (photoTypeId == 3) {
                    //  console.log("location change")
                    query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                      @workers_id,@projectTypeId,@projectName,@createBy
                  )`;
                    request
                      .input('workers_id', sql.Int, worker_id)
                      .input('projectTypeId', sql.Int, projectTypeId)
                      .input('projectName', projectName)
                      .input('createBy', createBy);

                    await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                    let response = await request.query(query);
                    //  console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                    )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);
                  }
                  if (photoTypeId === 2) {
                    query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                      @workers_id,@projectTypeId,@projectName,@createBy
                  )`;
                    request
                      .input('workers_id', sql.Int, worker_id)
                      .input('projectTypeId', sql.Int, projectTypeId)
                      .input('projectName', projectName)
                      .input('createBy', createBy);

                    await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                    let response = await request.query(query);
                    //  console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                    )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);

                  }
                  else {
                    //  console.log("Need start time to insert");
                    return callback(null, "Record exists");
                  }
                }
              }
            }
            else {
              //  console.log("endtime not exists");
              if (projecttypeid != projectTypeId) {
                //  console.log("project not exists")
                return callback(null, "project not Exists")
              }
              else {
                //  console.log("Project exists")
                if (photoTypeId === 3) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                    @workers_id,@projectTypeId,@projectName,@createBy
                )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('projectName', projectName)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                  let response = await request.query(query);
                  console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                    @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                  )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else if (photoTypeId === 2) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                    @workers_id,@projectTypeId,@projectName,@createBy
                )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('projectName', projectName)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                  let response = await request.query(query);
                  console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                    @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                  )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else {
                  //  console.log("Need start time to insert");
                  return callback(null, "Record exists");
                }
              }
            }
          }
          // return callback(null, "Time issuse");
          else {
            //   console.log("no start time Exists")
            //  console.log(" No Record ! if ph 1 insert")
            if (photoTypeId === 1) {
              query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                @workers_id,@projectTypeId,@projectName,@createBy
            )`;
              request
                .input('workers_id', sql.Int, worker_id)
                .input('projectTypeId', sql.Int, projectTypeId)
                .input('projectName', projectName)
                .input('createBy', createBy);

              await request.query(query);

              query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
              let response = await request.query(query);
              //   console.log(response.recordset);
              const TimeSheetId = await response.recordset[0].TimeSheetId
              query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
              )`;
              request
                .input('TimesheetId', sql.Int, TimeSheetId)
                .input('Latitude', sql.VarChar(50), latitude)
                .input('Longitude', sql.VarChar(50), longitude)
                .input('StartTime', dateTime)
                .input('photoTypeId', photoTypeId)
                .input('photopath', path)
                .input('createdBy', createBy)

              response = await request.query(query);
              return callback(null, response);

            }
            else {
              //  console.log("Need start time to insert");
              return callback(null, "No Record");
            }

          }

        }
        else {
          // console.log("8 to 8 am", worker_id);


          query = `SELECT ts.ProjectTypeId 
          FROM dbo.TimeManagement tm
          JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
          WHERE ts.WorkersId =${worker_id} and PhotoTypeId=1  
          and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) AND DatePART(HOUR,tm.EntryTime)BETWEEN 20 and 23
          and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8
          UNION ALL
          SELECT ts.ProjectTypeId 
          FROM dbo.TimeManagement tm
          JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
          WHERE ts.WorkersId =${worker_id} and PhotoTypeId=1 
          and  CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1)) 
          and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8`

          // console.log("check point one ----> or to and 5th line")

          // response = await request.query(query);

          // console.log("Total prev and next record length", response.recordset.length);


          if (response.recordset && response.recordset.length > 0) {

            startTimelength = response.recordset.length
            // console.log(startTimelength)

            // console.log("startime Exists", startTimelength)

            // console.log("response project", response.recordset[startTimelength - 1].ProjectTypeId, projectTypeId)
            let projecttypeid = response.recordset[startTimelength - 1].ProjectTypeId;  // project id 
            // if (! response.recordset || response.recordset.length == 0) {
            //   console.log("project not exists")
            //   return callback(null, "project not Exists")
            // }
            // else {

            // console.log("project exists")

            // query = `SELECT ts.ProjectTypeId as projectID
            // FROM dbo.TimeManagement tm
            // JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            // WHERE ts.WorkersId =${worker_id} and PhotoTypeId=2  
            // and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) AND DatePART(HOUR,tm.EntryTime)BETWEEN 20 and 23
            // or CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1)) 
            // and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8`
            query = `SELECT ts.ProjectTypeId 
            FROM dbo.TimeManagement tm
            JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            WHERE ts.WorkersId =${worker_id} and PhotoTypeId=2  
            and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) AND DatePART(HOUR,tm.EntryTime)BETWEEN 20 and 23
            and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8
			      UNION ALL
			      SELECT ts.ProjectTypeId
            FROM dbo.TimeManagement tm
            JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            WHERE ts.WorkersId =${worker_id} and PhotoTypeId=2  
            and  CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1)) 
            and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8`

            // console.log("check point one -----> or to and")


            response = await request.query(query);


            // console.log("endtime checking",response.recordset)

            // if(response.recordset){
            //   const demo = new set(response.recordset.map((item)=>item.projectID))
            //    console.log("demo",demo)
            // }

            if (response.recordset && response.recordset.length > 0) {
              // if(response.recordset)
              EndTimeLength = response.recordset.length
              // console.log("endtime exists", EndTimeLength)

              if (startTimelength === EndTimeLength) {
                // console.log("even condition start time insert ")
                if (photoTypeId === 1) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                      @workers_id,@projectTypeId,@projectName,@createBy
                  )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('projectName', projectName)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                    )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else {
                  // console.log("Need start time to insert");
                  return callback(null, "No Record");
                }

              }
              else {
                // console.log("odd condition insert end time ")
                if (projecttypeid != projectTypeId) {
                  // console.log("project not exists")
                  return callback(null, "project not Exists")
                }
                else {
                  // console.log("project exists")
                  if (photoTypeId === 3) {
                    // console.log("location change");
                    // console.log("location change can enable");
                    query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                    @workers_id,@projectTypeId,@projectName,@createBy
                    )`;
                    request
                      .input('workers_id', sql.Int, worker_id)
                      .input('projectTypeId', sql.Int, projectTypeId)
                      .input('projectName', projectName)
                      .input('createBy', createBy);

                    await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                    let response = await request.query(query);
                    // console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                    @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                  )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);
                  }
                  else if (photoTypeId === 2) {
                    query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                      @workers_id,@projectTypeId,@projectName,@createBy
                  )`;
                    request
                      .input('workers_id', sql.Int, worker_id)
                      .input('projectTypeId', sql.Int, projectTypeId)
                      .input('projectName', projectName)
                      .input('createBy', createBy);

                    await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                    let response = await request.query(query);
                    // console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                    )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);

                  }
                  else {
                    // console.log("Need start time to insert");
                    return callback(null, "Record exists");
                  }
                }
              }
            }
            else {
              // console.log("endtime not exists");
              if (projecttypeid != projectTypeId) {
                // console.log("project not exists")
                return callback(null, "project not Exists")
              }
              else {
                // console.log("project exists")
                if (photoTypeId === 3) {
                  // console.log("location change can enable");
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                    @workers_id,@projectTypeId,@projectName,@createBy
                )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('projectName', projectName)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                    @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                  )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else if (photoTypeId === 2) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                    @workers_id,@projectTypeId,@projectName,@createBy
                )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('projectName', projectName)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                    @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
                  )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);
                }
                else {
                  callback(null, "Record exists");

                }
              }
            }
          }

          // return callback(null, "Time issuse");
          else {
            // console.log("no start time Exists");
            // console.log(" No Record ! if ph 1 insert");
            if (photoTypeId === 1) {
              query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                @workers_id,@projectTypeId,@projectName,@createBy
            )`;
              request
                .input('workers_id', sql.Int, worker_id)
                .input('projectTypeId', sql.Int, projectTypeId)
                .input('projectName', projectName)
                .input('createBy', createBy);

              await request.query(query);

              query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
              let response = await request.query(query);
              // console.log(response.recordset);
              const TimeSheetId = await response.recordset[0].TimeSheetId
              query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
                @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
              )`;
              request
                .input('TimesheetId', sql.Int, TimeSheetId)
                .input('Latitude', sql.VarChar(50), latitude)
                .input('Longitude', sql.VarChar(50), longitude)
                .input('StartTime', dateTime)
                .input('photoTypeId', photoTypeId)
                .input('photopath', path)
                .input('createdBy', createBy)

              response = await request.query(query);
              return callback(null, response);

            }
            else {
              // console.log("Need start time to insert");
              return callback(null, "No Record");
            }

          }
        }

      }

      else {
        // console.log(" No Record ! if ph 1 insert")
        if (photoTypeId === 1) {
          query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
            @workers_id,@projectTypeId,@projectName,@createBy
        )`;
          request
            .input('workers_id', sql.Int, worker_id)
            .input('projectTypeId', sql.Int, projectTypeId)
            .input('projectName', projectName)
            .input('createBy', createBy);

          await request.query(query);

          query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster`;
          let response = await request.query(query);
          // console.log(response.recordset);
          const TimeSheetId = await response.recordset[0].TimeSheetId
          query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,CreateBy) values (
            @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@createdBy
          )`;
          request
            .input('TimesheetId', sql.Int, TimeSheetId)
            .input('Latitude', sql.VarChar(50), latitude)
            .input('Longitude', sql.VarChar(50), longitude)
            .input('StartTime', dateTime)
            .input('photoTypeId', photoTypeId)
            .input('photopath', path)
            .input('createdBy', createBy)

          response = await request.query(query);
          return callback(null, response);

        }
        else {
          // console.log("Need start time to insert");
          return callback(null, "No Record");
        }

      }
    }
    catch (err) {
      // console.log(err)
      return callback(err);
    }
  },
  createLogTimeSheetManagement: async (data, callback) => {
    try {

      const request = model.db.request();

      const worker_id = data.user_id
      const projectTypeId = data.projectTypeId
      const projectName = data.projectName
      const photoTypeId = data.photoTypeId
      const path = data.image[0].path
      const latitude = data.image[0].latitude
      const longitude = data.image[0].longitude
      const dateTime = data.image[0].dateTime
      const createBy = data.user_id
      const workerid = data.user_id
      let startTimelength = 0
      let EndTimeLength = 0


      let query = `SELECT * FROM TimeManagement tm 
                JOIN TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID 
                WHERE ts.WorkersId = @workersid 
                AND CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) or CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1));`;

      request.input('workersid', sql.Int, worker_id);
      let response = await request.query(query);

      // console.log("check data present or not ", response.recordset)

      if (response.recordset && response.recordset.length > 0) {
        // console.log("record Found!")


        const dateObject = new Date(dateTime.replace(' ', 'T'));

        const currentHour = dateObject.getHours();

        // console.log(dateTime, currentHour)

        if (currentHour >= 8 && currentHour < 20) {


          // console.log("8 to 8 pm", worker_id);

          query = `SELECT ts.ProjectTypeId
            FROM dbo.TimeManagement tm
            JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            WHERE  CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()))
            AND  DatePART(HOUR,tm.EntryTime)BETWEEN 8 AND 20 and PhotoTypeId=1 and ts.WorkersId =${worker_id}`


          response = await request.query(query);

          // console.log(response.recordset)


          if (response.recordset && response.recordset.length > 0) {

            startTimelength = response.recordset.length
            // console.log(startTimelength)

            // console.log("startime Exists", startTimelength)

            let projecttypeid = response.recordset[startTimelength - 1].ProjectTypeId

            // console.log(projecttypeid, projectTypeId)

            query = `SELECT ts.ProjectTypeId
              FROM dbo.TimeManagement tm
              JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
              WHERE PhotoTypeId=2 and ts.WorkersId =${worker_id} 
              and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE,dateadd(hh,8,GETUTCDATE()))
              AND  DatePART(HOUR,tm.EntryTime)BETWEEN 8 AND 20`


            response = await request.query(query);

            if (response.recordset && response.recordset.length > 0) {
              EndTimeLength = response.recordset.length
              // console.log("endtime exists", EndTimeLength)

              if (startTimelength === EndTimeLength) {
                console.log("even condition start time insert ")

                if (photoTypeId === 1) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                        @workers_id,@projectTypeId,@createBy
                    )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid =${worker_id}`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                        @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                      )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('projectName', projectName)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else {
                  // console.log("Need start time to insert");
                  return callback(null, "No Record");
                }

              }
              else {
                // console.log("odd condition insert end time ")
                if (projecttypeid != projectTypeId) {
                  //  console.log("project not exists")
                  return callback(null, "project not Exists")
                }
                else {
                  //  console.log("Project exists")
                  if (photoTypeId == 3) {
                    //  console.log("location change")

                    // ---> change made master table removed 
                    //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                    //     @workers_id,@projectTypeId,@createBy
                    // )`;
                    //   request
                    //     .input('workers_id', sql.Int, worker_id)
                    //     .input('projectTypeId', sql.Int, projectTypeId)
                    //     .input('createBy', createBy);

                    //   await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid =${workerid}`;
                    let response = await request.query(query);
                    //  console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                        @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                      )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('projectName', projectName)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);
                  }
                  if (photoTypeId === 2) {

                    // change made master table removed 
                    //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                    //     @workers_id,@projectTypeId,@createBy
                    // )`;
                    //   request
                    //     .input('workers_id', sql.Int, worker_id)
                    //     .input('projectTypeId', sql.Int, projectTypeId)
                    //     .input('createBy', createBy);

                    //   await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid = ${worker_id}`;
                    let response = await request.query(query);
                    //  console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                        @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                      )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('projectName', projectName)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);

                  }
                  else {
                    //  console.log("Need start time to insert");
                    return callback(null, "Record exists");
                  }
                }
              }
            }
            else {
              // console.log("endtime not exists");
              if (projecttypeid != projectTypeId) {
                //  console.log("project not exists")
                return callback(null, "project not Exists")
              }
              else {
                //  console.log("Project exists")
                if (photoTypeId === 3) {

                  //change made master removed 
                  //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                  //     @workers_id,@projectTypeId,@createBy
                  // )`;
                  //   request
                  //     .input('workers_id', sql.Int, worker_id)
                  //     .input('projectTypeId', sql.Int, projectTypeId)
                  //     .input('createBy', createBy);

                  //   await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                    )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('projectName', projectName)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else if (photoTypeId === 2) {

                  // change made removed master 
                  //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                  //     @workers_id,@projectTypeId,@createBy
                  // )`;
                  //   request
                  //     .input('workers_id', sql.Int, worker_id)
                  //     .input('projectTypeId', sql.Int, projectTypeId)
                  //     .input('createBy', createBy);

                  //   await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                    )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('projectName', projectName)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else {
                  //  console.log("Need start time to insert");
                  return callback(null, "Record exists");
                }
              }
            }
          }
          // return callback(null, "Time issuse");
          else {
            // console.log("no start time Exists")
            // console.log(" No Record ! if ph 1 insert")
            if (photoTypeId === 1) {
              query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                  @workers_id,@projectTypeId,@createBy
              )`;
              request
                .input('workers_id', sql.Int, worker_id)
                .input('projectTypeId', sql.Int, projectTypeId)
                .input('createBy', createBy);

              await request.query(query);

              query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
              let response = await request.query(query);
              //   console.log(response.recordset);
              const TimeSheetId = await response.recordset[0].TimeSheetId
              query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                  @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                )`;
              request
                .input('TimesheetId', sql.Int, TimeSheetId)
                .input('Latitude', sql.VarChar(50), latitude)
                .input('Longitude', sql.VarChar(50), longitude)
                .input('StartTime', dateTime)
                .input('photoTypeId', photoTypeId)
                .input('photopath', path)
                .input('projectName', projectName)
                .input('createdBy', createBy)

              response = await request.query(query);
              return callback(null, response);

            }
            else {
              //  console.log("Need start time to insert");
              return callback(null, "No Record");
            }

          }

        }
        else {
          // console.log("8 to 8 am", worker_id);


          // query = `SELECT ts.ProjectTypeId 
          // FROM dbo.TimeManagement tm
          // JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
          // WHERE ts.WorkersId =${worker_id} and PhotoTypeId=1  
          // and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) 
          // or DatePART(HOUR,tm.EntryTime)BETWEEN 20 and 23
          // and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8
          // UNION ALL
          // SELECT ts.ProjectTypeId 
          // FROM dbo.TimeManagement tm
          // JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
          // WHERE ts.WorkersId =${worker_id} and PhotoTypeId=1 
          // and  CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1)) 
          // and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8`

          query = `
            SELECT ts.ProjectTypeId 
            FROM dbo.TimeManagement tm
            JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            WHERE ts.WorkersId = ${worker_id}
            AND tm.PhotoTypeId = 1
            AND (
                (CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, DATEADD(HOUR, 8, GETUTCDATE())) AND DATEPART(HOUR, tm.EntryTime) BETWEEN 20 AND 23)
                OR 
                (CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, DATEADD(HOUR, 8, GETUTCDATE() + 1)) AND DATEPART(HOUR, tm.EntryTime) BETWEEN 0 AND 8)
            )
            `

          // console.log("check point one ----> or to and 5th line")

          response = await request.query(query);

          // console.log("Total prev and next record length", response.recordset.length);


          if (response.recordset && response.recordset.length > 0) {

            startTimelength = response.recordset.length
            // console.log(startTimelength)

            // console.log("startime Exists", startTimelength)

            // console.log("response project", response.recordset[startTimelength - 1].ProjectTypeId, projectTypeId)
            let projecttypeid = response.recordset[startTimelength - 1].ProjectTypeId;  // project id 
            // if (! response.recordset || response.recordset.length == 0) {
            //   console.log("project not exists")
            //   return callback(null, "project not Exists")
            // }
            // else {

            // console.log("project exists")

            // query = `SELECT ts.ProjectTypeId as projectID
            // FROM dbo.TimeManagement tm
            // JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            // WHERE ts.WorkersId =${worker_id} and PhotoTypeId=2  
            // and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) AND DatePART(HOUR,tm.EntryTime)BETWEEN 20 and 23
            // or CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1)) 
            // and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8`
            // query = `SELECT ts.ProjectTypeId 
            // FROM dbo.TimeManagement tm
            // JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            // WHERE ts.WorkersId =${worker_id} and PhotoTypeId=2  
            // and CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE())) 
            // or DatePART(HOUR,tm.EntryTime)BETWEEN 20 and 23
            // and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8
            // UNION ALL
            // SELECT ts.ProjectTypeId
            // FROM dbo.TimeManagement tm
            // JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
            // WHERE ts.WorkersId =${worker_id} and PhotoTypeId=2  
            // and  CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()+1)) 
            // and DatePART(HOUR,tm.EntryTime) BETWEEN 0 AND 8`

            query = `
              SELECT ts.ProjectTypeId 
              FROM dbo.TimeManagement tm
              JOIN dbo.TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
              WHERE ts.WorkersId = ${worker_id}
              AND tm.PhotoTypeId = 2
              AND (
              (CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, DATEADD(HOUR, 8, GETUTCDATE())) AND DATEPART(HOUR, tm.EntryTime) BETWEEN 20 AND 23)
              OR 
              (CONVERT(DATE, tm.EntryTime) = CONVERT(DATE, DATEADD(HOUR, 8, GETUTCDATE() + 1)) AND DATEPART(HOUR, tm.EntryTime) BETWEEN 0 AND 8)
              )
              `

            // console.log("check point one -----> or to and")


            response = await request.query(query);


            // console.log("endtime checking", response.recordset)

            // if(response.recordset){
            //   const demo = new set(response.recordset.map((item)=>item.projectID))
            //    console.log("demo",demo)
            // }

            if (response.recordset && response.recordset.length > 0) {
              // if(response.recordset)
              EndTimeLength = response.recordset.length
              // console.log("endtime exists", EndTimeLength)

              if (startTimelength === EndTimeLength) {
                // console.log("even condition start time insert ")
                if (photoTypeId === 1) {
                  query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                        @workers_id,@projectTypeId,@createBy
                    )`;
                  request
                    .input('workers_id', sql.Int, worker_id)
                    .input('projectTypeId', sql.Int, projectTypeId)
                    .input('createBy', createBy);

                  await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                        @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                      )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('projectName', projectName)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else {
                  // console.log("Need start time to insert");
                  return callback(null, "No Record");
                }

              }
              else {
                // console.log("odd condition insert end time ")
                if (projecttypeid != projectTypeId) {
                  // console.log("project not exists")
                  return callback(null, "project not Exists")
                }
                else {
                  // console.log("project exists")
                  if (photoTypeId === 3) {
                    console.log("location change");
                    // console.log("location change can enable");

                    // ---> changed to unique id --- master removed
                    // query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,ProjectName,CreateBy) values (
                    // @workers_id,@projectTypeId,@projectName,@createBy
                    // )`;
                    // request
                    //   .input('workers_id', sql.Int, worker_id)
                    //   .input('projectTypeId', sql.Int, projectTypeId)
                    //   .input('createBy', createBy);

                    // await request.query(query);

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                    let response = await request.query(query);
                    // console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                    )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('projectName', projectName)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);
                  }
                  else if (photoTypeId === 2) {


                    //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                    //     @workers_id,@projectTypeId,@createBy
                    // )`;
                    //   request
                    //     .input('workers_id', sql.Int, worker_id)
                    //     .input('projectTypeId', sql.Int, projectTypeId)
                    //     .input('createBy', createBy);

                    //   await request.query(query);

                    // changed master table removed

                    query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                    let response = await request.query(query);
                    // console.log(response.recordset);
                    const TimeSheetId = await response.recordset[0].TimeSheetId
                    query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                        @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                      )`;
                    request
                      .input('TimesheetId', sql.Int, TimeSheetId)
                      .input('Latitude', sql.VarChar(50), latitude)
                      .input('Longitude', sql.VarChar(50), longitude)
                      .input('StartTime', dateTime)
                      .input('photoTypeId', photoTypeId)
                      .input('photopath', path)
                      .input('projectName', projectName)
                      .input('createdBy', createBy)

                    response = await request.query(query);
                    return callback(null, response);

                  }
                  else {
                    // console.log("Need start time to insert");
                    return callback(null, "Record exists");
                  }
                }
              }
            }
            else {
              // console.log("endtime not exists");
              if (projecttypeid != projectTypeId) {
                // console.log("project not exists")
                return callback(null, "project not Exists")
              }
              else {
                // console.log("project exists")
                if (photoTypeId === 3) {
                  // console.log("location change can enable");

                  // --> changed made master table removed
                  //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                  //     @workers_id,@projectTypeId,@createBy
                  // )`;
                  //   request
                  //     .input('workers_id', sql.Int, worker_id)
                  //     .input('projectTypeId', sql.Int, projectTypeId)
                  //     .input('createBy', createBy);

                  //   await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                    )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('projectName', projectName)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);

                }
                else if (photoTypeId === 2) {

                  // console.log("project entry end time found ")

                  //   query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                  //     @workers_id,@projectTypeId,@createBy
                  // )`;
                  //   request
                  //     .input('workers_id', sql.Int, worker_id)
                  //     .input('projectTypeId', sql.Int, projectTypeId)
                  //     .input('createBy', createBy);

                  //   await request.query(query);

                  query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
                  let response = await request.query(query);
                  // console.log(response.recordset);
                  const TimeSheetId = await response.recordset[0].TimeSheetId
                  query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                      @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                    )`;
                  request
                    .input('TimesheetId', sql.Int, TimeSheetId)
                    .input('Latitude', sql.VarChar(50), latitude)
                    .input('Longitude', sql.VarChar(50), longitude)
                    .input('StartTime', dateTime)
                    .input('photoTypeId', photoTypeId)
                    .input('photopath', path)
                    .input('projectName', projectName)
                    .input('createdBy', createBy)

                  response = await request.query(query);
                  return callback(null, response);
                }
                else {
                  callback(null, "Record exists");

                }
              }
            }
          }

          // return callback(null, "Time issuse");
          else {
            // console.log("no start time Exists");
            // console.log(" No Record ! if ph 1 insert");
            if (photoTypeId === 1) {
              query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
                  @workers_id,@projectTypeId,@createBy
              )`;
              request
                .input('workers_id', sql.Int, worker_id)
                .input('projectTypeId', sql.Int, projectTypeId)

                .input('createBy', createBy);

              await request.query(query);

              query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${worker_id}`;
              let response = await request.query(query);
              // console.log(response.recordset);
              const TimeSheetId = await response.recordset[0].TimeSheetId
              query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
                  @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
                )`;
              request
                .input('TimesheetId', sql.Int, TimeSheetId)
                .input('Latitude', sql.VarChar(50), latitude)
                .input('Longitude', sql.VarChar(50), longitude)
                .input('StartTime', dateTime)
                .input('photoTypeId', photoTypeId)
                .input('photopath', path)
                .input('projectName', projectName)
                .input('createdBy', createBy)

              response = await request.query(query);
              return callback(null, response);

            }
            else {
              // console.log("Need start time to insert");
              return callback(null, "No Record");
            }

          }
        }

      }

      else {
        // console.log(" No Record ! if ph 1 insert else ")
        if (photoTypeId === 1) {
          query = `insert into TimesheetMaster(WorkersId,ProjectTypeId,CreateBy) values (
              @workers_id,@projectTypeId,@createBy
          )`;
          request
            .input('workers_id', sql.Int, worker_id)
            .input('projectTypeId', sql.Int, projectTypeId)
            .input('createBy', createBy);

          await request.query(query);

          query = `select Max(TimeSheetID) as TimeSheetId from TimesheetMaster where workersid=${workerid}`;
          let response = await request.query(query);
          // console.log("GET timesheetId", response.recordset);
          const TimeSheetId = await response.recordset[0].TimeSheetId
          query = `insert into TimeManagement(TimeSheetID,Latitude,Longitude,EntryTime,PhotoTypeId,PhotoPath,description,CreateBy) values (
              @TimesheetId,@Latitude,@Longitude,@StartTime,@photoTypeId,@photopath,@projectName,@createdBy
            )`;
          request
            .input('TimesheetId', sql.Int, TimeSheetId)
            .input('Latitude', sql.VarChar(50), latitude)
            .input('Longitude', sql.VarChar(50), longitude)
            .input('StartTime', dateTime)
            .input('photoTypeId', photoTypeId)
            .input('photopath', path)
            .input('projectName', projectName)
            .input('createdBy', createBy)

          response = await request.query(query);
          return callback(null, response);

        }
        else {
          // console.log("Need start time to insert");
          return callback(null, "No Record");
        }

      }


    }
    catch (err) {
      // console.log(err)
      return callback(err);
    }
  },
  getbyId: async (data, callback) => {
    const worker_id = data.user_id;

    try {
      const request = model.db.request();
      const query = `SELECT * FROM TimeManagement tm
                      JOIN TimesheetMaster ts ON tm.TimeSheetID = ts.TimeSheetID
                      WHERE ts.WorkersId = @workersid
                        AND CONVERT(DATE, tm.StartTime) = CONVERT(DATE, dateadd(hh,8,GETUTCDATE()))`;

      request.input('workersid', sql.Int, worker_id);
      const response = await request.query(query);
      if (response.recordset && response.recordset.length > 0) {
        // console.log(response.recordset[0]);
        return callback(null, response.recordset);
      } else {
        // console.log('No records found');
        return callback(null, []);
      }
    } catch (err) {
      console.error(err);
      return callback(err);
    }
  },
}