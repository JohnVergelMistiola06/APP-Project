export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  category: string;
  currentStock: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'stock-in' | 'stock-out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string;
  createdAt: Date;
}

export interface SalesTransaction {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  costPrice: number;
  profit: number;
  customer?: string;
  reference?: string;
  createdAt: Date;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  todaySales: number;
  todayProfit: number;
}