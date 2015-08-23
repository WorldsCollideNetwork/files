var http     = require("http"),
    path     = require("path"),
    fs       = require("fs"),
    express  = require("express"),
    busboy   = require("connect-busboy");

var app      = express(),
    server   = module.exports = http.Server(app);

var users    = require("./users");

// generic variables
app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));
app.set("files", path.join(__dirname, "files"));

try {
	app.set("urls", require("./URLS.json"));
} catch (e){
	app.set("urls", { });
}

// check if files directory exists
if (!fs.existsSync(app.get("files"))){
	fs.mkdirSync(app.get("files"));
}

// user folders
require("./utils").get_dirs(app.get("files")).forEach(function(dir){
	app.set(dir, path.join(app.get("files"), dir));
});

// generic middleware
app.use(express.static(app.get("views")));
app.use(busboy({
	immediate: true
}));

// middleware for jade files
app.use(function(req, res, next){
	res.locals.port = require("./CONFIG.json").port;
	res.locals.version = fs.readFileSync(path.join(__dirname, "VERSION_DEVEL"), "utf8");

	next();
});

require("./router")(app, users);

// HTTP protocol listener
app.get("*", function(req, res){
	var url = req.url.split("?")[0];

	if (url == "/"){
		res.render("index");
	} else {
		url = app.get("urls")[url.replace("/", "")];

		if (url){
			var split = url.split(",");
			res.sendFile(path.join(app.get(split[0]), split[1]));
		} else {
			res.send("404");
		}
	}
});

// SIGINT listener
process.stdin.resume();
process.on("SIGINT", function(){
	require("./utils").save(app.get("urls"));

	console.log("SAVED URLS.");
	process.exit();
});