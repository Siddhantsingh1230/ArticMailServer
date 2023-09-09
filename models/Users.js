import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  profileImageURL: {
    type: String,
    default: "profile_images/user_placeholder.png",
  },
  tokenCreated: {
    type: Boolean,
    default: false,
  },
});
export const usersModel = mongoose.model("users", usersSchema);
