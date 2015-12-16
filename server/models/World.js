var WorldSchema = server.mongoose.Schema({
    name: String,
    top: Number,
    right: Number,
    bottom: Number,
    left: Number
});

module.exports = server.mongoose.model('World', WorldSchema);