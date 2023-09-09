import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
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
});
const usersModel = mongoose.model("users", usersSchema);

export const forgotpwd = async (req, res) => {
  const { email } = req.body;
  const user = await usersModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found!" });
  }
  const secret = "hero" + user.password;
  const payload = {
    email,
    _id: user._id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `https://articverse.vercel.app/resetpwd?id=${user._id}&token=${token}`;
  sendResetMail(
    user.firstname,
    new Date().toLocaleDateString(),
    process.env.FROM,
    process.env.PASS,
    email,
    "Artic:Reset Password",
    link
  );
  res.status(200).json({ success: true, message: "Check your mail" });
};
export const resetpwd = async (req, res) => {};

app.get("/",(req,res)=>{
    res.send("service online");
})
app.post("/forgotpassword", forgotpwd);
app.post("/resetpassword", resetpwd);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("DB Online");
  })
  .catch((e) => {
    console.log("Error", e);
  });
app.listen(5000, () => {
  console.log(`App running on PORT 5000`);
});
