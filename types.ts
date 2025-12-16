export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minLevel: number; // Reorder point
  price: number;
  lastUpdated: string;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  notes?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  recentTransactions: number;
}
