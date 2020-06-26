var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
    title: { type: String, required: true, unique: true},
    begin: { type: Date, required: true, unique: true},
    end: { type: Date, required: true, unique: true},
    duration: Number,
    status: String,
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

var Event = mongoose.model('Event', eventSchema);

module.exports = Event;