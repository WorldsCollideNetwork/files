var http     = require("http"),
    path     = require("path"),
    fs       = require("fs"),
    express  = require("express"),
    busboy   = require("connect-busboy");

var app      = express(),
    server   = module.exports = http.Server(app);

var users    = require("./users");

// view engine
app.set("view engine", "jade");

// generic middleware
app.use(express.static(path.join(__dirname, "views")));
app.use(busboy({
	immediate: true
}));

// middleware for jade files
app.use(function(req, res, next){
	res.locals.port = require("./CONFIG.json").port;
	res.locals.version = fs.readFileSync(path.join(__dirname, "VERSION_DEVEL"), "utf8");

	next();
});

// upload listener
app.post("/upload", function(req, res){
	req.pipe(req.busboy);

	req.busboy.on("field", function(field, val){
		if (!req.body) req.body = { };
		req.body[field] = val;
	});

	req.busboy.on("file", function(field, file, name){
		console.log(req.body);
		console.log("Uploading: " + name);

		var fstream = fs.createWriteStream(path.join(__dirname, "files", name));
		file.pipe(fstream);

		fstream.on("close", function(){
			console.log("Done.");
			res.json({
				"success": true
			});;
		});
	});
});

// HTTP protocol listener
app.get("/", function(req, res){
	res.render("index");
});

// SIGINT listener
process.stdin.resume();
process.on("SIGINT", function(){
	users.save();
	process.exit();
});