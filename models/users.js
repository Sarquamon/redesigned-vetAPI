const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userEmail: {type: String, required: true},
	userPwd: {type: String, required: true}
});

module.exports = mongoose.model("User", userSchema);
