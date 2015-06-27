var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var MsgSchema	= new Schema({
	username: String,
	message: String
	
});

module.exports = mongoose.model('ncMsg', MsgSchema);