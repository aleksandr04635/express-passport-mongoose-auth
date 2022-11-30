var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { DateTime } = require("luxon");

var PostSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  commentTo: {type: Schema.Types.ObjectId, ref: 'Post'},
  title: {type: String},
  content: {type: String, required: true},
  },
    { timestamps: true }
 //   timestamps – this is used to tell Mongoose to add 
 //   createdAt and updatedAt properties to a schema. 
 //The values will be auto-populated by Mongoose.
 /*   registerDate: {
      type: Date,
      default: Date.now
    }
    */
);

PostSchema
.virtual('url')
.get(function () {
  return '/posts/' + this._id;
});

PostSchema
.virtual('updatedAtFormatted')
.get(function () {
  return this.updatedAt ? DateTime.fromJSDate(this.updatedAt ).setLocale('en-gb').toLocaleString(DateTime.DATETIME_MED) : '';
});

module.exports = mongoose.model('Post', PostSchema);







