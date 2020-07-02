var Appointment = require('../models/appointment');
var User = require('../models/user');
var Event = require('../models/event');
var moment = require('moment');
var bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/appointments/:eventId', function(req, res) {
        Appointment.find({ event: req.params.eventId }, function(err, appts) {
            if (err) throw err;
            res.render('appointments/index', { appointments: appts, moment: moment });
        }).populate([
            { path: 'user', select: ['firstname', 'lastname'] }, 
            { path: 'event', select: ['title'] }
        ])
    })

    app.get('/appointments', function(req, res) {
        Appointment.find({}, function(err, appts) {
            if (err) throw err;
            res.render('appointments/index', { appointments: appts, moment: moment });
        }).populate([
            { path: 'user', select: ['firstname', 'lastname'] }, 
            { path: 'event', select: ['title'] }
        ])
    })

    app.post('/appointments', function(req, res) {
        Event.findById(req.body.event, function(err, event) {
            if (err) throw err;
            var appt_date = new Date(req.body.slot)

            if (event) {
                Appointment.findOne({ user: req.body.user, event: event.id, apptAt: appt_date }, function(err, appt) {
                    if (err) throw err;

                    if (appt) {
                        link = "<a href='/events/"+event.id+"'>Try again</a>"
                        res.send("Sorry! Can't create duplicate appt. " + link)
                    } else {
                        var apptObj = {
                            event: event.id,
                            apptAt: appt_date,
                            timezone: req.body.timezone,
                            user: req.body.user,
                            status: "New"
                        }

                        Appointment.create(apptObj, function(err, appt) {
                            if (err) throw err;

                            User.findOne(appt.user, function(err, user) {
                                if (err) throw err;
                                user.appointments.push(appt.id)
                                user.save();
                            });
    
                            Event.findOne(appt.event, function(err, event) {
                                if (err) throw err;
                                event.appointments.push(appt.id)
                                event.save();
                            });

                            link = "<a href='/appointments'>Appointments</a>"
                            res.send('Success! Appt created. Go to ' + link);
                        });
                    }
                });
            }
            else {
                link =  "<a href='/events/"+req.body.event+"'>Try again</a>"
                res.send("Oops! Something isn't right. " + link)
            }
        });
    });
}