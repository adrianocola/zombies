var TileTypeSchema = app.mongoose.Schema({
    name: {type: String, required: true, lowercase: true, index: { unique: true }},
    body: Boolean
});

app.models.TileType = app.mongoose.model('TileType', TileTypeSchema);