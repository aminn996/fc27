import { useMemo, useState } from 'react';
import './App.css';

const governorates = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Djerba', 'Gabès', 'Gafsa',
  'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
  'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
  'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
  'Zarzis',
];

const products = [
  { slug: 'fc27-ps5', label: 'PS5', name: 'EA SPORTS FC 27 PS5', price: 270000, format: 'Disque physique', image: '/ps5.jpg', accent: 'PS5' },
  { slug: 'fc27-ps5-arabe', label: 'PS5 Arabe', name: 'EA SPORTS FC 27 PS5 Arabe', price: 279000, format: 'Disque physique', image: '/ps5.jpg', accent: 'AR' },
  { slug: 'fc27-ps4', label: 'PS4', name: 'EA SPORTS FC 27 PS4', price: 270000, format: 'Disque physique', image: '/ps4.jpg', accent: 'PS4' },
  { slug: 'fc27-ps4-arabe', label: 'PS4 Arabe', name: 'EA SPORTS FC 27 PS4 Arabe', price: 279000, format: 'Disque physique', image: '/ps4.jpg', accent: 'AR' },
  { slug: 'fc27-xbox-one-series-x', label: 'Xbox One / Series X', name: 'EA SPORTS FC 27 Xbox One / Xbox Series X', price: 260000, format: 'Disque physique', image: '/xbox.jpg', accent: 'XBOX' },
  { slug: 'fc27-switch', label: 'Nintendo Switch', name: 'EA SPORTS FC 27 Nintendo Switch', price: 249000, format: 'Cartouche physique', image: '/switch1.jpg', accent: 'SWITCH' },
  { slug: 'fc27-switch-2', label: 'Nintendo Switch 2', name: 'EA SPORTS FC 27 Nintendo Switch 2', price: 270000, format: 'Cartouche physique', image: '/switvh2.jpg', accent: 'SWITCH 2' },
  { slug: 'fc27-pc-ea-app', label: 'PC — Code EA app', name: 'EA SPORTS FC 27 PC — EA app', price: 260000, format: 'Code numérique', image: '/pc.jpg', accent: 'PC' },
];

const faqs = [
  ['Quelle version de FC 27 choisir pour ma plateforme ?', 'Choisissez CD EA SPORTS FC 27 pour PS5, PS4, Xbox One / Xbox Series X, PC EA app, Nintendo Switch ou Nintendo Switch 2. Les versions physiques nécessitent un lecteur de disque ou de cartouche compatible. Sur PS4 et PS5, les versions identifiées « Arabe » proposent les menus et les commentaires en arabe.'],
  ['Quel est le prix de FC 27 en Tunisie et comment vérifier sa disponibilité ?', 'Consultez le prix affiché pour chaque version de FC 27. GameZone confirme la disponibilité, les frais de livraison et le montant total avant votre validation finale.'],
  ['Livrez-vous FC 27 partout en Tunisie ?', 'Oui, GameZone propose la livraison à domicile de vos jeux EA SPORTS FC 27 dans toute la Tunisie. Les frais de livraison sont précisés avant la confirmation de votre commande. La version PC est un code d’activation numérique pour l’application EA.'],
];

const formatPrice = (millimes) => `${(millimes / 1000).toFixed(3)} DT`;
const DELIVERY_MILLIMES = 8000;

