import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sparkles, Loader2, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Product, Transaction } from '../types';
import { generateInventoryReport } from '../services/geminiService';
import { generatePDF } from '../services/pdfService';

interface ReportsProps {
  products: Product[];
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC<ReportsProps> = ({ products, transactions }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prepare Pie Chart Data (Value by Category)
  const categoryValueData = products.reduce((acc: any, curr) => {
    const existing = acc.find((i: any) => i.name === curr.category);
    const val = curr.price * curr.quantity;
    if (existing) {
      existing.value += val;
    } else {
      acc.push({ name: curr.category, value: val });
    }
    return acc;
  }, []);

  const handleGenerateAIReport = async () => {
    setLoading(true);
    const result = await generateInventoryReport(products, transactions);
    setReport(result);
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    generatePDF(products, transactions, report);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Deep dive into your business metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={handleGenerateAIReport}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            AI Smart Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Inventory Value Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryValueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryValueData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-slate-500">
            Total Asset Value: <span className="font-bold text-slate-900">${products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}</span>
          </div>
        </div>

        {/* AI Text Report */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <FileText className="text-slate-400" size={20} />
            <h3 className="font-bold text-slate-900">AI Analysis Report</h3>
            {!report && <span className="text-xs text-slate-400 ml-auto">(Generate to include in PDF)</span>}
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 prose prose-slate max-w-none">
            {report ? (
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 mb-3" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-slate-800 mt-4 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-medium text-slate-800 mt-3 mb-1" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                  p: ({node, ...props}) => <p className="text-slate-600 mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />
                }}
              >
                {report}
              </ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Sparkles size={48} className="text-purple-200" />
                <p>Click "AI Smart Report" to analyze your inventory data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;