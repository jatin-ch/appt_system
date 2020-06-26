var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname: String,
    lastname: String,
    phoneNo: { type: String, required: true, unique: true},
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

var User = mongoose.model('User', userSchema);

module.exports = User;