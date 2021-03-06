var http     = require("http"),
    path     = require("path"),
    fs       = require("fs"),
    express  = require("express"),
    session  = require("express-session"),
    cors     = require("cors"),
    cookie   = require("cookie-parser");

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
app.use(cors());
app.use(cookie());

app.use(session({
	secret: "thisreallydoesntmatter",
	resave: false,
	saveUninitialized: false,
	cookie: {
		path: "/",
		domain: "worldscolli.de",
		expires: new Date(Date.now() + (60 * 60 * 24 * 365 * 20 * 1000))
	}
}));

// jade and variable middleware
app.use(function(req, res, next){
	res.locals.port = require("./CONFIG.json").port;
	res.locals.version = fs.readFileSync(path.join(__dirname, "VERSION_DEVEL"), "utf8");

	res.locals.prefix = require("./CONFIG.json").archive_prefix;

	if (req.cookies.client_id && require("./utils").decrypt(req.cookies.client_id)){
		res.locals.user = require("./utils").decrypt(req.cookies.client_id);
		res.locals.id = req.cookies.client_id;
	}

	next();
});

require("./router")(app, users);

// HTTP protocol listener
app.get("*", function(req, res){
	var url = req.url.split("?")[0];

	if (url == "/"){
		if (res.locals.user){
			res.redirect("manage")
		} else {
			res.render("index");
		}
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
			if (fs.existsSync(path.join(app.get("views"), url + ".jade"))){
				if (res.locals.user && url == "manage"){
					users.render_manage(req, res, {
						status: 0,
						username: res.locals.user
					});
				} else {
					res.render(url);
				}
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