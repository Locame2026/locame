'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { handleRegisterClient, handleRegisterRestaurant, handleRegisterCompany, handleLogin } from './actions';

type AuthStep = 'choice' | 'register-client' | 'register-restaurant' | 'register-company' | 'login';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let result;

    if (step === 'register-client') {
      result = await handleRegisterClient(formData);
    } else if (step === 'register-restaurant') {
      result = await handleRegisterRestaurant(formData);
    } else if (step === 'register-company') {
      result = await handleRegisterCompany(formData);
    } else if (step === 'login') {
      result = await handleLogin(formData);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result && 'success' in result && result.success) {
      const user = (result as any).user || { role: (step === 'register-client' ? 'CLIENT' : (step === 'register-restaurant' ? 'RESTAURANT' : 'CLIENT')), name: formData.get('firstName') || formData.get('restaurantName') };
      localStorage.setItem('locame_role', user.role);
      localStorage.setItem('locame_user', user.name as string);
      localStorage.setItem('locame_user_id', user.id);
      if (user.restaurantId) {
        localStorage.setItem('locame_restaurant_id', user.restaurantId);
      }

      if (user.role === 'ADMIN') {
        router.push('/admin/users');
      } else if (user.role === 'RESTAURANT') {
        router.push('/restaurant/dashboard');
      } else if (user.role === 'COMPANY_ADMIN') {
        router.push('/business/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    }
  };

  const renderHeader = (title: string, subtitle: string) => (
    <header className="auth-header">
      <div className="logo-icon-wrapper" onClick={() => setStep('choice')} style={{ cursor: 'pointer' }}>
        <Image src="/logo-new.jpg" alt="LOCAME" width={200} height={200} className="auth-logo" priority />
      </div>
      <h1 className="brand-font gradient-text">{title}</h1>
      <p className="brand-script">{subtitle}</p>
    </header>
  );

  return (
    <div className="auth-wrapper">
      <div className="glow-top"></div>
      <div className="glow-bottom"></div>
      <div className="glow-center"></div>

      <div className="auth-card glass">
        {step === 'choice' && (
          <>
            {renderHeader('Comencemos', 'Tu mejor menú está a un paso')}
            <div className="role-grid">
              <button className="role-btn glass-interactive" onClick={() => setStep('register-client')}>
                <div className="icon">👤</div>
                <span>Soy Cliente</span>
                <p>Busco menús del día</p>
              </button>
              <button className="role-btn glass-interactive" onClick={() => setStep('register-restaurant')}>
                <div className="icon">🍳</div>
                <span>Soy Restaurante</span>
                <p>Subo mis menús diarios</p>
              </button>
              <button className="role-btn glass-interactive" onClick={() => setStep('register-company')}>
                <div className="icon">🏢</div>
                <span>Soy Empresa</span>
                <p>Subvenciona menús a empleados</p>
              </button>
            </div>
            <div className="auth-footer">
              <p>¿Ya tienes una cuenta? <button className="link-btn highlight" onClick={() => setStep('login')}>Inicia sesión</button></p>
            </div>
          </>
        )}

        {step === 'register-client' && (
          <>
            {renderHeader('Registro Cliente', 'Encuentra tu menú del día sin líos')}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Nombre</label>
                  <input name="firstName" type="text" placeholder="Ej. Juan" required className="input-field" />
                </div>
                <div className="input-group">
                  <label>Apellidos</label>
                  <input name="lastName" type="text" placeholder="Ej. Pérez" required className="input-field" />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <input name="email" type="email" placeholder="juan@ejemplo.com" required className="input-field" />
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>Teléfono</label>
                  <input name="phone" type="tel" placeholder="600 000 000" required className="input-field" />
                </div>
                <div className="input-group">
                  <label>Cumpleaños</label>
                  <input name="birthday" type="date" className="input-field" />
                </div>
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="password-wrapper">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label>Confirmar</label>
                  <div className="password-wrapper">
                    <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary submit-btn">
                {loading ? 'Creando cuenta...' : 'Confirmar Registro'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>
              <button type="button" className="back-btn" onClick={() => setStep('choice')}>Volver atrás</button>
            </form>
          </>
        )}

        {step === 'register-restaurant' && (
          <>
            {renderHeader('Alta Restaurante', 'Gestiona tu menú en segundos')}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Nombre Comercial</label>
                <input name="restaurantName" type="text" placeholder="Ej. Restaurante Arzak" required className="input-field" />
              </div>
              <div className="input-group">
                <label>Dirección Completa</label>
                <input name="address" type="text" placeholder="Calle de la Gastronomía, 1, Madrid" required className="input-field" />
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>Email Contacto</label>
                  <input name="contactEmail" type="email" placeholder="hola@mi-restaurante.com" required className="input-field" />
                </div>
                <div className="input-group">
                  <label>Teléfono Contacto</label>
                  <input name="contactPhone" type="tel" placeholder="912 345 678" required className="input-field" />
                </div>
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="password-wrapper">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label>Confirmar Password</label>
                  <div className="password-wrapper">
                    <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary submit-btn">
                {loading ? 'Dando de alta...' : 'Registrar Restaurante'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>
              <button type="button" className="back-btn" onClick={() => setStep('choice')}>Volver atrás</button>
            </form>
          </>
        )}

        {step === 'register-company' && (
          <>
            {renderHeader('Registro de Empresa', 'Beneficios para tu equipo')}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Nombre Empresa</label>
                  <input name="companyName" type="text" placeholder="Ej. Tech Solutions" required className="input-field" />
                </div>
                <div className="input-group">
                  <label>CIF</label>
                  <input name="cif" type="text" placeholder="B12345678" required className="input-field" />
                </div>
              </div>
              <div className="input-group">
                <label>Email de Administración</label>
                <input name="adminEmail" type="email" placeholder="admin@empresa.com" required className="input-field" />
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="password-wrapper">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label>Confirmar</label>
                  <div className="password-wrapper">
                    <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary submit-btn">
                {loading ? 'Creando empresa...' : 'Registrar Empresa'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>
              <button type="button" className="back-btn" onClick={() => setStep('choice')}>Volver atrás</button>
            </form>
          </>
        )}


        {step === 'login' && (
          <>
            {renderHeader('Bienvenido', 'Accede a tu cuenta')}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Email</label>
                <input name="email" type="email" placeholder="usuario@locame.es" required className="input-field" />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <div className="password-wrapper">
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="input-field" />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                <div className="forgot-password-link">
                  <Link href="/auth/forgot-password">
                    ¿Has olvidado tu contraseña?
                  </Link>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary submit-btn">
                {loading ? 'Entrando...' : 'Iniciar Sesión'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>
              <div className="auth-footer">
                <p>¿Aún no tienes cuenta? <button type="button" className="link-btn highlight" onClick={() => setStep('choice')}>Regístrate</button></p>
              </div>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
                .auth-wrapper {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 40px 20px;
                    background: #ffffff;
                    position: relative;
                    overflow: hidden;
                }

                .glow-top {
                    position: absolute;
                    top: -15%;
                    right: -5%;
                    width: 60%;
                    height: 60%;
                    background: radial-gradient(circle, rgba(255, 204, 51, 0.15) 0%, transparent 70%);
                    z-index: 1;
                    filter: blur(60px);
                }

                .glow-bottom {
                    position: absolute;
                    bottom: -15%;
                    left: -5%;
                    width: 60%;
                    height: 60%;
                    background: radial-gradient(circle, rgba(255, 204, 51, 0.1) 0%, transparent 70%);
                    z-index: 1;
                    filter: blur(60px);
                }

                .glow-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80%;
                    height: 80%;
                    background: radial-gradient(circle, rgba(255, 204, 51, 0.05) 0%, transparent 60%);
                    z-index: 1;
                    filter: blur(80px);
                }

                .auth-card {
                    width: 100%;
                    max-width: 580px;
                    padding: 60px 40px;
                    z-index: 10;
                    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.82);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.15), 0 0 100px rgba(255, 204, 51, 0.05);
                    border-radius: 40px;
                }
                .auth-card > * { width: 100%; text-align: center; }

                .auth-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    margin-bottom: 60px;
                    width: 100%;
                }

                .logo-icon-wrapper {
                    margin: 0 auto 40px auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    filter: drop-shadow(0 15px 30px rgba(0,0,0,0.08));
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .logo-icon-wrapper:hover {
                    transform: scale(1.1) rotate(5deg);
                }

                .auth-logo {
                    border-radius: 20px;
                    object-fit: contain;
                }

                .brand-font {
                    font-family: 'Anton', sans-serif !important;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .brand-script {
                    font-family: 'Dancing Script', cursive !important;
                    font-size: 2rem;
                    color: var(--primary);
                    margin-top: -10px;
                    margin-bottom: 20px;
                    text-shadow: 0 0 15px rgba(255, 204, 51, 0.3);
                    text-align: center;
                }

                .gradient-text {
                    font-size: 4rem;
                    font-weight: 400;
                    line-height: 0.9;
                    margin-bottom: 0px;
                    background: linear-gradient(135deg, #111827 0%, #ffcc33 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-align: center;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    width: 100%;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .role-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 30px;
                    width: 100%;
                }

                .role-btn {
                    padding: 50px 30px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255, 255, 255, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 24px;
                    transition: all 0.3s ease;
                }

                .role-btn:hover {
                    background: rgba(255, 255, 255, 0.6);
                    transform: translateY(-5px);
                }

                .role-btn .icon { font-size: 3rem; margin-bottom: 12px; }
                .role-btn span { font-weight: 800; font-size: 1.2rem; color: var(--text-main); }
                .role-btn p { font-size: 0.9rem; color: var(--text-dim); }

                .input-group label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 8px;
                    padding-left: 4px;
                    text-align: left;
                }

                .input-field {
                    width: 100%;
                    padding: 14px 18px;
                    border-radius: 14px;
                    border: 1px solid var(--glass-border);
                    background: white;
                    color: #1a1a1a;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .input-field:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 5px rgba(255, 204, 51, 0.15);
                }

                .password-wrapper {
                    position: relative;
                    width: 100%;
                }

                .pw-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 5px;
                    z-index: 5;
                }

                .submit-btn {
                    margin-top: 25px;
                    font-size: 1.25rem;
                    padding: 18px 48px;
                    border-radius: 18px;
                    background: linear-gradient(135deg, #fce08a 0%, #fcd34d 100%);
                    color: #fff !important;
                    font-weight: 700;
                    text-transform: none;
                    letter-spacing: -0.01em;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    width: 100%;
                }

                .submit-btn:hover {
                    background: linear-gradient(135deg, #fde68a, #fbbf24);
                    transform: scale(1.05) translateY(-3px);
                    box-shadow: 0 20px 40px -10px rgba(251, 191, 36, 0.5);
                }

                .submit-btn svg {
                    transition: transform 0.3s ease;
                    color: #fff;
                }

                .submit-btn:hover svg {
                    transform: translateX(5px);
                }

                .back-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 10px;
                    transition: color 0.2s;
                    text-decoration: underline;
                    margin-top: 10px;
                }

                .back-btn:hover { color: var(--text-main); }

                .link-btn {
                    background: transparent;
                    border: none;
                    font-weight: 800;
                    cursor: pointer;
                    padding: 0;
                    font-size: inherit;
                }
                .highlight {
                    color: #d97706;
                    border-bottom: 2px solid var(--primary);
                }

                .auth-footer {
                    margin-top: 30px;
                    text-align: center;
                    padding-top: 25px;
                    border-top: 1px dashed var(--glass-border);
                    color: var(--text-dim);
                }

                .error-msg {
                    color: #b91c1c;
                    font-size: 0.95rem;
                    font-weight: 600;
                    background: #fef2f2;
                    border: 1px solid #fee2e2;
                    padding: 12px;
                    border-radius: 12px;
                    text-align: center;
                }

                .forgot-password-link {
                    text-align: right;
                    margin-top: 8px;
                }

                .forgot-password-link Link, 
                .forgot-password-link a {
                    font-size: 0.85rem;
                    color: var(--text-main);
                    text-decoration: underline;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 900px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .role-grid { grid-template-columns: 1fr; }
                    .auth-card { padding: 35px 20px; }
                    .gradient-text { font-size: 2.5rem; }
                }
            `}</style>
    </div >
  );
}
