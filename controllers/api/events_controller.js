var Event = require('../../models/event');
var User = require('../../models/user');
var Appointment = require('../../models/appointment');
var moment = require('moment');
var bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/events/:date/slots', function(req, res) {
        var pipeline = [
            {
                $addFields: {
                    "begin_date": { $dateToString: { format: "%Y-%m-%d", date: "$begin" }}
                }
            },
            { 
                $match : { 
                    begin_date: { $eq: req.params.date }
                }
                
            },
            { 
                $project : { 
                    title : 1, begin: 1, end: 1, duration: 1, status: 1
                } 
            },
            { $limit : 1 }
        ]

        Event.aggregate(pipeline, function(err, events) {
            if (err) throw err;
            event = events[0]

            var slots = [];
            var existingSlots = []
            
            Appointment.find({ event: event._id }, { _id: 0, apptAt: 1 }, function(err, appts) {
                if (err) throw err;
                appts.forEach(e => {
                    existingSlots.push(moment(e.apptAt).format("YYYY-MM-DDTHH:mm"));
                });

                var temp = moment(event.begin).format("YYYY-MM-DDTHH:mm");
                var end_hrs = moment(event.end).subtract(event.duration, 'minutes').format("YYYY-MM-DDTHH:mm")
                
                while(end_hrs >= temp) {
                    if (existingSlots.includes(temp)) {
                    // console.log('slot booked') 
                    } else {
                        slots.push(temp);
                    }
                    temp = moment(temp).add(event.duration, 'minutes').format("YYYY-MM-DDTHH:mm");
                }
                
                var results = {
                    event: event,
                    bookedSlots: existingSlots,
                    slots: slots,
                }

                res.send(results);
            });
        }); 
    });

    app.get('/api/events/:date', function(req, res) {
        var pipeline = [
            {
                $addFields: {
                    "begin_date": { $dateToString: { format: "%Y-%m-%d", date: "$begin" }},
                    "end_date": { $dateToString: { format: "%Y-%m-%d", date: "$end" }}
                }
            },
            { 
                $match : { 
                    begin_date: { $lte: req.params.date },
                    end_date: { $gte: req.params.date }
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
            res.send(events);
        })
    });

    app.get('/api/events', function(req, res) {
        if (req.query.from && req.query.to) {
            var pipeline = [
                {
                    $addFields: {
                        "begin_date": { $dateToString: { format: "%Y-%m-%d", date: "$begin" }},
                        "end_date": { $dateToString: { format: "%Y-%m-%d", date: "$end" }}
                    }
                },
                { 
                    $match : { 
                        begin_date: { $gte: req.query.from },
                        end_date: { $lte: req.query.to }
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
                res.send(events);
            })
        }
        else {
            Event.find({}, { appointments: 0 }, function(err, events) {
                if (err) throw err;
                res.send(events);
            });
        }
    });

    app.post('/api/events', function(req, res) {
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
                            status: req.body.status
                        }
        
                        Event.create(eventObj, function(err, event) {
                            if (err) throw err;
                            res.send(event);
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

    app.get('/api/db/seed', function(req, res) {
        var seeds = require('../../config/seeds');

        Event.create(seeds.events(), function(err, results) {
            if (err) throw err;
        });

        User.create(seeds.users(), function(err, results) {
            if (err) throw err;
            res.send('DB seeding successful');
        });
    });
}   