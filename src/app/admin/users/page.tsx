'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllUsers, updateUserRole, handleLogout } from '../../auth/actions';
import {
    deleteUser, resetUserPassword, getAllReviews, deleteReview,
    getAllRestaurants, toggleRestaurantPremium, deleteRestaurant, getAllCompanies,
    updateCompanyBalance, deleteCompany, getGlobalB2BReport
} from '../../actions/admin-actions';
import { Users, Store, MessageSquare, Briefcase, BarChart3, Trash2, Key, Star } from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                // Initial check logic if needed via client or just rely on server actions failure
                setIsAdmin(true);
                fetchData('users');
            } catch (error) {
                console.error("Auth check failed", error);
                router.push('/auth');
            }
        };
        checkAdmin();
    }, [router]);

    const fetchData = async (tab: string) => {
        setLoading(true);
        setActiveTab(tab);
        if (tab === 'users') {
            const data = await getAllUsers();
            setUsers(data);
        } else if (tab === 'restaurants') {
            const data = await getAllRestaurants();
            setRestaurants(data);
        } else if (tab === 'reviews') {
            const data = await getAllReviews();
            setReviews(data);
        } else if (tab === 'companies') {
            const data = await getAllCompanies();
            setCompanies(data);
        } else if (tab === 'reports') {
            const data = await getGlobalB2BReport();
            setReports(data);
        }
        setLoading(false);
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        const res = await deleteUser(id);
        if (res.success) fetchData('users');
    };

    const handleResetPassword = async (id: string) => {
        const newPass = prompt('Nueva contraseña:');
        if (!newPass) return;
        const res = await resetUserPassword(id, newPass);
        if (res.success) alert('Contraseña actualizada correctamente');
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('¿Eliminar esta reseña definitivamente?')) return;
        const res = await deleteReview(id);
        if (res.success) fetchData('reviews');
    };

    const handleTogglePremium = async (id: string, current: boolean) => {
        const res = await toggleRestaurantPremium(id, !current);
        if (res.success) fetchData('restaurants');
    };

    const handleAddBalance = async (id: string) => {
        const amount = prompt('Cantidad a añadir (e.g. 500):');
        if (!amount || isNaN(parseFloat(amount))) return;
        const res = await updateCompanyBalance(id, parseFloat(amount));
        if (res.success) fetchData('companies');
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;
        const res = await updateUserRole(userId, newRole);
        if (res.success) {
            fetchData('users');
        } else {
            alert('Error al actualizar: ' + res.error);
        }
    };

    if (!isAdmin) return <div className="loading-screen">Verificando acceso...</div>;

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <Image src="/icon.jpg" alt="Locame" width={40} height={40} className="rounded-full" />
                    <span>Admin Panel</span>
                </div>

                <nav className="admin-nav">
                    <button onClick={() => fetchData('users')} className={activeTab === 'users' ? 'active' : ''}>
                        <Users size={20} /> Usuarios
                    </button>
                    <button onClick={() => fetchData('restaurants')} className={activeTab === 'restaurants' ? 'active' : ''}>
                        <Store size={20} /> Restaurantes
                    </button>
                    <button onClick={() => fetchData('reviews')} className={activeTab === 'reviews' ? 'active' : ''}>
                        <MessageSquare size={20} /> Reseñas
                    </button>
                    <button onClick={() => fetchData('companies')} className={activeTab === 'companies' ? 'active' : ''}>
                        <Briefcase size={20} /> Empresas B2B
                    </button>
                    <button onClick={() => fetchData('reports')} className={activeTab === 'reports' ? 'active' : ''}>
                        <BarChart3 size={20} /> Reportes
                    </button>
                </nav>

                <div className="admin-logout">
                    <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
                </div>
            </aside>

            <main className="admin-content">
                <header className="admin-header">
                    <h1>
                        {activeTab === 'users' && 'Gestión de Usuarios'}
                        {activeTab === 'restaurants' && 'Gestión de Restaurantes'}
                        {activeTab === 'reviews' && 'Moderación de Reseñas'}
                        {activeTab === 'companies' && 'Empresas y Saldos'}
                        {activeTab === 'reports' && 'Reportes Globales'}
                    </h1>
                </header>

                <div className="admin-view-area">
                    {loading ? (
                        <div className="spinner">Cargando datos...</div>
                    ) : (
                        <>
                            {activeTab === 'users' ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Fecha Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.first_name || 'Sin nombre'} {u.last_name || ''}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        className="role-select"
                                                        aria-label={`Cambiar rol para ${u.email}`}
                                                        title="Seleccionar rol de usuario"
                                                    >
                                                        <option value="CLIENTE">Cliente</option>
                                                        <option value="RESTAURANT">Restaurante</option>
                                                        <option value="ADMIN">Admin</option>
                                                        <option value="COMPANY_ADMIN">Empresa</option>
                                                    </select>
                                                </td>
                                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td className="actions-cell">
                                                    <button onClick={() => handleResetPassword(u.id)} className="btn-icon" aria-label="Resetear contraseña" title="Resetear contraseña">
                                                        <Key size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u.id)} className="btn-icon danger" aria-label="Eliminar usuario" title="Eliminar usuario">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : activeTab === 'restaurants' ? (
                                <div className="grid-list">
                                    {restaurants.map((r) => (
                                        <div key={r.id} className={`card-item ${r.is_premium ? 'premium' : ''}`}>
                                            <div className="card-header">
                                                <h3>{r.name}</h3>
                                                {r.is_premium && <Star className="premium-icon" size={16} />}
                                            </div>
                                            <p>{r.address}</p>
                                            <div className="card-actions">
                                                <button
                                                    onClick={() => handleTogglePremium(r.id, r.is_premium)}
                                                    className={r.is_premium ? 'btn-outline danger' : 'btn-outline success'}
                                                >
                                                    {r.is_premium ? 'Quitar Premium' : 'Hacer Premium'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`¿Eliminar definitivamente el restaurante "${r.name}"?`)) {
                                                            await deleteRestaurant(r.id);
                                                            fetchData('restaurants');
                                                        }
                                                    }}
                                                    className="btn-outline danger"
                                                    style={{ marginTop: '8px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444' }}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : activeTab === 'reviews' ? (
                                <div className="reviews-list">
                                    {reviews.map((rv) => (
                                        <div key={rv.id} className="review-item">
                                            <div className="review-header">
                                                <span className="rating">{rv.rating} ★</span>
                                                <span className="restaurant-name">en {rv.restaurant_name}</span>
                                                <span className="user-name">por {rv.first_name}</span>
                                            </div>
                                            <p className="review-text">"{rv.comment}"</p>
                                            <button onClick={() => handleDeleteReview(rv.id)} className="btn-text danger">Eliminar</button>
                                        </div>
                                    ))}
                                </div>
                            ) : activeTab === 'companies' ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Empresa</th>
                                            <th>CIF</th>
                                            <th>Saldo Disponible</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map((c) => (
                                            <tr key={c.id}>
                                                <td>{c.name}</td>
                                                <td>{c.cif}</td>
                                                <td className="money">{c.available_balance?.toFixed(2)} €</td>
                                                <td>{c.plan_active ? <span className="badge active">Activa</span> : <span className="badge inactive">Inactiva</span>}</td>
                                                <td className="actions-cell">
                                                    <button onClick={() => handleAddBalance(c.id)} className="btn-mini" aria-label="Añadir saldo a la empresa">+ Saldo</button>
                                                    <button onClick={async () => { if (confirm('¿Eliminar contrato?')) await deleteCompany(c.id); fetchData('companies'); }} className="btn-mini danger" aria-label="Eliminar contrato de empresa">Cerrar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="reports-view">
                                    <h3>Reporte Global B2B</h3>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Empresa</th>
                                                <th>Total Usos de Subsidio</th>
                                                <th>Total Subsidiado (€)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((rp, idx) => (
                                                <tr key={idx}>
                                                    <td>{rp.company_name}</td>
                                                    <td>{rp.total_uses}</td>
                                                    <td className="money">{parseFloat(rp.total_subsidy).toFixed(2)} €</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <style jsx>{`
                .admin-container { display: flex; min-height: 100vh; background: #f8fafc; }
                .admin-sidebar { width: 260px; background: white; border-right: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; padding: 24px; position: fixed; height: 100vh; top: 0; left: 0; z-index: 10; }
                .admin-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; font-weight: 700; font-size: 1.2rem; color: var(--text-main); }
                .admin-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .admin-nav button { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; color: var(--text-dim); border-radius: 12px; cursor: pointer; font-weight: 600; text-align: left; transition: all 0.2s; }
                .admin-nav button:hover { background: var(--secondary); color: var(--text-main); }
                .admin-nav button.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); }
                
                .admin-logout { margin-top: auto; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 16px; }
                .logout-btn { width: 100%; padding: 12px; border: 1px solid #fee2e2; background: #fef2f2; color: #dc2626; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                .logout-btn:hover { background: #fee2e2; }

                .admin-content { flex: 1; margin-left: 260px; padding: 32px 48px; }
                .admin-header { margin-bottom: 32px; }
                .admin-header h1 { font-size: 2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }

                .admin-view-area { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 600px; border: 1px solid rgba(0,0,0,0.05); }

                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 16px; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #eee; }
                .admin-table td { padding: 16px; border-bottom: 1px solid #f9fafb; color: var(--text-main); font-size: 0.95rem; vertical-align: middle; }
                .admin-table tr:last-child td { border-bottom: none; }
                .admin-table tr:hover td { background: #fdfdfd; }

                .role-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; font-size: 0.9rem; color: var(--text-main); cursor: pointer; outline: none; }
                .role-select:focus { border-color: var(--primary); }

                .actions-cell { display: flex; gap: 8px; }
                .btn-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; background: #f3f4f6; color: var(--text-dim); cursor: pointer; transition: 0.2s; }
                .btn-icon:hover { background: #e5e7eb; color: var(--text-main); }
                .btn-icon.danger { background: #fef2f2; color: #ef4444; }
                .btn-icon.danger:hover { background: #fee2e2; color: #dc2626; }

                .grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
                .card-item { background: white; border: 1px solid #f3f4f6; border-radius: 16px; padding: 24px; transition: 0.3s; position: relative; overflow: hidden; }
                .card-item:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.05); transform: translateY(-4px); border-color: var(--primary); }
                .card-item.premium { border: 2px solid var(--primary); background: linear-gradient(to bottom right, #fffbeb, #fff); }
                
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
                .card-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
                .premium-icon { color: var(--primary); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
                
                .card-actions { margin-top: 16px; pt: 16px; border-top: 1px solid #f3f4f6; }
                .btn-outline { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-outline.success { border-color: var(--primary); color: #b45309; }
                .btn-outline.success:hover { background: var(--primary); color: white; }
                .btn-outline.danger { border-color: #ef4444; color: #ef4444; }
                .btn-outline.danger:hover { background: #ef4444; color: white; }

                .reviews-list { display: flex; flex-direction: column; gap: 16px; }
                .review-item { padding: 20px; border: 1px solid #f3f4f6; border-radius: 16px; background: #f9fafb; }
                .review-header { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; font-size: 0.9rem; }
                .rating { color: #f59e0b; font-weight: 700; }
                .restaurant-name { color: var(--text-muted); }
                .review-text { font-style: italic; color: var(--text-dim); margin-bottom: 12px; line-height: 1.5; }
                .btn-text { background: none; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; padding: 0; }
                .btn-text.danger { color: #ef4444; }
                .btn-text.danger:hover { text-decoration: underline; }

                .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .badge.active { background: #dcfce7; color: #166534; }
                .badge.inactive { background: #f3f4f6; color: #6b7280; }
                
                .money { font-family: monospace; font-weight: 600; color: var(--text-main); }
                .btn-mini { padding: 4px 8px; border-radius: 6px; border: 1px solid #e5e7eb; background: white; font-size: 0.8rem; cursor: pointer; margin-right: 4px; }
                .btn-mini:hover { background: #f9fafb; border-color: #d1d5db; }
                .btn-mini.danger { color: #ef4444; border-color: #fee2e2; }
                .btn-mini.danger:hover { background: #fef2f2; }

                .spinner, .loading-screen { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-weight: 500; }
                .loading-screen { height: 100vh; font-size: 1.2rem; }

                @media (max-width: 1024px) {
                    .admin-container { flex-direction: column; }
                    .admin-sidebar { width: 100%; height: auto; position: static; flex-direction: row; align-items: center; padding: 16px; border-right: none; border-bottom: 1px solid #eee; }
                    .admin-nav { flex-direction: row; overflow-x: auto; padding-bottom: 4px; }
                    .admin-nav button { white-space: nowrap; }
                    .admin-logo { margin-bottom: 0; margin-right: 24px; }
                    .admin-content { margin-left: 0; padding: 24px; }
                    .admin-logout { margin-top: 0; border-top: none; padding-top: 0; margin-left: auto; }
                }
            `}</style>
        </div>
    );
}
