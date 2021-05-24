
//dependencies 
const http = require('http');


const server = http.createServer(function(req,res){
    res.end("Http Server");
})


//listen to the server on porn 3000
server.listen(3000,function(){
    console.log("Server Runing on 3000")
})