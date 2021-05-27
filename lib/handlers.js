//these are the request handlers 

const helpers = require("./helper")
const _data = require("./data")



//container for the hanlders
const handlers = {}

    handlers.sample = function(data,callback){
        callback(406, {'Name': 'Sample Handler'})
    }

    handlers.ping = function(data,callback){
       
        callback(406, {'Name': 'Ping Handler'})
    }

    handlers.notFound = function(data, callback){
        callback(404)

    }

    //users handler 
    handlers.users = function(data, callback){
       
        var acceptableMethod = ['post','get','put','delete'];
        

        if(acceptableMethod.indexOf(data.method)>-1){
            
            handlers._users[data.method](data,callback);
        }else{
            callback(405,{"Error":"Invalid Method"})
        }
    }






//users handler 
 handlers.tokens = function(data, callback){
       
    var acceptableMethod = ['post','get','put','delete'];
       

    if(acceptableMethod.indexOf(data.method)>-1){
        console.log("Working")
        handlers._tokens[data.method](data,callback);
    }else{
        callback(405,{"Error":"Invalid Method"})
    }
}
 







    //cotainer for    handlers._users

    handlers._users = {};
  
    //   handlers._users post
    //    required data firstName,lastName phone, password, tosAgreement
    handlers._users.post = function(data,callback){
            //check all the required fileds
          
            let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length>0 ? data.payload.firstName.trim() : false;
            let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length>0 ? data.payload.lastName.trim() : false;
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim() : false;
            let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;
            let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ?  true : false;
          
              if(firstName && lastName && phone && password && tosAgreement){
            
            let hashedPassword=helpers.hashPassword(password)
             
            let userObject = {
                'firstName': firstName,
                'lastName' : lastName,
                'phone' : phone,
                'hashedPassword' : hashedPassword,
                'tosAgreement' : true
            };

            _data.create('users',phone,userObject, function(err){
                    if(!err){
                        callback(200,{"message":"User Created Successfully"})
                    }else{
                        console.log(err);
                        callback(400,{"Error":"User Can not be created"})
                    }
            })





 
        }else{
            callback(403,{"Error":"Missing Required Field"})
        }

           
           
    }



      // GET  handlers._users
      handlers._users.get = function(data,callback){
            const phone = typeof(data.queryStringObject.phone)=='string' && data.queryStringObject.phone.length==10 ?  data.queryStringObject.phone: false;
                if(phone){
                        _data.read('users',phone,function(err,data){
                            if(!err){ 
                                delete data.hashedPassword;
                                callback(200,data);
                            }else{
                                callback(404 ,{"Error":"User Not Found"})
                            }
                        })
                }else{
                    callback(403,{"Error":"Missing Required Field"})
                }
   
        }



          // Put  handlers._users
          handlers._users.put = function(data,callback){
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim() : false;

            let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length>0 ? data.payload.firstName.trim() : false;
            let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length>0 ? data.payload.lastName.trim() : false;
          
            let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;
           
            if(phone){

                if(firstName || lastName || password){

                    _data.read('users',phone, function(err, userData){
                        if(!err && userData){
                                if(firstName){
                                    userData.firstName= firstName;
                                }
                                if(lastName){
                                    userData.lastName=lastName;
                                }
                                if(password){
                                    userData.hashedPassword = helpers.hashPassword(password)
                                }

                                //update the values in file
                                _data.update('users',phone,userData,function(err){
                                    if(!err){
                                        callback(200,{"Message":"User Updated Successfully"})
                                    }else{
                                        callback(403,{"Error":"User Update is Failed"})
                                    }
                                })

                        }else{
                            callback(404,{"Error":"No User Found"})
                        }
                    })

                }else{
                    callback(404,{"Error":"Missing Required Field for Update"})
                }

            }else{
                callback(404 ,{"Error":"Missing Required Field"})
            }

        
        }

              // Delete  handlers._users
      handlers._users.delete = function(data,callback){
        const phone = typeof(data.queryStringObject.phone)=='string' && data.queryStringObject.phone.length==10 ?  data.queryStringObject.phone: false;
           if(phone){
                    //check wheather user exist or not
                    _data.read('users',phone,function(err,data){
                        if(!err && data){
                            _data.delete('users',phone,function(err){
                                if(!err){
                                    callback(200,{"Message":"User Deleted Successfully"})
                                }else{
                                    callback(403,{"Error":"can not delete the user"})
                                }
                            })
                        }else{
                            callback(404,{"Error":"No User Found with this Phone number"})
                        }
                    })
           }else{
               callback(401,{"Error":"Phone Number Missing"})
           }
    }




 
    handlers._tokens = {};
    handlers._tokens.post=function(data,callback){
        let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim() : false;
        let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;
      
        if(phone && password){
                _data.read('users',phone,function(err,userData){
                    if(!err && userData){
                            let hashedPassword = helpers.hashPassword(password);
                            
                            if(hashedPassword==userData.hashedPassword){
                                    var tokenId = helpers.createRandomString(20);
                                    var expires = Date.now() + 1000 * 60 * 60;
                                    let tokenObject = {
                                        "id" : tokenId,
                                        "phone" :phone,
                                        "expires" : expires
                                    }

                                    _data.create("tokens", tokenId, tokenObject , function(err){
                                        if(!err){
                                            callback(200,tokenObject)
                                        }else{
                                            callback(403,{"Erro":"Can not create the token"})
                                        }
                                    })
                            }else{
                                callback(403,{"Error":"Password Does not match"})
                            }

                    }else{
                        callback(404,{"Error":"User not found with specified Phone"})
                    }
                })
        }else{
            callback(404,{"Error":"Missing Phone Number or Password"})
        }
    }



    
    module.exports= handlers;