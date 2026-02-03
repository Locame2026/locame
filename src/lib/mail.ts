import nodemailer from 'nodemailer';

/**
 * Mail Wrapper: Abstrae el envío de correos (Regla I.2).
 */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        await transporter.sendMail({
            from: `"LOCAME" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error('MAIL_ERROR:', error);
        return { success: false, error };
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #111827;">Recuperar Contraseña - LOCAME</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #ffcc33; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Restablecer Contraseña
                </a>
            </div>
            <p style="color: #666; font-size: 0.8rem;">Este enlace expirará en 1 hora. Si no has solicitado esto, puedes ignorar este correo.</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: 'Recupera tu contraseña en LOCAME',
        html,
    });
}
