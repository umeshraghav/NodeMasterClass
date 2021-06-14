const fs = require('fs');
const path = require("path");
const helpers = require('./helper');
const helper = require("./helper");
 

//container for all the modules to be exported 
const lib={};

  lib.baseDir = path.join(__dirname,"/../.data/");


  //create file 
    lib.create= function(dir,file,data,callback){
            //open the file 
            fs.open(lib.baseDir+dir+'/'+file+".json","wx", function(err, fileDescriptor){
                if(!err && fileDescriptor){

                    //Convert data to string 
                    let stringData = JSON.stringify(data);

                    //now write to the file

                    fs.writeFile(fileDescriptor,stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false)
                                }else{
                                    callback("Can not close the file")
                                }
                            })
                        }else{
                            callback("can not write to the file")
                        }
                    })
                }
                else{
                    callback( "Can not create a file, it may already exist")
                }
            })

    }



 //read the file
 
 lib.read = function(dir,file,callback){
        //open the file
        fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8', function(err,data){
            if(!err && data){
                    var parsedData = helpers.parseJsonToObject(data);
                    callback(false,parsedData);
            }else{
                callback(400,{"error":"Can not read the file"});
            }
        })
 }


 //update the file

 /*lib.update = function(dir,file,data,callback){
     //open the file 
     fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err, fileDescriptor){
         stringData = JSON.stringify(data)
         if(!err && fileDescriptor){
                fs.truncate(fileDescriptor, function(err){
                    if(!err){
                        fs.writeFile(fileDescriptor,stringData,function(err){
                            if(!err){
                                fs.close(fileDescriptor, function(err){
                                    if(!err){
                                        callback(false)
                                    }            else{
                                        callback("Can not close the file")
                                    }
                                });
                            }else{
                                callback("Can not write to the file")
                            }
                        }) 
                    }else{
                        callback("Cant truncate the file")
                    }
                })
            
         }else{
             callback("Can not open the file. It may not exist")
         }
     })
 }*/

 lib.update = function(dir,file,data,callback){

    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
      if(!err && fileDescriptor){
        // Convert data to string
        var stringData = JSON.stringify(data);
  
        // Truncate the file
        fs.ftruncate(fileDescriptor,function(err){
          if(!err){
            // Write to file and close it
            fs.appendFile (fileDescriptor, stringData,function(err){
              if(!err){
                fs.close(fileDescriptor,function(err){
                  if(!err){
                    callback(false);
                  } else {
                    callback('Error closing existing file');
                  }
                });
              } else {
                callback('Error writing to existing file');
              }
            });
          } else {
            callback('Error truncating file');
          }
        });
      } else {
        callback('Could not open file for updating, it may not exist yet');
      }
    });
  
  };


  //delete the file

  lib.delete = function(dir,file, callback){
      //unlink the file
      fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
          if(!err){
              callback(false)
          }else{
              callback("Can Not Delete the file")
          }
      })
  }


  //list all the file s

 // List all the items in a directory
lib.list = function(dir,callback){
  fs.readdir(lib.baseDir+dir+'/', function(err,data){
    if(!err && data && data.length > 0){
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      callback(false,trimmedFileNames);
    } else {
      callback(err,data);
    }
  });
};
 module.exports= lib;
 