var SlotSchema = app.mongoose.Schema({
    name: String
});

app.models.Slot = app.mongoose.model('Slot', SlotSchema);