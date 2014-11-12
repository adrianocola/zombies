
app.get('/', function (req, res) {
    res.render('index');
})

app.get('/editor', function (req, res) {
    res.render('editor');
})

module.exports = require('require-directory')(module);