import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = {
  all: 'Toutes',
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const formatPrice = (millimes) => `${(millimes / 1000).toFixed(3)} DT`;
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ── Login Screen ──────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('Veuillez entrer le mot de passe.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Échec de la connexion.'); setLoading(false); return; }
      sessionStorage.setItem('fc27_admin_token', data.token);
      onLogin(data.token);
    } catch {
      setError('Erreur réseau. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand-mark">FC<span>27</span></div>
        <div className="login-subtitle">TABLEAU DE BORD ADMIN</div>
        <label>MOT DE PASSE</label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Entrez le mot de passe admin"
          autoFocus
        />
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter →'}
        </button>
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
function Dashboard({ token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setLastRefresh(new Date());
      } else if (res.status === 401) {
        onLogout();
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const confirmed = orders.filter((o) => o.status === 'confirmed').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    return { total, pending, confirmed, revenue };
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    STATUSES.forEach((s) => {
      if (s !== 'all') counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="admin-loading">
          <div className="loading-spinner" />
          <p>Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="brand-mark">FC<span>27</span></div>
          <span className="admin-badge">ADMIN</span>
        </div>
        <div className="admin-header-right">
          <div className="auto-refresh-indicator">
            <span className="auto-refresh-dot" />
            Auto-refresh 30s
          </div>
          <button className="refresh-btn" onClick={fetchOrders}>
            ↻ Actualiser
          </button>
          <Link to="/" className="back-link">← Storefront</Link>
          <button className="logout-btn" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">COMMANDES TOTALES</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">EN ATTENTE</div>
            <div className="stat-value gold">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CONFIRMÉES</div>
            <div className="stat-value blue">{stats.confirmed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">REVENU ESTIMÉ</div>
            <div className="stat-value">{formatPrice(stats.revenue)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABELS[s]}
              <span className="filter-count">{statusCounts[s]}</span>
            </button>
          ))}
          {lastRefresh && (
            <span style={{ marginLeft: 'auto', color: '#4b5563', fontSize: 10 }}>
              Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-TN')}
            </span>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>Aucune commande {filter !== 'all' ? `avec le statut "${STATUS_LABELS[filter]}"` : 'pour le moment'}.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Gouvernorat</th>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const item = order.order_items?.[0];
                  return (
                    <tr key={order.id}>
                      <td className="ref-cell">{order.reference}</td>
                      <td className="customer-cell">{order.customer_name}</td>
                      <td className="phone-cell">{order.phone}</td>
                      <td>{order.governorate}</td>
                      <td className="product-cell">{item?.product_slug?.replace('fc27-', '').toUpperCase() || '—'}</td>
                      <td>{item?.quantity || 1}</td>
                      <td className="price-cell">{formatPrice(order.total)}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {STATUSES.filter((s) => s !== 'all').map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="date-cell">{formatDate(order.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Admin Component ──────────────────────────────────── */
export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('fc27_admin_token'));

  const handleLogin = (newToken) => setToken(newToken);
  const handleLogout = () => {
    sessionStorage.removeItem('fc27_admin_token');
    setToken(null);
  };

  if (!token) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard token={token} onLogout={handleLogout} />;
}
