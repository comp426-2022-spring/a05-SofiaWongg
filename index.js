// Place your server entry point code here
const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan')
const args = require('minimist')(process.argv.slice(2));
const db = require("./src/services/database.js")
const cors = require('cors') //maybe move later after app.use states

// Make Express use its own built-in body parser to handle JSON
app.use(express.json());

// Define coin_routes
const coin_router = require('./src/routes/coin_routes');



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



// Serve static HTML files
app.use(express.static('./public'));

// Define debug_routes
const debug_router = require('./src/routes/debug_route');

// Call db_middlware function.
const database = require('./src/middleware/db_middleware');

// Default response middleware
const default_response = require('./src/middleware/default_response');



if (args.help || args.h) {
    console.log(help);
    process.exit(0);
}

args['port', 'debug', 'log', 'help'];

var port = args.port || 5555


const debug = args.debug;
const log = args.log;

//for static html files
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Set up cors middleware on all endpoints
app.use(cors())


//if log is true use morgan to log files
if (log == true) {
    // Create a write stream to append (flags: 'a') to a file
    const access_log = fs.createWriteStream('access.log', { flags: 'a' });

    // Set up the access logging middleware
    app.use(morgan('combined', { stream: access_log }));
}

// Calling middleware function that inserts a new record in a database.
app.use(database.log_middlware);

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port));
})

//added
app.use( (req, res, next) => {
    // Your middleware goes here.
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

    const prep = database.prepare('INSERT INTO accesslog (remoteaddr,remoteuser,time,method,url,protocol,httpversion,status,referer,useragent) VALUES (?,?,?,?,?,?,?,?,?,?)');

    const run = prep.run(logdata.remoteaddr,logdata.remoteuser, logdata.time, logdata.method,logdata.url,logdata.protocol,logdata.httpversion, logdata.status,logdata.referer, logdata.useragent);
    next();

});

// WHEN DEBUG == TRUE.
if (debug) {
    app.use('/app', debug_router);
}


// Pass in all the coin_routes into index.js
app.use('/app', coin_router);


// Default response for any other request.
app.use(default_response.default_response);


// STDOUT sever has stopped.
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server has stopped');
    })
})


//my endpoints
app.get('/app', (req, res)=>{
    res.status(200).end('OK')
    res.type('text/plain')
  })
  
  app.get('/app/flip', (req, res) => {
    res.status(200).json({ 'flip': coinFlip() })
  })
  
  app.get('/app/flips/:number([0-9]{1,3})', (req, res) => {
    const flips = coinFlips(req.params.number);
      const numFlips = countFlips(flips);
    res.status(200).json({'raw': flips, 'summary': numFlips})
  });//one line
  
  app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json({ 'message': flipACoin('heads')})
  })
  
  app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json({ 'message': flipACoin('tails')})
  })
  
  //added endpoint:
  if (args.debug) {
      app.get('/app/log/access', (req, res) =>{
          const stmt = db.prepare("Select * FROM accesslog").all();
          res.status(200).json(stmt);
      });
      app.get("/app/error", (req, res) => {
          throw new Error("Error Test Successful");
      })
  }
  
  app.use(function(req, res) {
    res.status(404).end("Endpoint does not exist")
    res.type("text/plain")
  })

  //done




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

//example:
app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
})

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})