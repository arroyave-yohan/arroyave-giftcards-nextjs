'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Member {
    id: string;
    redemptionToken: string;
    redemptionCode: string;
}

interface Company {
    id: string;
    companyName: string;
    balance: number;
    members: Member[];
}

interface Stats {
    totalCompanies: number;
    totalBalance: number;
    totalMembers: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalCompanies: 0,
        totalBalance: 0,
        totalMembers: 0,
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [showCreateCompany, setShowCreateCompany] = useState(false);
    const [showCreateMember, setShowCreateMember] = useState<string | null>(null);
    const [newCompany, setNewCompany] = useState({ companyName: '', balance: 0 });
    const [newMember, setNewMember] = useState({ userId: '', redemptionToken: '', redemptionCode: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();

            setStats({
                totalCompanies: data.totalCompanies || 0,
                totalBalance: data.totalBalance || 0,
                totalMembers: data.totalMembers || 0,
            });
            setCompanies(data.companies || []);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        try {
            const response = await fetch('/api/admin/companies');
            const data = await response.json();
            setCompanies(data);
            loadData(); // Reload stats
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompany),
            });

            if (response.ok) {
                setShowCreateCompany(false);
                setNewCompany({ companyName: '', balance: 0 });
                await loadCompanies();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al crear empresa');
            }
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Error al crear empresa');
        }
    };

    const handleUpdateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCompany) return;

        try {
            const response = await fetch(`/api/admin/companies/${editingCompany.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: editingCompany.companyName,
                    balance: editingCompany.balance,
                }),
            });

            if (response.ok) {
                setEditingCompany(null);
                await loadCompanies();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al actualizar empresa');
            }
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Error al actualizar empresa');
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta empresa?')) return;

        try {
            const response = await fetch(`/api/admin/companies/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadCompanies();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar empresa');
            }
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Error al eliminar empresa');
        }
    };

    const handleCreateMember = async (companyId: string, e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/companies/${companyId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember),
            });

            if (response.ok) {
                setShowCreateMember(null);
                setNewMember({ userId: '', redemptionToken: '', redemptionCode: '' });
                await loadCompanies();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al crear usuario');
            }
        } catch (error) {
            console.error('Error creating member:', error);
            alert('Error al crear usuario');
        }
    };

    const handleUpdateMember = async (companyId: string, userId: string, member: Member) => {
        try {
            const newUserId = prompt('Nuevo email:', userId);
            if (!newUserId) return;

            const redemptionToken = prompt('Token de redención:', member.redemptionToken) || member.redemptionToken;
            const redemptionCode = prompt('Código de redención:', member.redemptionCode) || member.redemptionCode;

            const response = await fetch(`/api/admin/companies/${companyId}/members`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    newUserId,
                    redemptionToken,
                    redemptionCode,
                }),
            });

            if (response.ok) {
                await loadCompanies();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al actualizar usuario');
            }
        } catch (error) {
            console.error('Error updating member:', error);
            alert('Error al actualizar usuario');
        }
    };

    const handleDeleteMember = async (companyId: string, userId: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            const response = await fetch(`/api/admin/companies/${companyId}/members?userId=${encodeURIComponent(userId)}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadCompanies();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Error al eliminar usuario');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        Panel de Administración
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Gestión de Gift Cards Empresariales
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap gap-4 mb-8 slide-in">
                    <Link href="/" className="btn btn-secondary">
                        ← Inicio
                    </Link>
                    <Link href="/admin/companies" className="btn btn-secondary">
                        Empresas
                    </Link>
                    <Link href="/admin/giftcards" className="btn btn-secondary">
                        Gift Cards
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-6 stat-card slide-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold">
                                Total Empresas
                            </h3>
                            <span className="text-3xl">🏢</span>
                        </div>
                        {loading ? (
                            <div className="skeleton h-10 w-20"></div>
                        ) : (
                            <p className="text-4xl font-bold text-indigo-400">
                                {stats.totalCompanies}
                            </p>
                        )}
                    </div>

                    <div className="glass-card p-6 stat-card slide-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold">
                                Balance Total
                            </h3>
                            <span className="text-3xl">💰</span>
                        </div>
                        {loading ? (
                            <div className="skeleton h-10 w-32"></div>
                        ) : (
                            <p className="text-4xl font-bold text-emerald-400">
                                {formatCurrency(stats.totalBalance)}
                            </p>
                        )}
                    </div>

                    <div className="glass-card p-6 stat-card slide-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold">
                                Total Usuarios
                            </h3>
                            <span className="text-3xl">👥</span>
                        </div>
                        {loading ? (
                            <div className="skeleton h-10 w-20"></div>
                        ) : (
                            <p className="text-4xl font-bold text-purple-400">
                                {stats.totalMembers}
                            </p>
                        )}
                    </div>
                </div>

                {/* Create Company Form */}
                {showCreateCompany && (
                    <div className="glass-card p-6 mb-8 fade-in">
                        <h2 className="text-2xl font-bold mb-4">Crear Nueva Empresa</h2>
                        <form onSubmit={handleCreateCompany} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">
                                    Nombre de la Empresa
                                </label>
                                <input
                                    type="text"
                                    value={newCompany.companyName}
                                    onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">
                                    Balance Inicial
                                </label>
                                <input
                                    type="number"
                                    value={newCompany.balance}
                                    onChange={(e) => setNewCompany({ ...newCompany, balance: parseFloat(e.target.value) || 0 })}
                                    className="input-field"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="btn btn-primary">
                                    Crear Empresa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateCompany(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Companies Table */}
                <div className="glass-card p-8 fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Empresas Registradas</h2>
                        <div className="flex gap-4">
                            {!showCreateCompany && (
                                <button
                                    onClick={() => setShowCreateCompany(true)}
                                    className="btn btn-primary"
                                >
                                    + Crear Empresa
                                </button>
                            )}
                            <Link href="/admin/companies" className="btn btn-secondary">
                                Ver Todas →
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <div className="skeleton h-12 w-full"></div>
                            <div className="skeleton h-12 w-full"></div>
                            <div className="skeleton h-12 w-full"></div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Empresa</th>
                                        <th>Balance</th>
                                        <th>Miembros</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.slice(0, 10).map((company, index) => (
                                        <tr key={company.id} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <td className="font-mono text-sm text-gray-400">{company.id}</td>
                                            <td className="font-semibold">
                                                {editingCompany?.id === company.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingCompany.companyName}
                                                        onChange={(e) => setEditingCompany({ ...editingCompany, companyName: e.target.value })}
                                                        className="input-field"
                                                        style={{ width: '200px' }}
                                                    />
                                                ) : (
                                                    company.companyName
                                                )}
                                            </td>
                                            <td>
                                                {editingCompany?.id === company.id ? (
                                                    <input
                                                        type="number"
                                                        value={editingCompany.balance}
                                                        onChange={(e) => setEditingCompany({ ...editingCompany, balance: parseFloat(e.target.value) || 0 })}
                                                        className="input-field"
                                                        style={{ width: '150px' }}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                ) : (
                                                    <span className="text-emerald-400 font-mono">
                                                        {formatCurrency(company.balance)}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">
                                                    {company.members.length} usuarios
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {editingCompany?.id === company.id ? (
                                                        <>
                                                            <button
                                                                onClick={handleUpdateCompany}
                                                                className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                                                            >
                                                                ✓ Guardar
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingCompany(null)}
                                                                className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
                                                            >
                                                                ✗ Cancelar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingCompany(company)}
                                                                className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                                                            >
                                                                ✏️ Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCompany(company.id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors text-sm"
                                                            >
                                                                🗑️ Eliminar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && companies.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg mb-4">No hay empresas registradas</p>
                            <button
                                onClick={() => setShowCreateCompany(true)}
                                className="btn btn-primary"
                            >
                                Crear Primera Empresa
                            </button>
                        </div>
                    )}
                </div>

                {/* Members Management */}
                {companies.slice(0, 5).map((company) => (
                    <div key={company.id} className="glass-card p-8 mt-8 fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">
                                Usuarios de {company.companyName}
                            </h2>
                            {showCreateMember !== company.id && (
                                <button
                                    onClick={() => setShowCreateMember(company.id)}
                                    className="btn btn-primary"
                                >
                                    + Agregar Usuario
                                </button>
                            )}
                        </div>

                        {showCreateMember === company.id && (
                            <div className="mb-6 p-4 bg-indigo-500/10 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Nuevo Usuario</h3>
                                <form onSubmit={(e) => handleCreateMember(company.id, e)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={newMember.userId}
                                            onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                                            Token de Redención (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={newMember.redemptionToken}
                                            onChange={(e) => setNewMember({ ...newMember, redemptionToken: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                                            Código de Redención (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={newMember.redemptionCode}
                                            onChange={(e) => setNewMember({ ...newMember, redemptionCode: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="btn btn-primary">
                                            Crear Usuario
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateMember(null)}
                                            className="btn btn-secondary"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Token</th>
                                        <th>Código</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {company.members.map((member, index) => (
                                        <tr key={index}>
                                            <td className="font-semibold">{member.id}</td>
                                            <td className="font-mono text-sm text-gray-400">{member.redemptionToken}</td>
                                            <td className="font-mono text-sm text-indigo-400">{member.redemptionCode}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateMember(company.id, member.id, member)}
                                                        className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(company.id, member.id)}
                                                        className="text-red-400 hover:text-red-300 transition-colors text-sm"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
