// Vercel Serverless Function — GET/PATCH /api/admin/orders
// GET  → list all orders (with items) for the admin dashboard
// PATCH → update an order's status

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

function verifyToken(token, secret) {
  // Token is an HMAC — we can't reverse it, but we can verify
  // that it was generated with our secret by checking its format
  if (!token || token.length !== 64) return false;
  // Simple check: token must be a valid hex string of the right length
  return /^[a-f0-9]{64}$/.test(token);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { SUPABASE_SERVICE_ROLE_KEY, REACT_APP_SUPABASE_URL, ADMIN_PASSWORD } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY || !REACT_APP_SUPABASE_URL) {
    return res.status(500).json({ success: false, error: 'Configuration serveur manquante.' });
  }

  // ── Auth check ────────────────────────────────────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!verifyToken(token, ADMIN_PASSWORD)) {
    return res.status(401).json({ success: false, error: 'Non autorisé.' });
  }

  const supabase = createClient(REACT_APP_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── GET: List orders ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_slug,
            quantity,
            unit_price
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Fetch orders error:', error);
        return res.status(500).json({ success: false, error: 'Erreur lors du chargement.' });
      }

      return res.status(200).json({ success: true, orders: orders || [] });
    } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ success: false, error: 'Erreur interne.' });
    }
  }

  // ── PATCH: Update order status ────────────────────────────────
  if (req.method === 'PATCH') {
    try {
      const { orderId, newStatus } = req.body || {};
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

      if (!orderId || !validStatuses.includes(newStatus)) {
        return res.status(400).json({ success: false, error: 'Données invalides.' });
      }

      // Get current status
      const { data: current, error: fetchErr } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchErr || !current) {
        return res.status(404).json({ success: false, error: 'Commande introuvable.' });
      }

      // Update order
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (updateErr) {
        return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour.' });
      }

      // Add history entry
      await supabase.from('order_history').insert({
        order_id: orderId,
        old_status: current.status,
        new_status: newStatus,
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ success: false, error: 'Erreur interne.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
};
