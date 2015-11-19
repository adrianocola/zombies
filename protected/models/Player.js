var PlayerSchema = app.mongoose.Schema({
    name: String,
    pos: {type: [Number]}, //[x,y,slot]
    inventory: [{ type: app.mongoose.Schema.ObjectId, ref: 'Thing'}]
});

module.exports = app.mongoose.model('Player', PlayerSchema);