'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllUsers, updateUserRole, handleLogout } from '../../auth/actions';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('locame_role');
        if (role !== 'ADMIN') {
            router.push('/auth');
            return;
        }
        setIsAdmin(true);
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
            fetchUsers();
        } else {
            alert(result.error);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="admin-container">
            <aside className="admin-sidebar glass">
                <div className="sidebar-header">
                    <Image src="/logo.jpg" alt="LOCAME" width={120} height={120} className="sidebar-logo" />
                    <h2 className="brand-font">ADMIN PANEL</h2>
                </div>
                <nav className="admin-nav">
                    <button className="nav-item active">Usuarios</button>
                    <button className="nav-item" onClick={() => router.push('/search')}>Vista Cliente</button>
                    <button className="nav-item logout" disabled={isLoggingOut} onClick={async () => {
                        setIsLoggingOut(true);
                        localStorage.clear();
                        await handleLogout();
                    }}>{isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}</button>
                </nav>
            </aside>

            <main className="admin-content">
                <header className="content-header">
                    <h1>Gestión de Usuarios</h1>
                    <p>Control de accesos y roles de la plataforma</p>
                </header>

                <div className="table-wrapper glass">
                    {loading ? (
                        <div className="loading-state">Cargando usuarios...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nombre / Email</th>
                                    <th>Rol actual</th>
                                    <th>Fecha Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-name">{user.first_name} {user.last_name || ''}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                className="role-select"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="CLIENT">CLIENT</option>
                                                <option value="RESTAURANT">RESTAURANT</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <style jsx>{`
                .admin-container {
                    display: flex;
                    min-height: 100vh;
                    background: #f4f7f6;
                }

                .admin-sidebar {
                    width: 280px;
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--glass-border);
                    position: fixed;
                    height: 100vh;
                }

                .sidebar-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .sidebar-logo {
                    border-radius: 20px;
                    margin-bottom: 15px;
                }

                .admin-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .nav-item {
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-dim);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .nav-item:hover, .nav-item.active {
                    background: var(--primary);
                    color: black;
                }

                .nav-item.logout {
                    margin-top: auto;
                    color: #ef4444;
                }

                .admin-content {
                    flex: 1;
                    padding: 40px 60px;
                    margin-left: 280px;
                }

                .content-header {
                    margin-bottom: 32px;
                }

                .content-header h1 {
                    font-size: 2.5rem;
                    font-family: 'Anton', sans-serif;
                }

                .table-wrapper {
                    border-radius: 24px;
                    overflow: hidden;
                }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .admin-table th {
                    padding: 20px;
                    background: rgba(0,0,0,0.02);
                    font-weight: 700;
                    color: var(--text-dim);
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 0.05em;
                }

                .admin-table td {
                    padding: 20px;
                    border-top: 1px solid var(--glass-border);
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                }

                .user-name {
                    font-weight: 700;
                    color: var(--text-main);
                }

                .user-email {
                    font-size: 0.85rem;
                    color: var(--text-dim);
                }

                .role-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 800;
                }

                .role-badge.client { background: #dcfce7; color: #166534; }
                .role-badge.restaurant { background: #fef9c3; color: #854d0e; }
                .role-badge.admin { background: #fee2e2; color: #991b1b; }

                .role-select {
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                    background: white;
                    cursor: pointer;
                }

                .loading-state {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-dim);
                }

                @media (max-width: 1024px) {
                    .admin-sidebar { width: 80px; padding: 20px 10px; }
                    .sidebar-header h2, .nav-item span { display: none; }
                    .admin-content { margin-left: 80px; padding: 20px; }
                }
            `}</style>
        </div>
    );
}
