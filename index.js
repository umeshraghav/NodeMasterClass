
//dependencies 
const http = require('http');
const https = require('https');
const url = require('url')
const StringDecoder = require ('string_decoder').StringDecoder;
const config = require("./config")
const fs = require('fs')
const httpServer = http.createServer(function(req,res){
    unifiedServer(req,res)
})


const httpServerOptions ={
    'key' : fs.readFileSync("./https/key.pem"),
    'cert' :fs.readFileSync("./https/cert.pem")
}

const httpsServer = https.createServer(httpServerOptions, function(req,res){
    unifiedServer(req,res)
})



//listen to the http server
httpServer.listen(config.httpPort,function(){
    console.log("Server Runing on "+config.httpPort+" in "+config.envName+" now")
})

//listen to the https server
httpsServer.listen(config.httpsPort,function(){
    console.log("Server Runing on "+config.httpsPort+" in "+config.envName+" now")
})


//Server logic for http and https
var unifiedServer = function(req,res){

        // get the url
        const parsedUrl = url.parse(req.url, true)

        //get the parthname
        const pathName = parsedUrl.pathname;
        var trimmedPath = pathName.replace(/^\/+|\/+$/g, '');
        //get the http method 
        const method = req.method.toLowerCase();


        //get the querystring 
        const querystring = parsedUrl.query;

            const headers = req.headers;


        const decoder = new StringDecoder('utf-8')

            let buffer = "";
    req.on('data', function(data){
            buffer+=decoder.write(data);
    })

    req.on('end', function(){
        buffer+=decoder.end()


        //routing the request 
        const choosenHandler = typeof(router[trimmedPath])!== "undefined" ? router[trimmedPath] : handlers.notFound;


        //construct the data object 
        
            let data ={
                'trimmedPath' : trimmedPath,
                "querystring" : querystring,
                "method" : method,
                "headers": headers,
                "payload" : buffer
            };


            choosenHandler(data, function(statusCode, payload){
                    statusCode = typeof(statusCode)== "number" ? statusCode : 200;

                    payload = typeof(payload) == "object"? payload:{};

                    //convert payload to string
                    const payloadString = JSON.stringify(payload);
                    res.setHeader("Content-Type", "application/json")
                    res.writeHead(statusCode)
                    res.end(payloadString);
                    console.log("Returning ", payloadString)
            })



      
        console.log(trimmedPath);
    })

const handlers = {

}

    handlers.sample = function(data,callback){
        callback(406, {'Name': 'Sample Handler'})
    }

    handlers.ping = function(data,callback){
        callback(406, {'Name': 'Ping Handler'})
    }

    handlers.notFound = function(data, callback){
        callback(404)

    }

    const router ={
        'sample' : handlers.sample,
        'ping' : handlers.ping
    }

         
  

}

