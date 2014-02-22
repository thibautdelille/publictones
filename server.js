#!/bin/env node
//  OpenShift sample Node application
var express = require('express')
  , http    = require('http')
  , fs      = require('fs')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , config = require('./config.json');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
        self.mongodb_host = process.env.OPENSHIFT_MONGODB_DB_HOST;
        self.mongodb_port = process.env.OPENSHIFT_MONGODB_DB_PORT;
        self.mongodb_username = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
        self.mongodb_password = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };

        if (typeof self.mongodb_host === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_MONGODB_HOST var, using localhost');
            self.mongodb = "mongodb://localhost/tonesdb";
            self.mongodb_db = "tonesdb";
        }else{
            console.warn('self.mongodb_host:'+self.mongodb_host);
            console.warn('self.mongodb_port:'+self.mongodb_port);
            self.mongodb = "mongodb://admin:YwRzcWFNX67s@"+self.mongodb_host+":"+self.mongodb_port+"/public";
            self.mongodb_db = "public";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Initialize mongoose
     */
    self.initializeMongo = function() {

      mongoose.connect(self.mongodb);
       
      var db = exports.db = mongoose.connection;
      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function callback () {
        console.log('Connected to tonesdb DB');
      });

    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
      self.initializeMongo();

      
      self.app = exports.app = express();
      self.server = exports.server = http.createServer(self.app);
      var sessionStore = exports.sessionStore = new MongoStore({url:self.mongodb}, function(){
        console.log("[MongoStore Connected]");
      });

      self.app.configure(function(){
          self.app.set('views', __dirname + '/views/');
          self.app.set('view engine', 'jade');
          self.app.set('strict routing', true);
          self.app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

          //email (smtp) settings
          /*self.app.set('email-from-name', 'PublicTones');
          self.app.set('email-from-address', 'tdelille@gmail.com');
          self.app.set('email-credentials', {
            user: config.email.user,
            password: config.email.password,
            host: config.email.host,
            ssl: true
          });*/

          self.app.use(express.bodyParser());
          self.app.use(express.methodOverride());
          self.app.use(express.cookieParser(config.session.secret));
          self.app.use(express.session({ 
              cookie:{maxAge: 24 * 60 * 60 * 1000},
              key: "tones",
              store: sessionStore
          }));
          self.app.use(passport.initialize());
          self.app.use(passport.session());
          self.app.use(self.app.router);
          self.app.use(express.static(path.join(__dirname, 'public')));
      });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
      self.setupVariables();
      self.populateCache();
      self.setupTerminationHandlers();

      // Create the express server and routes.
      self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {

      /*
       * Passportjs auth strategy
       */
      require('./strategy')(self.app, passport);

      require('./routes')(self.app, passport);
      
      //  Start the app on the specific interface (and port).
      self.server.listen(self.port, self.ipaddress, function() {
        console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now() ), self.ipaddress, self.port);
      });
      

      /*
       * Socket.io
       */

      require('./sockets');

    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

