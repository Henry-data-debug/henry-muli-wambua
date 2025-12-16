import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Operations from './pages/Operations';
import Reports from './pages/Reports';
import { Product, Transaction, TransactionType } from './types';
import { getProducts, saveProducts, getTransactions, saveTransactions, generateShareUrl, parseShareParams } from './services/storageService';
import { Eye } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSharedMode, setIsSharedMode] = useState(false);

  // Load data on mount (check for shared URL first)
  useEffect(() => {
    const sharedData = parseShareParams();
    if (sharedData) {
      setProducts(sharedData.products);
      setTransactions(sharedData.transactions);
      setIsSharedMode(true);
    } else {
      setProducts(getProducts());
      setTransactions(getTransactions());
    }
  }, []);

  // Handlers
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    if (!isSharedMode) saveProducts(updatedProducts);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updatedProducts);
    if (!isSharedMode) saveProducts(updatedProducts);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      if (!isSharedMode) saveProducts(updated);
    }
  };

  const handleTransaction = (productId: string, type: TransactionType, quantity: number, notes: string) => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = products[productIndex];
    let newQuantity = product.quantity;

    if (type === 'IN') {
      newQuantity += quantity;
    } else {
      if (product.quantity < quantity) {
        alert('Error: Not enough stock!');
        return;
      }
      newQuantity -= quantity;
    }

    // Update Product
    const updatedProducts = [...products];
    updatedProducts[productIndex] = { ...product, quantity: newQuantity, lastUpdated: new Date().toISOString() };
    setProducts(updatedProducts);
    if (!isSharedMode) saveProducts(updatedProducts);

    // Record Transaction
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      productName: product.name,
      type,
      quantity,
      date: new Date().toISOString(),
      notes
    };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    if (!isSharedMode) saveTransactions(updatedTransactions);
  };

  const handleShare = () => {
    const url = generateShareUrl(products, transactions);
    navigator.clipboard.writeText(url).then(() => {
      alert("Snapshot link copied to clipboard! You can now send this link to your client.");
    }).catch(() => {
      prompt("Copy this link to share:", url);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={products} transactions={transactions} />;
      case 'inventory':
        return <Inventory 
          products={products} 
          onAddProduct={handleAddProduct} 
          onDeleteProduct={handleDeleteProduct} 
          onEditProduct={handleEditProduct}
        />;
      case 'operations':
        return <Operations products={products} transactions={transactions} onTransaction={handleTransaction} />;
      case 'reports':
        return <Reports products={products} transactions={transactions} />;
      default:
        return <Dashboard products={products} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onShare={handleShare} />
      <main className="flex-1 ml-64 overflow-y-auto h-screen relative">
        {isSharedMode && (
          <div className="bg-indigo-600 text-white px-6 py-2 flex items-center justify-center gap-2 shadow-md">
            <Eye size={18} />
            <span className="font-medium text-sm">Viewing Shared Snapshot Mode — Changes will not be saved permanently.</span>
            <button 
              onClick={() => {
                window.location.href = window.location.origin + window.location.pathname;
              }} 
              className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors"
            >
              Exit View
            </button>
          </div>
        )}
        <div className="max-w-7xl mx-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;