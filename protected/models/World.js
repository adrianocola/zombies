var WorldSchema = app.mongoose.Schema({
    name: String,
    top: Number,
    right: Number,
    bottom: Number,
    left: Number
});

module.exports = app.mongoose.model('World', WorldSchema);