import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const logEmailError = (label, error) => {
  console.error(`[SMTP ERROR - ${label}]`, {
    message: error.message,
    code: error.code,
    command: error.command,
    response: error.response,
    responseCode: error.responseCode,
  });
};

export const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Kode OTP Registrasi SisaBisa',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Kode OTP Registrasi SisaBisa</h2>
          <p>Gunakan kode berikut untuk menyelesaikan proses registrasi akun:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #f0fdf4; color: #15803d; padding: 16px; border-radius: 12px; width: fit-content; margin: 16px 0;">
            ${otp}
          </div>
          <p>Kode ini berlaku selama <b>10 menit</b>.</p>
          <p>Jika kamu tidak merasa melakukan registrasi, abaikan email ini.</p>
        </div>
      `,
    });
  } catch (error) {
    logEmailError('OTP REGISTER', error);

    console.log('\n==================================================');
    console.log('[EMAIL FALLBACK] Gagal kirim email via SMTP. Detail OTP:');
    console.log(`Penerima: ${email}`);
    console.log(`Kode OTP: ${otp}`);
    console.log('==================================================\n');
  }
};

export const sendExpiryReminderEmail = async (email, itemName, expiredAt) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Pengingat Bahan Hampir Kadaluarsa',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Pengingat Kadaluarsa</h2>
          <p>Bahan berikut perlu segera kamu gunakan:</p>
          <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="margin: 0;"><b>Nama bahan:</b> ${itemName}</p>
            <p style="margin: 8px 0 0;"><b>Tanggal kadaluarsa:</b> ${expiredAt}</p>
          </div>
          <p>Segera gunakan bahan tersebut agar tidak terbuang.</p>
        </div>
      `,
    });
  } catch (error) {
    logEmailError('EXPIRY REMINDER', error);

    console.log('\n==================================================');
    console.log('[EMAIL FALLBACK] Gagal kirim email reminder kadaluarsa. Detail:');
    console.log(`Penerima: ${email}`);
    console.log(`Bahan: ${itemName} (Kadaluarsa: ${expiredAt})`);
    console.log('==================================================\n');
  }
};

export const sendResetPasswordOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Kode Reset Password SisaBisa',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset Password SisaBisa</h2>
          <p>Gunakan kode berikut untuk mengatur ulang password akun kamu:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #eff6ff; color: #1d4ed8; padding: 16px; border-radius: 12px; width: fit-content; margin: 16px 0;">
            ${otp}
          </div>
          <p>Kode ini berlaku selama <b>10 menit</b>.</p>
          <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });
  } catch (error) {
    logEmailError('RESET PASSWORD', error);

    console.log('\n==================================================');
    console.log('[EMAIL FALLBACK] Gagal kirim email reset password. Detail:');
    console.log(`Penerima: ${email}`);
    console.log(`Kode OTP: ${otp}`);
    console.log('==================================================\n');
  }
};