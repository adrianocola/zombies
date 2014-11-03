var WorldSchema = app.mongoose.Schema({
    name: String
});

app.models.World = app.mongoose.model('World', WorldSchema);