function App() {
  const [selectedSlug, setSelectedSlug] = useState(products[0].slug);
  const [quantity, setQuantity] = useState(1);
  const [faqOpen, setFaqOpen] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', governorate: '', address: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const selected = products.find((product) => product.slug === selectedSlug) || products[0];
  const subtotal = useMemo(() => selected.price * quantity, [selected.price, quantity]);
  const total = subtotal + DELIVERY_MILLIMES;

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const chooseProduct = (slug) => {
    setSelectedSlug(slug);
    setError('');
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    const phone = form.phone.replace(/\s/g, '');
    if (!form.name.trim() || !phone || !form.governorate || !form.address.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!/^\d{8}$/.test(phone)) {
      setError('Le numéro doit contenir exactement 8 chiffres après +216.');
      return;
    }
    setError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone, productSlug: selected.slug, quantity }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Le service de commande est indisponible. Vérifiez que l’API /api/orders est bien déployée.');
      }
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'La demande n’a pas pu être envoyée.');
      }
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message || 'La demande n’a pas pu être envoyée. Réessayez dans un instant.');
    }
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="FC27.TN par GameZone">
          <span className="brand-mark">FC<span>27</span></span>
          <span className="brand-caption">.TN <i>PAR GAMEZONE</i></span>
        </a>
        <nav className="main-nav" aria-label="Navigation principale">
          <a href="#versions">Versions</a>
          <a href="#faq">FAQ</a>
          <a className="gamezone-link" href="https://gamezone.tn/" target="_blank" rel="noreferrer">gamezone.tn ↗</a>
        </nav>
        <a className="mobile-menu" href="#versions" aria-label="Aller aux versions">☰</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <h1>Acheter EA SPORTS FC 27 en Tunisie</h1>
            <p className="hero-description">Préparez votre prochaine saison avec EA SPORTS FC 27. Choisissez votre version et envoyez-nous votre demande en quelques secondes.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-logo" aria-hidden="true">
              <span>FC<span>27</span></span><small>.TN</small>
            </div>
          </div>
        </section>

        <div className="content-grid" id="versions">
          <section className="catalog-panel">
            <div className="section-intro">
              <span className="section-number">01</span>
              <div><p className="eyebrow">CHOISISSEZ VOTRE PLATEFORME</p><h2>Votre prochaine saison.</h2></div>
            </div>
            <p className="section-lead">Sélectionnez votre version pour préparer votre demande.</p>
            <div className="product-grid">
              {products.map((product) => (
                <button className={`product-card ${selectedSlug === product.slug ? 'is-selected' : ''}`} key={product.slug} onClick={() => chooseProduct(product.slug)} type="button" aria-pressed={selectedSlug === product.slug}>
                  <span className="selected-check">{selectedSlug === product.slug ? '✓' : ''}</span>
                  <span className="product-image"><img src={product.image} alt={product.name} /><span className="image-accent">{product.accent}</span></span>
                  <span className="product-info"><strong>{product.label}</strong><small>{product.format}</small><b>{formatPrice(product.price)}</b></span>
                </button>
              ))}
            </div>
          </section>

          <section className="checkout-panel" aria-labelledby="checkout-title">
            <div className="section-intro light">
              <span className="section-number">02</span>
              <div><p className="eyebrow">À VOUS DE JOUER</p><h2 id="checkout-title">Préparez votre demande</h2></div>
            </div>
            {submitted ? (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <p className="eyebrow">DEMANDE ENREGISTRÉE</p>
                <h3>Votre demande a bien été envoyée !</h3>
                <p>GameZone vous contactera pour confirmer la disponibilité, les frais de livraison et le montant total de votre commande.</p>
                <span className="reference">Référence : <b>FC27-{Date.now().toString().slice(-6)}</b></span>
                <button type="button" className="secondary-button" onClick={() => setSubmitted(false)}>Nouvelle demande</button>
              </div>
            ) : (
              <form className="order-form" onSubmit={submitOrder}>
                <div className="summary-card"><img src={selected.image} alt="" /><div><small>VOTRE SÉLECTION</small><strong>{selected.label}</strong><span>{selected.format}</span></div><b>{formatPrice(subtotal)}</b></div>
                <div className="form-row"><label>Nom et prénom<input name="name" value={form.name} onChange={updateForm} placeholder="Votre nom complet" autoComplete="name" /></label><label>Téléphone tunisien<div className="phone-field"><span>+216</span><input name="phone" value={form.phone} onChange={updateForm} placeholder="12 345 678" inputMode="numeric" autoComplete="tel" /></div></label></div>
                <div className="form-row"><label>Gouvernorat<select name="governorate" value={form.governorate} onChange={updateForm}><option value="">Sélectionner</option>{governorates.map((place) => <option key={place}>{place}</option>)}</select></label><label>Quantité<div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Diminuer la quantité">−</button><input value={quantity} onChange={(event) => setQuantity(Math.min(20, Math.max(1, Number(event.target.value) || 1)))} aria-label="Quantité" inputMode="numeric" /><button type="button" onClick={() => setQuantity(Math.min(20, quantity + 1))} aria-label="Augmenter la quantité">+</button></div></label></div>
                <label>Adresse complète<textarea name="address" value={form.address} onChange={updateForm} placeholder="Rue, numéro, ville et code postal" rows="2" /></label>
                <label>Note complémentaire <span className="optional">(optionnel)</span><textarea name="note" value={form.note} onChange={updateForm} placeholder="Une précision pour GameZone ?" rows="2" /></label>
                <div className="price-breakdown"><div><span>Sous-total</span><b>{formatPrice(subtotal)}</b></div><div><span>Livraison</span><b>{formatPrice(DELIVERY_MILLIMES)}</b></div><div className="total-line"><span>Total estimé</span><strong>{formatPrice(total)}</strong></div></div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="submit-button" type="submit">Commander <span>→</span></button>
                <p className="form-footnote">Sans compte · Sans paiement bancaire<br /><span>Livraison nationale : 8.000 DT. Le total sera confirmé par GameZone avant validation finale.</span></p>
              </form>
            )}
          </section>
        </div>

        <section className="faq-section" id="faq">
          <div className="section-intro"><span className="section-number">03</span><div><p className="eyebrow">BESOIN D'EN SAVOIR PLUS ?</p><h2>Questions fréquentes.</h2></div></div>
          <div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${faqOpen === index ? 'open' : ''}`} key={question}><button type="button" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)} aria-expanded={faqOpen === index}><span>{question}</span><b>{faqOpen === index ? '−' : '+'}</b></button>{faqOpen === index && <p>{answer}</p>}</div>)}</div>
        </section>
      </main>

      <footer className="site-footer"><a className="brand" href="#top"><span className="brand-mark">FC<span>27</span></span><span className="brand-caption">.TN <i>PAR GAMEZONE</i></span></a><p>LE FOOTBALL. VOTRE PLATEFORME.</p><div><a href="#versions">Versions</a><a href="#faq">FAQ</a><a href="https://gamezone.tn/" target="_blank" rel="noreferrer">gamezone.tn ↗</a></div><small>© 2026 FC27.TN · Tous droits réservés</small></footer>
    </div>
  );
}

export { DELIVERY_MILLIMES, formatPrice, governorates, products };
export default App;
