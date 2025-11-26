'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
    id: string;
    provider: string;
    balance: number;
    _self: {
        href: string;
    };
}

export default function GiftCardsPage() {
    const [email, setEmail] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearchResult(null);

        try {
            const response = await fetch('/api/giftcards/_search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client: {
                        email: email,
                    },
                }),
            });

            const data = await response.json();
            setSearchResult(data);

            if (!data || data.length === 0) {
                setError('No se encontró ninguna gift card para este email');
            }
        } catch (err) {
            setError('Error al buscar la gift card');
            console.error(err);
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 fade-in">
                    <Link href="/admin" className="btn btn-secondary mb-4 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Búsqueda de Gift Cards
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Busca gift cards por email de usuario
                    </p>
                </div>

                {/* Search Form */}
                <div className="glass-card p-8 mb-8 slide-in">
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-300">
                                Email del Usuario
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Buscando...
                                </span>
                            ) : (
                                '🔍 Buscar Gift Card'
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="glass-card p-6 mb-8 border-red-500/50 bg-red-500/10 fade-in">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                                <p className="text-gray-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {searchResult && searchResult.length > 0 && (
                    <div className="glass-card p-8 fade-in">
                        <h2 className="text-2xl font-bold mb-6">Resultados de la Búsqueda</h2>

                        {searchResult.map((card, index) => (
                            <div key={index} className="mb-6 last:mb-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="glass-card p-6 stat-card">
                                        <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-2">
                                            Balance Disponible
                                        </h3>
                                        <p className="text-4xl font-bold text-emerald-400">
                                            {formatCurrency(card.balance)}
                                        </p>
                                    </div>

                                    <div className="glass-card p-6 stat-card">
                                        <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-2">
                                            Card ID
                                        </h3>
                                        <p className="text-lg font-mono text-indigo-400 break-all">
                                            {card.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="glass-card p-6 bg-indigo-500/10 border-indigo-500/30">
                                    <h3 className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-2">
                                        Proveedor
                                    </h3>
                                    <p className="text-lg font-semibold text-indigo-400">
                                        {card.provider}
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <a
                                        href={card._self.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary w-full text-center"
                                    >
                                        Ver Detalles Completos →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <div className="glass-card p-6 mt-8 slide-in">
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">💡</span>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Información</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Ingresa el email de un usuario registrado para buscar su gift card asociada.
                                El sistema buscará en todas las empresas registradas y mostrará el balance disponible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
