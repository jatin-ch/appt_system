var Appointment = require('../../models/appointment');
var User = require('../../models/user');
var Event = require('../../models/event');
var moment = require('moment');
var bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/appointments/:id', function(req, res) {
        Appointment.findById(req.params.id, function(err, appt) {
            if (err) throw err;
            res.send(appt);
        }).populate([
            { path: 'user', select: ['firstname', 'lastname'] }, 
            { path: 'event', select: ['title'] }
        ]);
    });

    app.get('/api/appointments', function(req, res) {
        Appointment.find({}, function(err, appts) {
            if (err) throw err;
            res.send(appts);
        });
    })

    app.post('/api/appointments', function(req, res) {
        appt_date = new Date(req.body.apptAt.replace(' ', 'T'));
        
        var item = {
            apptAt: appt_date,
            status: req.body.status
        }

        if (req.body.id) {
            Appointment.findOneAndUpdate(req.body.id, item, function(err, appt) {
                if (err) throw err;
                res.send({ status: 422 });
            })
        } 
        else {
            Appointment.findOne({ user: req.body.user, event: req.body.event, apptAt: appt_date }, function(err, appt) {
                if (err) throw err;

                if(appt) {
                    res.send("Sorry! Can't create duplicate appt.")
                }
                else {
                    item['user'] = req.body.user
                    item['event'] = req.body.event
                    item['status'] = 'New'

                    Appointment.create(item, function(err, appt) {
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

                        res.send({ status: 200 });
                    });
                }
            });
        }
    });
}   