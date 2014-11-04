var SlotSchema = app.mongoose.Schema({
    pos: {type: [Number], index: '2d'}
});

app.models.Slot = app.mongoose.model('Slot', SlotSchema);