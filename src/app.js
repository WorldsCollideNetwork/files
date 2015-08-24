var http     = require("http"),
    path     = require("path"),
    fs       = require("fs"),
    express  = require("express"),
    cookie   = require("cookie-parser"),
    busboy   = require("connect-busboy");

var app      = express(),
    server   = module.exports = http.Server(app);

var users    = require("./users")(app);

// view engine
app.set("view engine", "jade");

// directory vairables
app.set("views", path.join(__dirname, "views"));
app.set("files", path.join(__dirname, "files"));
app.set("thumb", path.join(__dirname, "thumb"))

try {
	app.set("urls", require("./URLS.json"));
} catch (e){
	app.set("urls", { });
}

// check if files directory exists
if (!fs.existsSync(app.get("files"))){
	fs.mkdirSync(app.get("files"));
}

// check if thumb directory exists
if (!fs.existsSync(app.get("thumb"))){
	fs.mkdirSync(app.get("thumb"));
}

// user folders
require("./utils").get_dirs(app.get("files")).forEach(function(dir){
	app.set(dir, path.join(app.get("files"), dir));
});

// thumb folders
require("./utils").get_dirs(app.get("thumb")).forEach(function(dir){
	app.set("thumb-" + dir, path.join(app.get("thumb"), dir))
});

// generic middleware
app.use(express.static(app.get("views")));
app.use(cookie());
app.use(busboy());

// middleware for jade files
app.use(function(req, res, next){
	res.locals.port = require("./CONFIG.json").port;
	res.locals.version = fs.readFileSync(path.join(__dirname, "VERSION_DEVEL"), "utf8");
	
	res.locals.prefix = require("./CONFIG.json").archive_prefix;

	if (req.cookies.user){
		res.locals.id = req.cookies.user;
		res.locals.user = require("./utils").decrypt(req.cookies.user);
	}

	next();
});

require("./router")(app, users);

// HTTP protocol listener
app.get("*", function(req, res){
	var url = req.url.split("?")[0];

	if (url == "/"){
		res.render("index");
	} else {
		url = url.substring(1);
		file = app.get("urls")[url.replace("thumb/", "")];

		if (file){
			var split = file.split(","),
			    end   = undefined;

			// check if url is a thumb
			if (url.indexOf("thumb/") == 0){
			    end = path.join(app.get("thumb-" + split[0]), split[1]);
			} else {
				end = path.join(app.get(split[0]), split[1]);
			}

			if (fs.existsSync(end)){
				res.sendFile(end);
			} else {
				res.render("404");
			}
		} else {
			if (url != "clientid" &&
				fs.existsSync(path.join(app.get("views"), url + ".jade"))){
				res.render(url);
			} else {
				res.render("404");
			}
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