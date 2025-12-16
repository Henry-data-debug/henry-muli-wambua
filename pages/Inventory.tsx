import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onDeleteProduct, onEditProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    minLevel: 5,
    price: 0
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', category: '', quantity: 0, minLevel: 5, price: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      minLevel: product.minLevel,
      price: product.price
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const originalProduct = products.find(p => p.id === editingId);
      if (originalProduct) {
        onEditProduct({
          ...originalProduct,
          ...formData,
          lastUpdated: new Date().toISOString()
        });
      }
    } else {
      onAddProduct(formData);
    }
    setIsModalOpen(false);
    setFormData({ name: '', sku: '', category: '', quantity: 0, minLevel: 5, price: 0 });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500">Manage your products and stock levels</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search items, SKU, or category..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{product.name}</span>
                    {product.quantity <= product.minLevel && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-medium ${product.quantity <= product.minLevel ? 'text-red-600' : 'text-emerald-600'}`}>
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(product)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No items found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input required type="text" className="w-full border rounded-lg p-2" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input required type="text" className="w-full border rounded-lg p-2"
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input required type="text" className="w-full border rounded-lg p-2"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input required type="number" min="0" className="w-full border rounded-lg p-2"
                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input required type="number" min="0" step="0.01" className="w-full border rounded-lg p-2"
                    value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Limit</label>
                  <input required type="number" min="1" className="w-full border rounded-lg p-2"
                    value={formData.minLevel} onChange={e => setFormData({...formData, minLevel: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;