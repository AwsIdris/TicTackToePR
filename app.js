var express = require('express');
var socket = require('socket.io');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tictactoe');

var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');




// Init App
var app = express();
// Set Port
app.set('port', (process.env.PORT || 3000));

var server =app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//check if the user already exists.




app.use('/', routes);
app.use('/users', users);

// Setup Socket IO
var io = socket(server);
// io.on('disconnect', function () {
  
 io.on('userlist',function(data){
   var onlineusers=users.usersEmails;
    
    io.sockets.emit('userlist',onlineusers);
     })
         // socket.emit('userlist');
        // online = online - 1;
  
  //  });

io.on('connection', function(socket){
  
 
 //console.log("++++++++++");

  socket.on('userlist',function(data){
    var onlineusers=users.usersEmails;
    io.sockets.emit('userlist',onlineusers);
    console.log('Mad socket connection no:', socket.id);
    onlineusers.map(function(x){
     console.log('from connection',x);
    })
   
    
    
  })
  socket.on('disconnect', function () {

    var onlineusers=users.usersEmails;
    
    io.sockets.emit('userlist',onlineusers);

  });

})

