var utils = require("./utils");

function Users(app){
	this.get = function(client_id){
		return utils.decrypt(client_id);
	};

	this.render_manage = function(req, res, data){
		if (data.status){
			require("./utils").accepts(req, function(){
				res.json({
					status: data.status,
					id: data.username ? require("./utils").encrypt(username) : undefined
				});
			}, function(){
				console.log(data.status);
				console.log(data.username);
				console.log(require("./utils").encrypt(username));
				res.render("manage", {
					status: data.status,
					id: data.username ? require("./utils").encrypt(username) : undefined,
					thumbs: data.username ? require("./utils").thumbs(app, username) : undefined
				});
			});
		} else {
			res.end();
		}
	};

	return this;
}

module.exports = Users;