import nodemailer from 'nodemailer'

export const verifyEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  })

  const frontendURL = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/$/, "");

  const mailConfiguration = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Email Verification",
    html: `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f4f6f8;
    padding: 30px;
  ">
    <div style="
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
    ">
      <h1 style="color: #333;">Email Verification</h1>
      <p style="color: #555; font-size: 16px;">
        Click the button below to verify your email
      </p>

      <a href="${frontendURL}/verify/${token}"
        style="
          display: inline-block;
          margin-top: 20px;
          padding: 12px 20px;
          background-color: #4f46e5;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">
        Verify Email
      </a>
      <div style="text-align: center; margin: 20px 0;">
      <p style="
        margin-top: 20px;
        font-size: 12px;
        color: #999;
      ">
        If you didn’t request this, please ignore this email.
      </p>
    </div>
  </div>
`,
  };

  await transporter.sendMail(mailConfiguration, function(error, info){
    if(error){
      throw new Error(error)
    }
    console.log("Email send Successfully");
    console.log(info);
  })
}