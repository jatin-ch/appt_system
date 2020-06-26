var Event = require('../models/event');
var moment = require('moment');
var bodyParser = require('body-parser');
var Appointment = require('../models/appointment');
const User = require('../models/user');

module.exports = function(app) {
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/events', function(req, res) {
        var fromDate =  req.body.from.split(' ')[0]
        var toDate =  req.body.to.split(' ')[0]

        if (fromDate == toDate) {
            var pipeline = [
                {
                    $addFields: {
                        "begin_date": { $dateToString: { format: "%Y-%m-%d", date: "$begin" }},
                        "end_date": { $dateToString: { format: "%Y-%m-%d", date: "$end" }}
                    }
                },
                { 
                    $match : { 
                        begin_date: { $eq: fromDate }
                    }
                    
                },
                { 
                    $project : { 
                        title : 1, begin: 1, begin: 1, duration: 1, status: 1
                    } 
                }
            ]

            Event.aggregate(pipeline, function(err, events) {
                if (err) throw err;
    
                if(events[0]) {
                    res.send("Event already exist with same date");
                }
                else {
                    var begin = moment(req.body.from.replace(' ', 'T')).add(req.body.duration, 'minutes');
                    var end = moment(req.body.to.replace(' ', 'T'));

                    if (end >= begin) {
                        var eventObj = {
                            title: req.body.title,
                            begin: new Date(req.body.from.replace(' ', 'T')),
                            end: new Date(req.body.to.replace(' ', 'T')),
                            duration: req.body.duration,
                            status: "New"
                        }
        
                        Event.create(eventObj, function(err, event) {
                            if (err) throw err;
                            res.send({ status: 200 });
                        });
                    }
                    else {
                        res.send("End Datetime should be atleast "+ req.body.duration +" minutes greter then Start DateTime")
                    }
                }
            });
        }
        else {
            res.send("Start Date should be equal to End Date")
        }
    });

    app.post('/events/duplicate', function(req, res) {
        begin_date = new Date(req.body.from.replace(' ', 'T'));
        end_date = new Date(req.body.to.replace(' ', 'T'));
        
        var db_query = {
            $or: [ 
                { begin: { $gte: begin_date, $lt: end_date } }, 
                { end: { $gte: begin_date, $lt: end_date } },
                {
                    $and: [
                        { begin: { $lt: begin_date } },
                        { end: { $gte: end_date } }
                    ]
                }
            ]
        }

        Event.findOne(db_query, function(err, event) {
            if (err) throw err;

            if (event) {
                res.send({ status: 422 });
            }
            else {
                var item = {
                    title: req.body.title,
                    begin: begin_date,
                    end: end_date,
                    duration:req.body.duration
                }
        
                if (req.body.id) {
                    Event.findOneAndUpdate(req.body.id, item, function(err, event) {
                        if (err) throw err;
                        res.send({ status: 422 });
                    })
                } 
                else {
                    item['status'] = 'New'
        
                    Event.create(item, function(err, result) {
                        if (err) throw err;
                        res.send({ status: 200 });
                    });
                }
            }
        });
    });

    app.get('/events/new', function(req, res) {
        res.render('events/new');
    });

    app.get('/events/:id', function(req, res) {
        Event.findById(req.params.id, function(err, event) {
            if (err) throw err;
            var slots = [];
            var bookedSlots = [];
            var temp = moment(event.begin).format("YYYY-MM-DDTHH:mm")
            var end_hrs = moment(event.end).subtract(event.duration, 'minutes').format("YYYY-MM-DDTHH:mm")

            while(end_hrs >= temp) {
                slots.push(temp);
                temp = moment(temp).add(event.duration, 'minutes').format("YYYY-MM-DDTHH:mm");
            }

            event.appointments.forEach(e => {
                bookedSlots.push(moment(e.apptAt).format("YYYY-MM-DDTHH:mm"))
            });
            console.log(event.appointments)
            User.find({}, function(err, users) {
                if (err) throw err;
                res.render('events/show', { moment: moment, event: event, slots: slots, bookedSlots: bookedSlots, users: users });
            });
        }).populate('appointments', 'apptAt');
    })

    app.get('/events', function(req, res) {
        Event.find({}, function(err, events) {
            if (err) throw err;
            res.render('events', { moment: moment, events: events });
        });
    });
};