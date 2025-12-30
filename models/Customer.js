const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const registerSchema = new mongoose.Schema(
{
  fullName: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    middleName: {
      type: String,
      trim: true,
      default: ""
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    }
  },

  storeName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },

  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },

  contactNo: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => /^[6-9]\d{9}$/.test(v),
      message: "Invalid Indian mobile number"
    }
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true,
    validate: {
      validator: v => /^\S+@\S+\.\S+$/.test(v),
      message: "Invalid email address"
    }
  },

  gstNo: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: v =>
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v),
      message: "Invalid GST number"
    }
  },

  storeLicNo: {
    type: String,
    required: true,
    trim: true
  },

  clinixPayLicKey: {
    type: String,
    required: true,
    trim: true,
    index: true,
    minlength: 12,
    maxlength: 12
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false   
  },

  isActive: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true,
  strict: true
});
registerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});
registerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Customer", registerSchema);
