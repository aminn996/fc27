import { fireEvent, render, screen } from '@testing-library/react';
import App, { formatPrice, governorates, products } from './App';

test('renders the FC27 storefront and authoritative catalog', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Acheter EA SPORTS FC 27 en Tunisie' })).toBeInTheDocument();
  expect(screen.queryByText('PRÉCOMMANDE & DISPONIBILITÉ')).not.toBeInTheDocument();
  expect(screen.queryByText('Disponibilité à confirmer')).not.toBeInTheDocument();
  expect(screen.getByText('Votre prochaine saison.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /PS5 Disque physique/i })).toBeInTheDocument();
  expect(products).toHaveLength(8);
  expect(governorates).toEqual([
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Djerba', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan', 'Zarzis',
  ]);
  expect(formatPrice(270000)).toBe('270.000 DT');
});

test('updates the checkout selection subtotal', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Nintendo Switch Cartouche physique/i }));
  expect(screen.getAllByText('249.000 DT')).toHaveLength(3);
});
