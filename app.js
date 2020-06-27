var express = require('express');
var app = express();
var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.dbConnectionString());

var eventsController = require('./controllers/events_controller');
var eventsApiController = require('./controllers/api/events_controller');
var AppointmentsApiController = require('./controllers/api/appointments_controller');
var AppointmentsController = require('./controllers/appointments_controller');
var UsersController = require('./controllers/users_controller');
var UsersApiController = require('./controllers/api/users_controller')

var port = process.env.PORT || 4000;

app.use('/assets', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use('/', function(req, res, next) {
    console.log('Started ' + req.method + ' ' + '"'+req.url+'"');
    next();
})

app.get('/', function(req, res) {
    res.render('index');
});

eventsController(app);
eventsApiController(app);
AppointmentsApiController(app);
AppointmentsController(app);
UsersController(app);
UsersApiController(app);

app.listen(port);
console.log('App is running on port: ' + port);