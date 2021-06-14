
const environments ={};

environments.staging ={
    "httpPort":3000,
    "httpsPort":3001,
    "envName" : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5,
    'twilio': {
    'accountSid' : 'ACcd897b9f4a905ba50402b06cd8d8ea1f',
    'authToken' : 'f4fcafce20bad0cb2ef6d0d43aaca0b7',
    'fromPhone' : '+13106830508'
    },
    
  'templateGlobals' : {
    'appName' : 'UptimeChecker',
    'companyName' : 'NotARealCompany, Inc.',
    'yearCreated' : '2018',
    'baseUrl' : 'http://localhost:3000/'
  }
}


environments.production ={
    "httpPort":5000,
    "httpsPort":5001,
    "envName" : 'production',
    'hashingSecret' : 'thisIsalsoASecret',
    'maxChecks' : 5,
    'twillio':{
        'accountSid':'',
        'authToken':'',
        'fromPhone':''
    }
}


const currentEnvironment = typeof(process.env.NODE_ENV)=='string'? process.env.NODE_ENV.toLowerCase():'';

const environmentToExport =typeof(environments[currentEnvironment]) == 'object'? environments[currentEnvironment]:environments.staging;


module.exports= environmentToExport;