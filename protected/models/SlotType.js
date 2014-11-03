var SlotTypeSchema = app.mongoose.Schema({
    name: String,
    unique: Number
});

app.models.SlotType = app.mongoose.model('SlotType', SlotTypeSchema);