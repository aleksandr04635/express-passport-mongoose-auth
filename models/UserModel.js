var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: {type: String, required: true, unique: true},//it will be email
   // password: {type: String, required: true},
    password: String,
    name: {type: String, required: true},
  },
    { timestamps: true }
 //   timestamps – this is used to tell Mongoose to add c
 //   reatedAt and updatedAt properties to a schema. The values will be auto-populated by Mongoose.
 /*   registerDate: {
      type: Date,
      default: Date.now
    }
    */
);

// Virtual for users URL
UserSchema
.virtual('url')
.get(function () {
  return '/users/' + this._id;
});
// Passport-local-mongoose automatically salts and hashes passwords.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);



