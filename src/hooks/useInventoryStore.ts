import { useState, useEffect } from 'react';
import { InventoryItem, StockMovement, SalesTransaction, DashboardStats } from '@/types/inventory';

// Storage keys
const ITEMS_KEY = 'inventory_items';
const MOVEMENTS_KEY = 'stock_movements';
const SALES_KEY = 'sales_transactions';

// Helper functions for localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const useInventoryStore = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    setItems(loadFromStorage(ITEMS_KEY, []));
    setMovements(loadFromStorage(MOVEMENTS_KEY, []));
    setSales(loadFromStorage(SALES_KEY, []));
  }, []);



  // Item management
  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
 
    const newItem: InventoryItem = {
      ...item,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
 
    setItems(prev => {
      const updated = [...prev, newItem];
      saveToStorage(ITEMS_KEY, updated);
      return updated;
    });
 
    return newItem;
  };
 
  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      );
      saveToStorage(ITEMS_KEY, updated);
      return updated;
    });
  };
 
  const deleteItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(ITEMS_KEY, updated);
      return updated;
    });
 
    setMovements(prev => {
      const updated = prev.filter(movement => movement.itemId !== id);
      saveToStorage(MOVEMENTS_KEY, updated);
      return updated;
    });
 
    setSales(prev => {
      const updated = prev.filter(sale => sale.itemId !== id);
      saveToStorage(SALES_KEY, updated);
      return updated;
    });
  };

  // Stock movements
  const addStockMovement = (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
 
    const newMovement: StockMovement = {
      ...movement,
      id,
      createdAt: new Date(),
    };
 
    setMovements(prev => {
      const updated = [...prev, newMovement];
      saveToStorage(MOVEMENTS_KEY, updated);
      return updated;
    });
 
    // Update item stock
    updateItem(movement.itemId, { currentStock: movement.newStock });
 
    return newMovement;
  };

  // Sales transactions
  const addSale = (sale: Omit<SalesTransaction, 'id' | 'createdAt'>) => {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
 
    const newSale: SalesTransaction = {
      ...sale,
      id,
      createdAt: new Date(),
    };
 
    setSales(prev => {
      const updated = [...prev, newSale];
      saveToStorage(SALES_KEY, updated);
      return updated;
    });
 
    // Create stock movement for sale
    const item = items.find(i => i.id === sale.itemId);
    if (item) {
      addStockMovement({
        itemId: sale.itemId,
        type: 'stock-out',
        quantity: sale.quantity,
        previousStock: item.currentStock,
        newStock: item.currentStock - sale.quantity,
        reason: 'Sale',
        reference: newSale.id,
      });
    }
 
    return newSale;
  };

  // Get dashboard statistics
  const getDashboardStats = (): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);
    const lowStockItems = items.filter(item => 
      item.currentStock > 0 && item.currentStock <= item.minStockLevel
    ).length;
    const outOfStockItems = items.filter(item => item.currentStock === 0).length;
    
    const todaySalesData = sales.filter(sale => 
      new Date(sale.createdAt) >= today
    );
    const todaySales = todaySalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const todayProfit = todaySalesData.reduce((sum, sale) => sum + sale.profit, 0);
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      todaySales,
      todayProfit,
    };
  };

  // Get stock status for an item
  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'out-of-stock';
    if (item.currentStock <= item.minStockLevel) return 'low-stock';
    return 'in-stock';
  };

  // Get items with low stock
  const getLowStockItems = () => {
    return items.filter(item => 
      item.currentStock > 0 && item.currentStock <= item.minStockLevel
    );
  };

  // Get movements for a specific item
  const getItemMovements = (itemId: string) => {
    return movements
      .filter(movement => movement.itemId === itemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return {
    // Data
    items,
    movements,
    sales,
    
    // Item management
    addItem,
    updateItem,
    deleteItem,
    
    // Stock movements
    addStockMovement,
    
    // Sales
    addSale,
    
    // Utilities
    getDashboardStats,
    getStockStatus,
    getLowStockItems,
    getItemMovements,
  };
};