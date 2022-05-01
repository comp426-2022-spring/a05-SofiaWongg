// Place your server entry point code here

//minimist
const args = require('minimist')(process.argv.slice(2));


//require express
var express = require('express');
var app = express();

//fs
const fs = require('fs');

//require morgan
const morgan = require('morgan')

//conect to data
const logdb = require("./src/services/database.js")



// Define coin_routes
const coin_router = require('./src/routes/coin_routes'); //-nu


//storing help options
const help = (`
    server.js [options]
    
    --port  Set the port number for the server to listen on. Must be an integer between 1 and 65535.
    
    --debug If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws
                an error with the message "Error test successful." Defaults to false.
                
    --log   If set to false, no log files are written. Defaults to true. Logs are always written to
                database.
    
    --help  Return this message and exit.
`)

// Define arguments and set values
args["port"];
args["debug"];
args["log"];
const port = args.port || process.env.PORT || 5555;
const debug = (args.debug != "false");
const log = (args.log != "false");

if (args.help || args.h) {
  console.log(help);
  process.exit(0);
}

//address for home 
const home = './home.html';

//
const flip_one = '';
const flip_many = '';


// Start server
const server = app.listen(port, () => {
  console.log("Server running on port %PORT%".replace("%PORT%",port))
});


// Serve static HTML files
app.use(express.static('./public'));

// Make Express use its own built-in body parser to handle JSON
app.use(express.json());

//added
app.use( (req, res, next) => {
  // adding in database (log)
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
  };

    console.log(logdata);

    const stmt = database.prepare('INSERT INTO accesslog (remoteaddr,remoteuser,time,method,url,protocol,httpversion,status,referer,useragent) VALUES (?,?,?,?,?,?,?,?,?,?)');
    const run = stmt.run(logdata.remoteaddr,logdata.remoteuser, logdata.time, logdata.method,logdata.url,logdata.protocol,logdata.httpversion, logdata.status,logdata.referer, logdata.useragent);
    next();

});

// Check endpoint
app.get('/app/', (req, res) => {
  // Respond with status 200
      res.statusCode = 200;
  // Respond with status message "OK"
      res.statusMessage = 'OK';
      res.writeHead(res.statusCode, { 'Content-Type' : 'text/plain' });
      res.end(res.statusCode+ ' ' +res.statusMessage)
});


//debug end 
//maybe add a try/catch
if (args.debug) {
  app.get('/app/log/access', (req, res) =>{
      const stmt = db.prepare("Select * FROM accesslog").all();
      res.status(200).json(stmt);
  });


  app.get("/app/error", (req, res) => {
    res.status(500);
      throw new Error("Error Test Successful");
  })
}

if (log) {
  // Use morgan for logging to files
  const logdir = './log/';

  if (!fs.existsSync(logdir)){
      fs.mkdirSync(logdir);
  }
  // Create a write stream to append to an access.log file
      const accessLog = fs.createWriteStream( logdir+'access.log', { flags: 'a' });
  // Set up the access logging middleware
      app.use(morgan('combined', { stream: accessLog }));
} else {
  console.log("NOTICE: not creating file access.log");
}


// Multiple flips endpoint
app.post('/app/flip/coins/', (req, res, next) => {
  var num = parseInt(req.body.number);
  var flips = coinFlips(num);
  var count = countFlips(flips);
  var out = {raw: flips, summary: count};

  res.status(200).json(out);
});

// Single flip endpoint
app.post('/app/flip/', (req, res, next) => {
const result = coinFlip();
  const out = {flip: result};

  res.status(200).json(out);
});

// Guess flip endpoint
app.post('/app/flip/call/', (req, res, next) => {
  const call = req.body.guess;
  const out = flipACoin(call);

  res.status(200).json(out);
});

// Default endpoint
app.use(function(req, res){
  res.status(404).send('404 NOT FOUND' + req.url);
});



function coinFlip() {
    var x = Math.round(Math.random());
    if (x < 1) {return "heads";} else {return "tails";}
  }

  function coinFlips(flips) {
    const flipArray = []
    for(let i = 0; i<flips; i++){
      flipArray[i] = coinFlip()
    }
    return flipArray
  }
  
  
  function countFlips(array) {
    var h = 0;
    var t = 0;
    for(let i = 0; i<array.length; i++){
      if(array[i]==='heads'){
        h++;
      }
      else{
        t++;
      }
    }
    return {heads: h, tails: t};
  }
  
  
  function flipACoin(call) {
    let flipCall = {call: call, flip: coinFlip(), result: ''};
    if(flipCall.call === flipCall.flip){
      flipCall.result = 'win';
    } 
    else{
      flipCall.result = 'lose';
    }
    return flipCall;
  }

// //example:
// app.post('/app/flip/coins/', (req, res, next) => {
//     const flips = coinFlips(req.body.number)
//     const count = countFlips(flips)
//     res.status(200).json({"raw":flips,"summary":count})
// })

// app.post('/app/flip/call/', (req, res, next) => {
//     const game = flipACoin(req.body.guess)
//     res.status(200).json(game)
// })