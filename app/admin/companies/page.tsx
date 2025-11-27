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
    id: string;
    companyName: string;
    balance: number;
    members: Member[];
}

interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'purchase' | 'recharge';
    userId: string;
    companyId: string;
    cardId?: string;
}

function CompaniesContent() {
    const searchParams = useSearchParams();
    const selectedCompany = searchParams.get('company');

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeUserId, setRechargeUserId] = useState('');
    const [recharging, setRecharging] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany && companies.length > 0) {
            const company = companies.find(c => c.companyName === selectedCompany);
            if (company) {
                loadTransactions(company.id);
            }
        } else {
            setTransactions([]);
        }
    }, [selectedCompany, companies]);

    const loadCompanies = async () => {
        try {
            const response = await fetch('/api/admin/companies');
            const data = await response.json();
            setCompanies(data);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async (companyId: string, e: React.FormEvent) => {
        e.preventDefault();
        setRecharging(true);

        try {
            const amount = parseFloat(rechargeAmount);
            if (isNaN(amount) || amount <= 0) {
                alert('Por favor ingresa un monto válido mayor a 0');
                setRecharging(false);
                return;
            }

            const response = await fetch(`/api/admin/companies/${companyId}/recharge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    userId: rechargeUserId || 'admin',
                }),
            });

            if (response.ok) {
                setRechargeAmount('');
                setRechargeUserId('');
                await loadCompanies();
                if (companyDetails) {
                    await loadTransactions(companyDetails.id);
                }
                alert('Saldo cargado exitosamente');
            } else {
                const error = await response.json();
                alert(error.error || 'Error al cargar saldo');
            }
        } catch (error) {
            console.error('Error recharging:', error);
            alert('Error al cargar saldo');
        } finally {
            setRecharging(false);
        }
    };

    const loadTransactions = async (companyId: string) => {
        setLoadingTransactions(true);
        try {
            const response = await fetch(`/api/admin/companies/${companyId}/transactions`);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getTransactionTypeInfo = (type: string) => {
        switch (type) {
            case 'recharge':
                return {
                    label: '💳 Carga',
                    className: 'bg-emerald-500/20 text-emerald-400'
                };
            case 'purchase':
                return {
                    label: '🛒 Compra',
                    className: 'bg-orange-500/20 text-orange-400'
                };
            case 'settlement':
                return {
                    label: '✅ Settlement',
                    className: 'bg-blue-500/20 text-blue-400'
                };
            case 'cancelation':
                return {
                    label: '❌ Cancelación',
                    className: 'bg-red-500/20 text-red-400'
                };
            case 'refund':
                return {
                    label: '💰 Reembolso',
                    className: 'bg-emerald-500/20 text-emerald-400'
                };
            default:
                return {
                    label: '📋 ' + type,
                    className: 'bg-gray-500/20 text-gray-400'
                };
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const companyDetails = selectedCompany
        ? companies.find(c => c.companyName === selectedCompany)
        : null;

    return (
        <div className="min-h-screen p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 fade-in">
                    <Link href="/admin" className="btn btn-secondary mb-6 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
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
                        <div className="flex items-center justify-between mb-8">
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

                        {/* Recharge Form */}
                        <div className="glass-card p-6 mb-8 bg-indigo-500/10">
                            <h3 className="text-xl font-bold mb-4">Cargar Saldo</h3>
                            <form onSubmit={(e) => handleRecharge(companyDetails.id, e)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                                        Monto a Cargar
                                    </label>
                                    <input
                                        type="number"
                                        value={rechargeAmount}
                                        onChange={(e) => setRechargeAmount(e.target.value)}
                                        className="input-field"
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                                        Usuario (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={rechargeUserId}
                                        onChange={(e) => setRechargeUserId(e.target.value)}
                                        className="input-field"
                                        placeholder="admin (por defecto)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={recharging}
                                    className="btn btn-primary"
                                >
                                    {recharging ? 'Cargando...' : '💳 Cargar Saldo'}
                                </button>
                            </form>
                        </div>

                        <h3 className="text-xl font-bold mb-4">Miembros</h3>
                        <div className="table-container mb-8">
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
                                            <td className="font-mono text-gray-400">{index + 1}</td>
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

                        {/* Transactions Section */}
                        <h3 className="text-xl font-bold mb-4">Transacciones</h3>
                        {loadingTransactions ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="skeleton h-12 w-full"></div>
                                ))}
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Monto</th>
                                            <th>Usuario</th>
                                            <th>ID Transacción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="text-sm text-gray-400">
                                                    {formatDate(transaction.date)}
                                                </td>
                                                <td>
                                                    {(() => {
                                                        const typeInfo = getTransactionTypeInfo(transaction.type);
                                                        return (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${typeInfo.className}`}>
                                                                {typeInfo.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className={`font-mono font-semibold ${
                                                    transaction.amount > 0 ? 'text-emerald-400' : 'text-orange-400'
                                                }`}>
                                                    {formatCurrency(Math.abs(transaction.amount))}
                                                </td>
                                                <td className="text-sm">{transaction.userId}</td>
                                                <td className="font-mono text-xs text-gray-400">
                                                    {transaction.id.substring(0, 8)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 glass-card p-6">
                                <div className="text-4xl mb-4">📊</div>
                                <p className="text-gray-400">No hay transacciones registradas para esta empresa</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Companies List */}
                <div className="glass-card p-8 fade-in">
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
                                        <th>ID</th>
                                        <th>Empresa</th>
                                        <th>Balance</th>
                                        <th>Miembros</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map((company, index) => (
                                        <tr key={company.id} className="slide-in" style={{ animationDelay: `${index * 0.03}s` }}>
                                            <td className="font-mono text-sm text-gray-400">{company.id}</td>
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
            <div className="min-h-screen p-8 md:p-12 lg:p-16 flex items-center justify-center">
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
