//library for storing logs 

const fs = require('fs');
const path =require('path');
const zlib = require('zlib');

var lib = {};

lib.baseDir = path.join(__dirname,'/../.logs/');

lib.append = function(file,str,callbak){
    fs.open(lib.baseDir+file+'.log','a',function(err,fileDescriptor){
        if(!err && fileDescriptor){
                fs.appendFile(fileDescriptor,str+'\n',function(err){
                    if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callbak(false)
                                }else{
                                    callbak("Error: closing the file that was being appended")
                                }
                            })
                    }else{
                        callbak("Error:Appending the file")
                    }
                })
        }else{
            callbak("Could not open file for appending")
        }
    })
}


lib.list = function(includeCompressedLogs, callbak){
    fs.readdir(lib.baseDir, function(err,data){
        var trimmedFileNames = [];
        if(!err && data && data.length>0){
            data.forEach(function(fileName){
                        if(fileName.indexOf('.logs')>-1){
                            trimmedFileNames.push(fileName.replace('.log',''))
                        }

                        if(fileName.indexOf('.gz.b64')>-1 && includeCompressedLogs){
                            trimmedFileNames.push(fileName.replace('.gz.b64'),'')
                        }
            })
            callbak(false, trimmedFileNames)
        }else{
            callbak(err,data)
        }
    })
}

lib.compress = function(logId, newFileId,callbak){
    var sourceFile = logId+'.log';
    var destFile = newFileId+'.gz.b64';


    fs.readFile(lib.baseDir+sourceFile,'utf8',function(err,inputString){
        if(!err && inputString){
            //compress the daa using gzip
            zlib.gzip(inputString,function(err,buffer){
                if(!err && buffer){

                    fs.open(lib.baseDir+destFile+'wx', function(err, fileDescriptor){
                        if(!err && fileDescriptor){
                            fs.writeFile(fileDescriptor,buffer.toString('base64'),function(err){
                                    if(!err){
                                            fs.close(fileDescriptor,function(err){
                                                if(!err){
                                                    callbak(false)
                                                }else{
                                                    callbak(err)
                                                }
                                            })
                                    }else{
                                        callbak(err)
                                    }
                            }) 
                        }else{
                            callbak(err)
                        }
                    })
                }else{
                    callbak(err)
                }
            })
        }
        else{
            callbak(err)
        }
    })
};


//decompress 

lib.decompress = function(fileId,callback){
    var fileName = fileId+'.gz.b64';
    fs.readFile(lib.baseDir+fileName,'utf8',function(err,str){
        if(!err && str){
            var inputBuffer = Buffer.from(str,'base64');
            zlib.unzip(inputBuffer,function(err,outputBuffer){
                if(!err && outputBuffer){
                    var str = outputBuffer.toString();
                    callback(false,str)
                }else{
                    callback(err)
                }
            })
        }else{
            callback(err);
        }
    })
}


//truncating a log file
lib.truncate = function(logId,callback){
    fs.truncate(lib.baseDir+logId+'.log',function(err){
        if(!err){
            callback(false)
        }else{
            callback(err)
        }
    })
}

module.exports=lib;