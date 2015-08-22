var http     = require("http"),
    path     = require("path"),
    fs       = require("fs"),
    express  = require("express");

var app      = express(),
    server   = module.exports = http.Server(app);

app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "views")));

app.use(function(req, res, next){
	res.locals.port = require("./CONFIG.json").port;
	res.locals.version = fs.readFileSync(path.join(__dirname, "VERSION_DEVEL"), "utf8");
});