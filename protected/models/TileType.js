var TileTypeSchema = app.mongoose.Schema({
    name: {type: String, required: true, lowercase: true, index: { unique: true }},
    url: {type: String},
    body: Boolean
});

app.models.TileType = app.mongoose.model('TileType', TileTypeSchema);