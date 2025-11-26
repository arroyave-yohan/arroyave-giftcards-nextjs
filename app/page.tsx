export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-2xl w-full p-12 fade-in">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Arroyave Gift Cards
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Sistema de Gestión de Gift Cards Empresariales
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-6 stat-card">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="text-lg font-semibold mb-1">Gift Cards</h3>
              <p className="text-gray-400 text-sm">Gestiona tarjetas regalo corporativas</p>
            </div>

            <div className="glass-card p-6 stat-card">
              <div className="text-4xl mb-2">🏢</div>
              <h3 className="text-lg font-semibold mb-1">Empresas</h3>
              <p className="text-gray-400 text-sm">Administra cuentas empresariales</p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="/admin"
              className="btn btn-primary w-full block text-center"
            >
              Ir al Panel de Administración
            </a>

            <a
              href="/api/health"
              className="btn btn-secondary w-full block text-center"
            >
              Ver Estado de la API
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              API Version 2.0.0 • Powered by Next.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
