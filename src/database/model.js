const config = require('./database.config');
const sql = require('mssql');

exports.db= sql.connect(config, function(err) {
    if(err) {
        console.log("err", err)
    }
    else{
        console.log("connected")
    }
})





