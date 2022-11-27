var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    password: String,
    name: String,
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
// Passport-local-mongoose automatically salts and hashes passwords.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);



