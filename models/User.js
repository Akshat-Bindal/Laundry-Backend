import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  emailVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  addresses: [{ type: String }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);

