var ThingSchema = app.mongoose.Schema({
    name: String,
    pos: {type: [Number]}
});

module.exports = app.mongoose.model('Thing', ThingSchema);