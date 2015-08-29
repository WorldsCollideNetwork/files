var utils = require("./utils");

function Users(app){
	this.get = function(client_id){
		return utils.decrypt(client_id);
	};

	this.render_manage = function(req, res, data){
		if (data.status == 0){
			require("./utils").accepts(req, function(){
				res.json({
					status: data.status,
					id: data.username ? require("./utils").encrypt(data.username) : undefined
				});
			}, function(){
				res.render("manage", {
					status: data.status,
					id: data.username ? require("./utils").encrypt(data.username) : undefined,
					thumbs: data.username ? require("./utils").thumbs(app, data.username) : undefined
				});
			});
		} else {
			res.end();
		}
	};

	return this;
}

module.exports = Users;