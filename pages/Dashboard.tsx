import React from 'react';
import { DollarSign, Package, AlertTriangle, Activity } from 'lucide-react';
import { Product, Transaction } from '../types';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions }) => {
  // Calculate Stats
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStockItems = products.filter(p => p.quantity <= p.minLevel).length;
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const recentActivity = transactions.length;

  // Prepare chart data (Items per category)
  const categoryData = products.reduce((acc: any, curr) => {
    const existing = acc.find((i: any) => i.name === curr.category);
    if (existing) {
      existing.value += curr.quantity;
    } else {
      acc.push({ name: curr.category, value: curr.quantity });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview of your inventory performance</p>
        </div>
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Inventory Value" 
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard 
          label="Total Items in Stock" 
          value={totalItems}
          icon={Package}
          color="blue"
        />
        <StatCard 
          label="Low Stock Alerts" 
          value={lowStockItems}
          icon={AlertTriangle}
          color="red"
          trend={lowStockItems > 0 ? "Action Needed" : "Healthy"}
        />
        <StatCard 
          label="Total Transactions" 
          value={recentActivity}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Stock by Category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Low Stock Alert
          </h2>
          <div className="space-y-4">
            {products.filter(p => p.quantity <= p.minLevel).length === 0 ? (
              <p className="text-slate-500 text-sm">All stock levels are healthy.</p>
            ) : (
              products.filter(p => p.quantity <= p.minLevel).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-rose-600">Min: {item.minLevel}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-700">{item.quantity}</span>
                    <p className="text-xs text-slate-500">Qty</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;