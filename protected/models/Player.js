var PlayerSchema = app.mongoose.Schema({
    name: String,
    entity: {type: String, default: 'Player'},
    rx: Number,
    ry: Number,
    x: Number,
    y: Number,
    slot: Number,
    color: String,
    inventory: [{}]
});

PlayerSchema.index({ x: 1, y: 1 , slot: 1},{unique: true});
PlayerSchema.index({ rx: 1, ry: 1 });

module.exports = app.mongoose.model('Player', PlayerSchema);