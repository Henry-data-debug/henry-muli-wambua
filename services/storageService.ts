import { Product, Transaction } from '../types';
import LZString from 'lz-string';

const PRODUCTS_KEY = 'stockflow_products';
const TRANSACTIONS_KEY = 'stockflow_transactions';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Premium Widget A', sku: 'WDG-001', category: 'Widgets', quantity: 45, minLevel: 10, price: 25.00, lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Super Gadget X', sku: 'GDG-X01', category: 'Gadgets', quantity: 5, minLevel: 15, price: 120.50, lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Basic Tool Set', sku: 'TLS-009', category: 'Tools', quantity: 120, minLevel: 20, price: 45.99, lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Office Chair', sku: 'FUR-C02', category: 'Furniture', quantity: 8, minLevel: 5, price: 250.00, lastUpdated: new Date().toISOString() },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const generateShareUrl = (products: Product[], transactions: Transaction[]) => {
  // Minimize payload keys to save space before compression
  const minifiedData = {
    p: products.map(p => [
      p.id, p.name, p.sku, p.category, p.quantity, p.minLevel, p.price, p.lastUpdated
    ]),
    t: transactions.map(t => [
      t.id, t.productId, t.productName, t.type, t.quantity, t.date, t.notes
    ])
  };

  const jsonString = JSON.stringify(minifiedData);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  
  return `${window.location.origin}${window.location.pathname}?s=${compressed}${window.location.hash}`;
};

export const parseShareParams = (): { products: Product[], transactions: Transaction[] } | null => {
  const params = new URLSearchParams(window.location.search);
  
  // Try new compressed param 's'
  const compressedData = params.get('s');
  if (compressedData) {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
      if (!decompressed) return null;
      
      const data = JSON.parse(decompressed);
      
      // Rehydrate from minified array structure
      const products: Product[] = (data.p || []).map((item: any[]) => ({
        id: item[0], name: item[1], sku: item[2], category: item[3], 
        quantity: item[4], minLevel: item[5], price: item[6], lastUpdated: item[7]
      }));

      const transactions: Transaction[] = (data.t || []).map((item: any[]) => ({
        id: item[0], productId: item[1], productName: item[2], type: item[3], 
        quantity: item[4], date: item[5], notes: item[6]
      }));

      return { products, transactions };
    } catch (e) {
      console.error("Error parsing compressed share data", e);
    }
  }

  // Fallback: Try legacy 'share' param (Base64)
  const legacyShareData = params.get('share');
  if (legacyShareData) {
    try {
      const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(legacyShareData), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const data = JSON.parse(jsonStr);
      return { products: data.p || [], transactions: data.t || [] };
    } catch (e) {
      console.error("Error parsing legacy share data", e);
    }
  }

  return null;
};