const model = require('../database/model');
const sql =require('mssql');
module.exports ={
    createUser :async (data, callback)=>{

        try{
            let query =`insert into user (name, email, password, phno) values (@name,@email,@password,@phno)`
            
                const request = model.db.request();
                request
                .input('name',sql.VarChar(50),data.name)
                .input('email',sql.VarChar(50),data.email)
                .input('password',sql.VarChar(50),data.password)
                .iput('phno',sql.VarChar(50),data.phno)
                const result =await request.query(query);
                return callback(null,result.recordset[0]);
        }
        catch(err){
            return callback(err)
        }
    },
    getuserByLoginID : async (data, callback)=>{
        try{
            let query = `select * from UserMasterDetail where UserName=@LoginName`
            const request =model.db.request();
            request.input('LoginName',data.LoginName)
            console.log(data)
            const result =await request.query(query);
            // console.log(result.recordset[0]);
            return callback(null,result.recordset[0]);
        }
        catch(err){
            return callback(err)
        }
    },
    
}   