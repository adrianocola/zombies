var Thing = require('./Thing.js');

var SlotSchema = server.mongoose.Schema({
    _id: false,
    floor: [], //things on the floor (many at the same time)
    stand: {} //thing standing (com only be one at a time)
});

module.exports = server.mongoose.model('Slot', SlotSchema);