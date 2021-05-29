//these are the request handlers 

const helpers = require("./helper")
const _data = require("./data")
const config = require("../config")
 



//container for the hanlders
const handlers = {}

    handlers.sample = function(data,callback){
        callback(406, {'Name': 'Sample Handler'})
    }

    handlers.ping = function(data,callback){
       
        callback(406, {'Name': 'Ping Handler'})
    }

    handlers.notFound = function(data, callback){
        callback(404,{"Error":"No Handler Found"})

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
            const token = typeof(data.headers.token)=='string'   ?  data.headers.token : false;
   
            if(phone){

                    handlers._tokens.verifyToken(token,phone, function(tokenIsValid){
                        if(tokenIsValid){
                            _data.read('users',phone,function(err,data){
                                if(!err){ 
                                    delete data.hashedPassword;
                                    callback(200,data);
                                }else{
                                    callback(404 ,{"Error":"User Not Found"})
                                }
                            })
                        }else{
                            callback(500,{"Error":"Missing or Invalid Token"})
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
            const token = typeof(data.headers.token)=='string'   ?  data.headers.token : false;




            
            if(phone){

                if(firstName || lastName || password){

                        handlers._tokens.verifyToken(token,phone, function(tokenIsValid){
                                if(tokenIsValid){
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
                                    callback(403,{"Error":"Missing Invalid Token"})
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
        const token = typeof(data.headers.token)=='string'   ?  data.headers.token : false;
          if(phone){
            _data.read('users',phone,function(err,data){
                if(!err && data){
                    handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
                        if(tokenIsValid){
                          _data.delete('users',phone,function(err){
                              if(!err){
                                  callback(200,{"Msg":"User Deleted"})
                              }
                              else{
                                  callback(403,{"Error":"Unable to delete the user"})
                              }
                          })
                        }else{
                            callback(403,{"Err":"Invalid Token"})
                        }
                })

                }else{
                    callback(400,{"Error":"No User Found With Specified Phone Number"})
                }
            })
                 
          }else{
              callback(402,{"Error":"Missing Phone number"})
          }
    }




 
    handlers._tokens = {};


    handlers._tokens.post=function(data,callback){
        let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim() : false;
        let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;
      console.log("Token Post Called");
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

    //Get Tokens
    handlers._tokens.get=function(data,callback){
        
        const id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length==20 ?  data.queryStringObject.id: false;
      
        if(id){
            _data.read('tokens',id, function(err,tokenData){
                if(!err && tokenData){
                        callback(200,tokenData);
                }else{
                    callback(404,{"Error":"No Token found"})
                }
            })
        }else{
            callback(403,{"Error":"No Id found in query"})
        }      
    }

    //update Tokens
    handlers._tokens.put = function(data,callback){
        let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length==20 ? data.payload.id.trim() : false;
        let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true? true : false;
        
            if(id && extend){

                _data.read('tokens',id,function(err,tokenData){
                    if(!err && tokenData){
                            if(tokenData.expires > Date.now()){
                                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                                    //update the 
                                    _data.update('tokens',id,tokenData,function(err){
                                        if(!err){
                                            callback(200,tokenData)
                                        }else{
                                            callback(402,{"Error":"Can not update the token"})
                                        }
                                    })
                            }else{
                                callback(400,{"Error":"Token already expired"})
                            }
                    }else{
                        callback(404,{"Error":"No token found"})
                    }
                })

            }else{
                callback(404,{"Error":"Missing Required Field"})
            }
    }
 
    //delete Tokens
    handlers._tokens.delete = function(data,callback){
         
        const id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length==20 ?  data.queryStringObject.id: false;
      if(id){
            //check weather id exist or not 
            _data.read('tokens',id,function(err,tokenData){
                if(!err && tokenData){  
                    _data.delete('tokens',id,function(err){
                        if(!err){
                            callback(200,{"Msg":"Token Deleted Successfully"})
                        }else{
                            callback(402,{"Error":"Can not delete the token"})
                        }
                    })

                }else{
                    callback(404,{"Error":"No token Found with specified id"})
                }
            })
          
      }else{
          callback(404,{"Error":"No Id found in query"})
      }
    }

    //verfiy the token 

    handlers._tokens.verifyToken= function(id,phone,callback){
            //look for token
            _data.read('tokens',id,function(err,tokenData){
                if(!err && tokenData){
                      if(tokenData.phone == phone && tokenData.expires > Date.now()){
                          callback(true)
                      }else{
                        callback(false);
                      }
                }else{
                    callback(false)
                }
            })
    }

    //check 
    
//users handler 
handlers.checks = function(data, callback){
       
    var acceptableMethod = ['post','get','put','delete'];
       

    if(acceptableMethod.indexOf(data.method)>-1){
        
        handlers._checks[data.method](data,callback);
    }else{
        callback(405,{"Error":"Invalid Method"})
    }
}
handlers._checks={};

//Post Check 
//Required Data : protocols, url, method, successCodes, timeoutSeconds 

handlers._checks.post = function(data,callback){
    var protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
    
        if(protocol && url && method && successCodes && timeoutSeconds){
                //get the token form headers 
                var token = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;
                _data.read('tokens',token,function(err,tokenData){
                        if(!err && tokenData){

                            var userPhone = tokenData.phone;

                            //now read the user 

                                _data.read('users',userPhone, function(err, userData){
                                    if(!err && userData){
                                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks :[];

                                            //varify max checks 
                                            if(userChecks.length < config.maxChecks)
                                                {

                                                        var checkId = helpers.createRandomString(20);
                                                        var checkObject ={
                                                            "id" : checkId,
                                                            "userPhone": userPhone,
                                                            "protocol": protocol,
                                                            "successCodes" : successCodes,
                                                            "method" : method,
                                                            "url" : url,
                                                            "timeoutSeconds":timeoutSeconds

                                                        };

                                                        _data.create('checks',checkId, checkObject,function(err){
                                                            if(!err){
                                                                    // add check 
                                                                    userData.checks = userChecks;
                                                                    userData.checks.push(checkId);

                                                                    _data.update('users', userPhone, userData,function(err){
                                                                        if(!err){
                                                                            callback(200, checkObject)
                                                                        }else{
                                                                            callback(500,{"Eror":"Could not create check"})
                                                                        }
                                                                    })


                                                            }else{
                                                                callback(500,{"Error":"Could Not create check"})
                                                            }
                                                        })



                                                }else{
                                                    callback(403,{"Error":"Maximum Check limit exceeded"})
                                                }

                                    }else{
                                        callback(403,{"Error":"Can not read userdata"})
                                    }
                                })


                        }else{
                            callback(404,{"Error":"No token found"})
                        }
                })



        }else{
            callback(403,{"Error":"Missing Required Field"})
        }

}
    

handlers._checks.get = function(data,callback){
    const id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length==20 ?  data.queryStringObject.id: false;
        
    const token = typeof(data.headers.token)=='string'   ?  data.headers.token : false;
      
    if(id){

       
                _data.read('checks',id,function(err,checkData){
                    if(!err && checkData){ 

                        handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid){
                            if(tokenIsValid){
                                        callback(200,checkData)
                            }else{
                                callback(403,{"Error":"Missing or Invalid token"})
                            }
                        })
                       
                    }else{
                        callback(404 ,{"Error":"User Not Found"})
                    }
                })
        }else{
            callback(403,{"Error":"Missing Required Field"})
        }

}

handlers._checks.put = function(data,callback){
    
    const id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length==20 ?  data.queryStringObject.id: false;
   
    
    var protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
    
    
    const token = typeof(data.headers.token)=='string'   ?  data.headers.token : false;

    if(id){

            if(protocol || url || method || successCodes || timeoutSeconds){
                    _data.read('checks',id,function(err, checkData){
                        if(!err && checkData){

                                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                                    if(tokenIsValid){


                                            if(protocol){
                                                checkData.protocol = protocol;
                                            }
                                            if(url){
                                                checkData.url = url;
                                            }
                                            if(method){
                                                checkData.method = method;
                                            }
                                            if(successCodes){
                                                checkData.successCodes = successCodes;
                                            }
                                            if(timeoutSeconds){
                                                checkData.timeoutSeconds = timeoutSeconds;
                                            }

                                            _data.update('checks', id, checkData,function(err){
                                                if(!err){
                                                    callback(200,{"Msg":"Check Updated"})
                                                }else{
                                                    callback(402,{"Error":"Can not update the check"})
                                                }
                                            })


                                    }else{
                                        callback(402,{"Error":"Invalid or Missing token in header"})
                                    }
                                })

                        }else{
                            callback(404,{"Error":"No check data found"})
                        }
                    })
            }else{
                callback(402,{"Error":"Missing Field for update"})
            }


    }else{
        callback(404,{"Error":"Missing Required Field"})
    }
   

};

handlers._checks.delete = function(data,callback){
    const id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length==20 ?  data.queryStringObject.id: false;
       const token = typeof(data.headers.token)=='string'   ?  data.headers.token : false;
   
       
       if(id)
       {
           _data.read('checks',id,function(err,checkData){
                if(!err && checkData){

                        handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                            if(tokenIsValid){

                        _data.delete('checks',id,function(err){
                            if(!err){

                                    _data.read('users',checkData.userPhone,function(err,userData){
                                        if(!err && userData){
                                            var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                            const checkPosition = userChecks.indexOf(id);
                                            if(checkPosition>-1){
                                                    userChecks.splice(checkPosition,1)

                                                        userData.checks = userChecks;
                                                    _data.update('users', checkData.userPhone,userData,function(err){
                                                        if(!err){
                                                            callback(200,{"Msg":"User check Deleted"})
                                                        }else{
                                                            callback(403,{"Error":"Could not update the user checks"})
                                                        }
                                                    } )
                                            }


                                        }else{
                                            callback(404,{"Error":"Could not found checks for this user"})
                                        }
                                    })
                            }else{
                                callback(403,{"Error":"Can not delete the specified check"})
                            }
                        })





                            }else{
                                callback(403,{"Error":"Invalid or Missing token in header"})
                            }
                        })   
                         

                }else{
                    callback(404,{"Error":"No Check Data Found"})
                }
            })

       }else{
           callback(404,{"Error":"Check Id is Missing"})
       }
};
    
    module.exports= handlers;