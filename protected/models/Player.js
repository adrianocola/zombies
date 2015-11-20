var PlayerSchema = app.mongoose.Schema({
    name: String,
    pos: {type: [Number], index: {type: "2d", min: -1000000, max: 1000000}},
    slot: Number,
    inventory: [{ type: app.mongoose.Schema.ObjectId, ref: 'Thing'}]
});

module.exports = app.mongoose.model('Player', PlayerSchema);