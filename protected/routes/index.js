
app.get('/', function (req, res) {
    res.render('index');
})

module.exports = require('require-directory')(module);