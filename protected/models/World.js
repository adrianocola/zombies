var WorldSchema = app.mongoose.Schema({
    name: String,
    top: Number,
    right: Number,
    bottom: Number,
    left: Number
});

app.models.World = app.mongoose.model('World', WorldSchema);