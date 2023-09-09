import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URI,
      "http://localhost:5000",
      "http://localhost:3000",
    ],
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
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
// Reset Pwd Mail
export const sendResetMail = (name, date, from, pass, recipient, sub, link) => {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail", // e.g., 'Gmail', 'Outlook'
    auth: {
      user: from,
      pass: pass,
    },
    secure: true, // Use a secure connection (TLS)
    port: 465,
  });

  // Define the email content and recipient
  const mailOptions = {
    from: from,
    to: recipient,
    subject: sub,
  };

  const html = `<h1>Hello ${name} This is One-Time Link to reset password - ${date}. Link will get expire in 15m .</h1><a href="${link}" >Cick Here.</a> `;

  mailOptions.html = html;
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
const forgotpwd = async (req, res) => {
  const { email } = req.body;
  const user = await usersModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found!" });
  }
  const secret = process.env.JWT_SECRET_KEY + user.password;
  const payload = {
    email,
    _id: user._id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `https://articverse.vercel.app/resetpwd/${user._id}/${token}`;
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
const resetpwd = async (req, res) => {
  const { password, id, token } = req.body;
  // Additional checks
  if (!id || !token) {
    return res.status(404).json({ success: false, message: "Invalid Session" });
  }

  const user = await usersModel.findById({ _id: id });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const secret = process.env.JWT_SECRET_KEY + user.password;
  try {
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        return res
          .status(404)
          .json({ message: "Token Expired", success: false });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const updated = await usersModel.findByIdAndUpdate(
        { _id: id },
        { $set: { password: hashedPassword } }
      );
      if (!updated) {
        return res
          .status(404)
          .json({ message: "Request Failed", success: false });
      }
      res.status(200).json({ success: true, message: "Password Changed" });
    });
  } catch (error) {
    return res.status(404).json({ message: "Token Expired", success: false });
  }
};

app.get("/", (req, res) => {
  res.send("service online");
});
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
