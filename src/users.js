var utils = require("./utils");

function Users(app){
	this.get = function(client_id){
		return utils.decrypt(client_id);
	};

	this.render_manage = function(res, username){
		res.render("manage", {
			status: 0,
			id: require("./utils").encrypt(username),
			thumbs: require("./utils").thumbs(app, username)
		});
	};

	return this;
}

module.exports = Users;