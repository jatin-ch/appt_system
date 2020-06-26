var Appointment = require('../../models/appointment');
var User = require('../../models/user');
var Event = require('../../models/event');
var moment = require('moment');
var bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/users/:id', function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) throw err;

            if (user) {
                res.send(user);
            }
            else {
                res.send('User not found!');
            }
        }).populate('appointments', ['apptAt', 'status', 'event']);
    })

    app.post('/api/users', function(req, res) {
        var phone = (req.body.phone.split("-")[0] == "+91") ? req.body.phone : ("+91-" + req.body.phone)
        
        User.findOne({ phoneNo: phone }, function(err, user) {
            if (err) throw err;
            
            var userObj = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phoneNo: phone
            }

            if (user) {
                user.update(userObj, function(err, result) {
                    if (err) throw err;
                    res.send(user)
                });
            }
            else {
                User.create(userObj, function(err, user) {
                    if (err) throw err;
                    res.send(user);
                });
            }
        });
    });

    app.get('/api/users', function(req, res) {
        User.find({}, { firstname: 1, lastname: 1, phoneNo: 1 }, function(err, users) {
            if (err) throw err;
            res.send(users);
        })
    });
}   