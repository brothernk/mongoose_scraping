const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let NoteSchema = new Schema({
	title: String,
});

let Note = mongoose.model("Note", NoteSchema);

//Export
module.exports = Note;