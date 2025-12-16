import { GoogleGenAI } from "@google/genai";
import { Product, Transaction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInventoryReport = async (products: Product[], transactions: Transaction[]) => {
  try {
    const productsSummary = JSON.stringify(products.map(p => ({
      name: p.name,
      category: p.category,
      qty: p.quantity,
      value: p.price * p.quantity,
      status: p.quantity <= p.minLevel ? 'LOW STOCK' : 'OK'
    })));

    // Take last 20 transactions for context
    const recentTransactions = JSON.stringify(transactions.slice(0, 20));

    const prompt = `
      Act as a senior supply chain analyst. Analyze this inventory data for a small business.
      
      Current Inventory: ${productsSummary}
      Recent Transactions: ${recentTransactions}

      Provide a concise, actionable report in Markdown format.
      1. **Executive Summary**: Overall health of inventory.
      2. **Critical Alerts**: Highlight low stock items that need immediate reordering.
      3. **Value Analysis**: Which categories hold the most value?
      4. **Recommendations**: Suggest 2-3 specific actions to optimize operations (e.g., dead stock to clear, fast movers to stock up on).
      
      Keep the tone professional yet encouraging. Use bolding and lists for readability.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "Unable to generate AI report at this time. Please check your API key and connection.";
  }
};
