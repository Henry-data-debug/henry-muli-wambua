import React from 'react';
import { LayoutDashboard, Package, ArrowRightLeft, BarChart3, Box, Share2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onShare: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onShare }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'operations', label: 'Operations', icon: ArrowRightLeft },
    { id: 'reports', label: 'Reports & AI', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Box className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">StockFlow</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onShare}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700"
        >
          <Share2 size={16} />
          Share Snapshot
        </button>

        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-200">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;