
import { handleForgotPassword } from './src/app/auth/actions';

async function test() {
    console.log('Testing forgot password for psola@altim.es...');
    const formData = new FormData();
    formData.append('email', 'psola@altim.es');
    const result = await handleForgotPassword(formData);
    console.log('Result:', result);
}

test().catch(console.error);
