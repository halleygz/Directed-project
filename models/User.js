const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isemail");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
  },
  username: {
    type: String,
    required: [true, "Please enter your username"],
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    default: "",
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a vlid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password "],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  avatar:{
    type: String,
    default: ""
  }
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static meethod
userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect cridentials");
  }
  throw Error("incorrect cridentials");
};

const User = mongoose.model("user", userSchema);
module.exports = User;
