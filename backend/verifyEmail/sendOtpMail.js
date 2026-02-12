import nodemailer from 'nodemailer'

export const sendOtpMail = async (email, otp) => {
 const transporter = nodemailer.createTransport({
  service: email,
  auth:{
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
 })

 const mailOptions = {
  from: process.env.MAIL_USER,
  to: email,
  subject: 'Passwod reset OTP',
  html: `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
    
    <h2 style="color: #111827; text-align: center; margin-bottom: 16px;">
      Password Reset OTP
    </h2>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      Hello,
    </p>

    <p style="color: #374151; font-size: 14px; line-height: 1.6;">
      Your One-Time Password (OTP) for resetting your password is:
    </p>

    <div style="text-align: center; margin: 20px 0;">
      <span style="
        display: inline-block;
        padding: 12px 20px;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 4px;
        color: #1f2933;
        background-color: #e0f2fe;
        border-radius: 6px;
        border: 1px dashed #38bdf8;
      ">
        ${otp}
      </span>
    </div>

    <p style="color: #6b7280; font-size: 13px;">
      This OTP is valid for <b>10 minutes</b>. Please do not share it with anyone.
    </p>

    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
      If you did not request this, please ignore this email.
    </p>
  </div>
`
 }
 await transporter.sendMail(mailOptions)
}