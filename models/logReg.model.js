const mongoose = require("mongoose");

const Schemae = mongoose.Schema;

const crudSchema = Schemae(
  {
    name: { type: String, required: true },

    email: { type: String, required: true },
    age: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    isDeleted: { type: Boolean, enum: [true, false], default: false },
  },
  {
    timestamps: true,
    versionkey: false,
  }
);

module.exports = mongoose.model("crud", crudSchema);
