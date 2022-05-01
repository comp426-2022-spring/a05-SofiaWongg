// Place your server entry point code here

//minimist
const args = require('minimist')(process.argv.slice(2));



const cors = require('cors') //maybe move later after app.use states -nu

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


// Tell STDOUT that the server is stopped (added)
process.on('SIGINT', () => {
  server.close(() => {
  console.log('\nApp stopped.');
});
});

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











//for static html files
app.use(express.static('./public'));



// Make Express use its own built-in body parser to handle JSON
app.use(express.json());

// Server port
const port = args.port || args.p || process.env.PORT || 500

if (args.log == 'false') { //added from profs code
  console.log("NOTICE: not creating file access.log")
} else {
// Use morgan for logging to files
  const logdir = './log/';

  if (!fs.existsSync(logdir)){
      fs.mkdirSync(logdir);
  }
  // Create a write stream to append to an access.log file
  const accessLog = fs.createWriteStream( logdir+'access.log', { flags: 'a' })
  // Set up the access logging middleware
    app.use(morgan('combined', { stream: accessLog }))
}

//what i had before
//if log is true use morgan to log files
// if (log == true) {
//   // Create a write stream to append (flags: 'a') to a file
//   const access_log = fs.createWriteStream('access.log', { flags: 'a' });

//   // Set up the access logging middleware
//   app.use(morgan('combined', { stream: access_log }));
// }


//coin functions at end of doc


// Serve static HTML files
app.use(express.static('./public'));

//more api endpounts 
//end of j code

/ READ (HTTP method GET) at root endpoint /app/
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

// Endpoint /app/flip/ that returns JSON {"flip":"heads"} or {"flip":"tails"} 
// corresponding to the results of the random coin flip.
app.get('/app/flip/', (req, res) => {
    const flip = coinFlip()
    res.status(200).json({ "flip" : flip })
});

app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
})

app.get('/app/flips/:number', (req, res, next) => {
    const flips = coinFlips(req.params.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
});

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})

app.get('/app/flip/call/:guess(heads|tails)/', (req, res, next) => {
    const game = flipACoin(req.params.guess)
    res.status(200).json(game)
})

if (args.debug || args.d) {
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = logdb.prepare("SELECT * FROM accesslog").all();
	    res.status(200).json(stmt);
    })

    app.get('/app/error/', (req, res, next) => {
        throw new Error('Error test works.')
    })
}

// Default API endpoint that returns 404 Not found for any endpoints that are not defined.
app.use(function(req, res){
    const statusCode = 404
    const statusMessage = 'NOT FOUND'
    res.status(statusCode).end(statusCode+ ' ' +statusMessage)
});



//done 



// Define debug_routes
const debug_router = require('./src/routes/debug_route');

// Call db_middlware function.
const database = require('./src/middleware/db_middleware');

// Default response middleware
const default_response = require('./src/middleware/default_response');



app.use(express.urlencoded({ extended: true }));
app.use(express.json());






args['port', 'debug', 'log', 'help'];



const debug = args.debug;
const log = args.log;




// Set up cors middleware on all endpoints
app.use(cors())




// Calling middleware function that inserts a new record in a database.
app.use(database.log_middlware);





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