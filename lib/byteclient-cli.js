var program = require('commander');
var Client = require('./client');

program
    .version("1.0.0")    
    .option("-s, --specs <specs>", "Location of spec files")
    .option("-h, --host <host>", "Control server url")  
    .parse(process.argv);
    

var specs = program.specs;

if(!specs) {
    console.error("Error: No specFolder specified");
    process.exit(1);
}

if(!program.host) {
    console.log("Error: No control server given");
}

var c = new Client({
    controlServerUrl: program.host
});

c.connect().then(function() {
   c.sendTestSuite(specs).then(function(message) {
       
       if(message.success) {
           console.log("Test suite successfully transfered");
           console.log("SessionId: "+message.sessionId);
           process.exit(0);
           return;           
       }       
       
       console.error("Error while transfering test suite.");
       console.log("Error: ");
       console.log(message.message);
       process.exit(1);
   }); 
}, function(err) {
    console.log("Transfering test suite failed.\n")
    console.log("Reason: ")
    console.log(err);
    process.exit(1);
});