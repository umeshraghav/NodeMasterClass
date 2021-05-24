
//dependencies 
const http = require('http');
const url = require('url')

const server = http.createServer(function(req,res){

        // get the url
        const parsedUrl = url.parse(req.url, true)

        //get the parthname
        const pathName = parsedUrl.pathname;

        //get the http method 
        const method = req.method.toLowerCase();


        console.log(method)

    res.end("Http Server");

    //Get the URL and parse it

})



//listen to the server on porn 3000
server.listen(3000,function(){
    console.log("Server Runing on 3000")
})