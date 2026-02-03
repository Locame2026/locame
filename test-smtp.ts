
import { sendEmail } from './src/lib/mail';
import * as dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
    console.log('Testing SMTP connection with Gmail...');
    const result = await sendEmail({
        to: 'psola@altim.es',
        subject: 'Prueba de conexión SMTP - LOCAME',
        html: '<h1>¡Conexión exitosa!</h1><p>El servidor de emails de LOCAME está configurado correctamente.</p>'
    });
    console.log('Result:', result);
}

testConnection().catch(console.error);
