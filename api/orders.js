// Vercel Serverless Function — POST /api/orders
// Creates a new order in Supabase using the service_role key (server-only)

const { createClient } = require('@supabase/supabase-js');

const VALID_SLUGS = [
  'fc27-ps5', 'fc27-ps5-arabe', 'fc27-ps4', 'fc27-ps4-arabe',
  'fc27-xbox-one-series-x', 'fc27-switch', 'fc27-switch-2', 'fc27-pc-ea-app',
];

const PRICES = {
  'fc27-ps5': 270000,
  'fc27-ps5-arabe': 279000,
  'fc27-ps4': 270000,
  'fc27-ps4-arabe': 279000,
  'fc27-xbox-one-series-x': 260000,
  'fc27-switch': 249000,
  'fc27-switch-2': 270000,
  'fc27-pc-ea-app': 260000,
};

const DELIVERY = 8000; // 8.000 DT in millimes

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
  }

  const { SUPABASE_SERVICE_ROLE_KEY, REACT_APP_SUPABASE_URL } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY || !REACT_APP_SUPABASE_URL) {
    return res.status(500).json({ success: false, error: 'Configuration serveur manquante.' });
  }

  const supabase = createClient(REACT_APP_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { name, phone, governorate, address, note, productSlug, quantity } = req.body || {};

    // ── Validation ──────────────────────────────────────────────
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Le nom est requis.' });
    }
    const cleanPhone = (phone || '').replace(/\s/g, '');
    if (!/^\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Le numéro doit contenir exactement 8 chiffres.' });
    }
    if (!governorate || !governorate.trim()) {
      return res.status(400).json({ success: false, error: 'Le gouvernorat est requis.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: "L'adresse est requise." });
    }
    if (!VALID_SLUGS.includes(productSlug)) {
      return res.status(400).json({ success: false, error: 'Produit non reconnu.' });
    }
    const qty = Math.min(20, Math.max(1, Number(quantity) || 1));

    // ── Compute totals ──────────────────────────────────────────
    const unitPrice = PRICES[productSlug];
    const subtotal = unitPrice * qty;
    const total = subtotal + DELIVERY;
    const reference = `FC27-${Date.now().toString().slice(-6)}`;

    // ── Insert order ────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        reference,
        customer_name: name.trim(),
        phone: `+216${cleanPhone}`,
        governorate: governorate.trim(),
        address: address.trim(),
        note: (note || '').trim(),
        status: 'pending',
        total,
      })
      .select('id, reference')
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return res.status(500).json({ success: false, error: 'Erreur lors de la création de la commande.' });
    }

    // ── Insert order item ───────────────────────────────────────
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_slug: productSlug,
        quantity: qty,
        unit_price: unitPrice,
      });

    if (itemError) {
      console.error('Order item insert error:', itemError);
    }

    // ── Insert initial history entry ────────────────────────────
    const { error: historyError } = await supabase
      .from('order_history')
      .insert({
        order_id: order.id,
        old_status: null,
        new_status: 'pending',
      });

    if (historyError) {
      console.error('Order history insert error:', historyError);
    }

    return res.status(201).json({
      success: true,
      reference: order.reference,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
};
