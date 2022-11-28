var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var passportLocalMongoose = require('passport-local-mongoose');

var PostSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  title: {type: String, required: true},
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
// Passport-local-mongoose automatically salts and hashes passwords.
//UserSchema.plugin(passportLocalMongoose);

// Virtual for genres URL
PostSchema
.virtual('url')
.get(function () {
  return '/posts/' + this._id;
});

module.exports = mongoose.model('Post', PostSchema);



