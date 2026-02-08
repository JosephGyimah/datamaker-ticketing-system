/**
 * User model
 * Defines the User schema and structure using Mongoose
 * Includes password hashing with bcryptjs
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "User",
        "Admin",
        "MD",
        "HPM",
        "IT/FM",
        "AssIT/FM",
        "SnrPM",
        "PM",
        "QM",
        "Lbl",
      ],
      default: "User",
    },
    resetToken: {
      type: String,
      default: "",
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We're handling createdAt manually
  },
);

/**
 * Hash the password before saving
 * Only hash if password is new or modified
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
