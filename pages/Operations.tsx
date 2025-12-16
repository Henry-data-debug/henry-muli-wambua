import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
import { Product, Transaction, TransactionType } from '../types';

interface OperationsProps {
  products: Product[];
  transactions: Transaction[];
  onTransaction: (productId: string, type: TransactionType, quantity: number, notes: string) => void;
}

const Operations: React.FC<OperationsProps> = ({ products, transactions, onTransaction }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<TransactionType>('OUT');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    onTransaction(selectedProduct, type, quantity, notes);
    
    // Reset form
    setMessage(`Successfully ${type === 'IN' ? 'added' : 'removed'} ${quantity} items.`);
    setQuantity(1);
    setNotes('');
    setTimeout(() => setMessage(''), 3000);
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Operation Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ArrowUpCircle className="text-blue-600" />
          Log Operation
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
            {(['OUT', 'IN'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  type === t 
                    ? t === 'IN' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'IN' ? 'Check In (Stock Up)' : 'Check Out (Sale/Use)'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
            <select 
              required
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- Choose Item --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Qty: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input 
              required 
              type="number" 
              min="1"
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <textarea 
              rows={3}
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Monthly restock, Client X order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
              type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirm Transaction
          </button>
        </form>
      </div>

      {/* Recent History */}
      <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <History className="text-slate-500" />
          Recent Log
        </h2>
        <div className="space-y-4">
          {transactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {tx.type === 'IN' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{tx.productName}</p>
                  <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                </span>
                {tx.notes && <p className="text-xs text-slate-400 max-w-[100px] truncate">{tx.notes}</p>}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-slate-400 py-10">No transactions recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Operations;