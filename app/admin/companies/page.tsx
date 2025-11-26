'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Member {
    id: string;
    redemptionToken: string;
    redemptionCode: string;
}

interface Company {
    companyName: string;
    balance: number;
    members: Member[];
}

function CompaniesContent() {
    const searchParams = useSearchParams();
    const selectedCompany = searchParams.get('company');

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            setCompanies(data.companies || []);
        } catch (error) {
            console.error('Error loading companies:', error);
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

    const filteredCompanies = companies.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const companyDetails = selectedCompany
        ? companies.find(c => c.companyName === selectedCompany)
        : null;

    return (
        <div className="min-h-screen p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 fade-in">
                    <Link href="/admin" className="btn btn-secondary mb-4 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Gestión de Empresas
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Administra empresas y sus miembros
                    </p>
                </div>

                {/* Search Bar */}
                <div className="glass-card p-6 mb-8 slide-in">
                    <input
                        type="text"
                        placeholder="Buscar empresa por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Company Details Modal */}
                {companyDetails && (
                    <div className="glass-card p-8 mb-8 fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold">{companyDetails.companyName}</h2>
                            <Link
                                href="/admin/companies"
                                className="btn btn-secondary"
                            >
                                Cerrar
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="glass-card p-6">
                                <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-2">
                                    Balance Disponible
                                </h3>
                                <p className="text-3xl font-bold text-emerald-400">
                                    {formatCurrency(companyDetails.balance)}
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-2">
                                    Total Miembros
                                </h3>
                                <p className="text-3xl font-bold text-purple-400">
                                    {companyDetails.members.length}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-4">Miembros</h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Email</th>
                                        <th>Token de Redención</th>
                                        <th>Código</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyDetails.members.map((member, index) => (
                                        <tr key={index}>
                                            <td className="font-mono text-gray-400">{index}</td>
                                            <td className="font-semibold">{member.id}</td>
                                            <td className="font-mono text-sm text-gray-400">
                                                {member.redemptionToken}
                                            </td>
                                            <td className="font-mono text-sm text-indigo-400">
                                                {member.redemptionCode}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Companies List */}
                <div className="glass-card p-6 fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">
                            Todas las Empresas ({filteredCompanies.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="skeleton h-16 w-full"></div>
                            ))}
                        </div>
                    ) : filteredCompanies.length > 0 ? (
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
                                    {filteredCompanies.map((company, index) => (
                                        <tr key={index} className="slide-in" style={{ animationDelay: `${index * 0.03}s` }}>
                                            <td className="font-semibold text-lg">{company.companyName}</td>
                                            <td className="text-emerald-400 font-mono text-lg">
                                                {formatCurrency(company.balance)}
                                            </td>
                                            <td>
                                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-semibold">
                                                    {company.members.length} usuarios
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/companies?company=${encodeURIComponent(company.companyName)}`}
                                                    className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                                                >
                                                    Ver Detalles →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-400 text-lg">
                                {searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay empresas registradas'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CompaniesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen p-6 md:p-12 flex items-center justify-center">
                <div className="glass-card p-12 text-center">
                    <div className="text-6xl mb-4 animate-pulse">⏳</div>
                    <p className="text-xl text-gray-400">Cargando empresas...</p>
                </div>
            </div>
        }>
            <CompaniesContent />
        </Suspense>
    );
}
