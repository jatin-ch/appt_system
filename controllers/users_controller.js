var Appointment = require('../models/appointment');
var User = require('../models/user');
var Event = require('../models/event');
var moment = require('moment');
var bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/users/:id', function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) throw err;

            if (user) {
                Appointment.find({ _id: { $in: user.appointments } }, { apptAt: 1, status: 1 }, function(err, appointments) {
                    if (err) throw err;
                    res.render('users/show', { user: user, appointments: appointments, moment: moment });
                }).populate('event', 'title');
            }
            else {
                link = "<a href='/users'>Users</a>"
                res.send('Sorry! User not found. Go to' + link)
            }
        });
    })

    app.post('/users', function(req, res) {
        var phone = (req.body.phone.split("-")[0] == "+91") ? req.body.phone : ("+91-" + req.body.phone)
        User.findOne({ phoneNo: phone }, function(err, user) {
            if (err) throw err;
            var msg = ''

            if (user) {
                link = "<a href='/users'>Try again</a>"
                res.send('User with phone no: '+ req.body.phone + ' already exist. ' + link)
            }
            else {
                var userObj = {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    phoneNo: phone
                }

                User.create(userObj, function(err, result) {
                    if (err) throw err;
                    link = "<a href='/users'>Users</a>"
                    res.send('Success! User created. Go to ' + link);
                })
            }
        });
    });

    app.get('/users', function(req, res) {
        User.find({}, function(err, users) {
            if (err) throw err;
            res.render('users', { users: users });
        })
    });
}