// Vercel Serverless Function — POST /api/admin/login
// Simple password-based auth that returns a session token

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ success: false, error: 'ADMIN_PASSWORD non configuré côté serveur.' });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Mot de passe incorrect.' });
  }

  // Create a simple token (HMAC of password + timestamp)
  const token = crypto
    .createHmac('sha256', adminPassword)
    .update(`fc27-admin-${Date.now()}`)
    .digest('hex');

  return res.status(200).json({ success: true, token });
};
