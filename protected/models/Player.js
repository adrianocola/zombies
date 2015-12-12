var PlayerSchema = app.mongoose.Schema({
    name: String,
    entity: {type: String, default: 'Player'},
    region: {type: [Number], index: true},
    pos: {type: [Number], index: true},
    slot: Number,
    color: String,
    inventory: [{}]
});

module.exports = app.mongoose.model('Player', PlayerSchema);