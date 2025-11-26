'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Company {
    companyName: string;
    balance: number;
    members: Array<{
        id: string;
        redemptionToken: string;
        redemptionCode: string;
    }>;
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Panel de Administración
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Gestión de Gift Cards Empresariales
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 mb-8 slide-in">
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

                {/* Companies Table */}
                <div className="glass-card p-6 fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Empresas Registradas</h2>
                        <Link href="/admin/companies" className="btn btn-primary">
                            Ver Todas →
                        </Link>
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
                                        <th>Empresa</th>
                                        <th>Balance</th>
                                        <th>Miembros</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.slice(0, 5).map((company, index) => (
                                        <tr key={index} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <td className="font-semibold">{company.companyName}</td>
                                            <td className="text-emerald-400 font-mono">
                                                {formatCurrency(company.balance)}
                                            </td>
                                            <td>
                                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">
                                                    {company.members.length} usuarios
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/companies?company=${encodeURIComponent(company.companyName)}`}
                                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    Ver Detalles →
                                                </Link>
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
                            <Link href="/admin/companies" className="btn btn-primary">
                                Crear Primera Empresa
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
