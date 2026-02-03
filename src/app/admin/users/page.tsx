'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllUsers, updateUserRole, handleLogout } from '../../auth/actions';
import {
    deleteUser, resetUserPassword, getAllReviews, deleteReview,
    getAllRestaurants, toggleRestaurantPremium, getAllCompanies,
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
        </div>
    );
}
