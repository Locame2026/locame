'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { handleLogout } from '../../auth/actions';

// Mock data for the dashboard (Regla III.4: No placeholders, use dynamic design)
const MOCK_CONSUMPTION = [
    { month: 'Ene', amount: 450 },
    { month: 'Feb', amount: 520 },
    { month: 'Mar', amount: 480 },
    { month: 'Abr', amount: 610 },
];

export default function BusinessDashboard() {
    const [companyData, setCompanyData] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('locame_role');
        if (role !== 'COMPANY_ADMIN') {
            router.push('/auth');
            return;
        }

        // Simulate fetching company data
        const load = async () => {
            setCompanyData({
                name: 'Taller Pepe',
                balance: 1250.50,
                plan: 'Premium Business',
                subsidy: 3.00
            });
            setEmployees([
                { id: '1', name: 'Juan Pérez', email: 'juan@pepe.com', consumption: 45.00 },
                { id: '2', name: 'María García', email: 'maria@pepe.com', consumption: 60.00 },
                { id: '3', name: 'Carlos Ruiz', email: 'carlos@pepe.com', consumption: 30.00 },
            ]);
            setLoading(false);
        };
        load();
    }, [router]);

    const logout = async () => {
        localStorage.clear();
        await handleLogout();
    };

    if (loading) return <div className="loading-container">Cargando dashboard...</div>;

    return (
        <div className="business-dashboard">
            <header className="dash-header glass">
                <div className="branding" onClick={() => router.push('/')}>
                    <Image src="/icon.jpg" alt="LOCAME" width={32} height={32} />
                    <span className="logo">LOCAME Business</span>
                </div>
                <div className="user-nav">
                    <span>Admin: <strong>{companyData.name}</strong></span>
                    <button onClick={logout} className="exit-btn">Salir</button>
                </div>
            </header>

            <main className="dash-grid">
                <section className="stats-panel">
                    <div className="stat-card balance-card glass-interactive">
                        <label>Saldo Disponible</label>
                        <div className="value">{companyData.balance.toFixed(2)}€</div>
                        <div className="sub-value">Plan: {companyData.plan}</div>
                        <button className="btn-primary recharge-btn">Recargar Saldo 💳</button>
                    </div>

                    <div className="stat-card graph-card glass">
                        <h3>Consumo Mensual</h3>
                        <div className="bar-chart">
                            {MOCK_CONSUMPTION.map((it, i) => (
                                <div key={i} className="bar-group">
                                    <div className="bar" style={{ height: `${(it.amount / 700) * 100}%` }}>
                                        <span className="tooltip">{it.amount}€</span>
                                    </div>
                                    <span className="label">{it.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="employees-panel glass">
                    <header className="panel-header">
                        <h3>Asignación de Empleados</h3>
                        <button className="btn-secondary add-btn">+ Añadir</button>
                    </header>

                    <div className="employee-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Consumo (Mes)</th>
                                    <th>Subvención</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td><strong>{emp.name}</strong></td>
                                        <td>{emp.email}</td>
                                        <td>{emp.consumption.toFixed(2)}€</td>
                                        <td><span className="subsidy-badge">{companyData.subsidy}€/día</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <style jsx>{`
                .business-dashboard { min-height: 100vh; background: #f9fafb; padding: 24px; max-width: 1400px; margin: 0 auto; }
                
                .dash-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-radius: 20px; margin-bottom: 32px; background: white; }
                .logo { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--primary); margin-left: 10px; }
                .exit-btn { background: none; border: 1px solid var(--glass-border); padding: 6px 16px; border-radius: 8px; cursor: pointer; margin-left: 16px; }

                .dash-grid { display: grid; grid-template-columns: 350px 1fr; gap: 24px; }
                
                .stats-panel { display: flex; flex-direction: column; gap: 24px; }
                .stat-card { padding: 32px; border-radius: 24px; display: flex; flex-direction: column; }
                
                .balance-card { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: white; }
                .balance-card label { font-size: 0.9rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
                .balance-card .value { font-size: 3rem; font-weight: 800; margin: 8px 0; }
                .balance-card .sub-value { font-size: 0.85rem; opacity: 0.6; margin-bottom: 24px; }
                .recharge-btn { background: white; color: black; font-weight: 700; height: 50px; }

                .graph-card h3 { margin-bottom: 32px; font-size: 1.1rem; }
                .bar-chart { height: 200px; display: flex; align-items: flex-end; justify-content: space-around; padding-bottom: 20px; }
                .bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; }
                .bar { width: 30px; background: var(--primary); border-radius: 6px 6px 2px 2px; position: relative; transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
                .bar:hover { filter: brightness(1.2); }
                .tooltip { position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; font-weight: 700; opacity: 0; transition: 0.3s; }
                .bar:hover .tooltip { opacity: 1; top: -30px; }
                .label { font-size: 0.75rem; margin-top: 12px; font-weight: 600; color: var(--text-dim); }

                .employees-panel { background: white; padding: 32px; border-radius: 24px; }
                .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                .employee-list table { width: 100%; border-collapse: collapse; }
                .employee-list th { text-align: left; padding: 12px; border-bottom: 1px solid #eee; color: var(--text-dim); font-size: 0.85rem; font-weight: 600; }
                .employee-list td { padding: 16px 12px; border-bottom: 1px solid #f3f4f6; }
                .subsidy-badge { background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }

                @media (max-width: 1000px) {
                    .dash-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
