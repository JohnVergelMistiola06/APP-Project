import { useState } from 'react';
import { FileText, Download, Printer, Package, TrendingUp, DollarSign } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/hooks/useInventoryStore';

export default function Reports() {
  const { items, sales, movements, getStockStatus } = useInventoryStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Calculate inventory value by category
  const inventoryByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        items: 0,
        value: 0,
        quantity: 0,
      };
    }
    acc[category].items += 1;
    acc[category].value += item.currentStock * item.costPrice;
    acc[category].quantity += item.currentStock;
    return acc;
  }, {} as Record<string, { items: number; value: number; quantity: number }>);

  // Calculate sales by item
  const salesByItem = sales.reduce((acc, sale) => {
    if (!acc[sale.itemId]) {
      acc[sale.itemId] = {
        quantity: 0,
        revenue: 0,
        profit: 0,
        transactions: 0,
      };
    }
    acc[sale.itemId].quantity += sale.quantity;
    acc[sale.itemId].revenue += sale.totalAmount;
    acc[sale.itemId].profit += sale.profit;
    acc[sale.itemId].transactions += 1;
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number; profit: number; transactions: number }>);

  // Get top performing items
  const topItems = Object.entries(salesByItem)
    .map(([itemId, data]) => {
      const item = items.find(i => i.id === itemId);
      return { item, ...data };
    })
    .filter(entry => entry.item)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Stock status summary
  const stockStatusSummary = items.reduce((acc, item) => {
    const status = getStockStatus(item);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Simple CSV export of items
    const csvHeaders = ['SKU', 'Name', 'Category', 'Current Stock', 'Min Stock', 'Cost Price', 'Selling Price', 'Status'];
    const csvData = items.map(item => [
      item.sku,
      item.name,
      item.category,
      item.currentStock,
      item.minStockLevel,
      item.costPrice,
      item.sellingPrice,
      getStockStatus(item),
    ]);
    
    const csv = [csvHeaders, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive inventory and sales analytics
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Management Report</h1>
          <p className="text-gray-600">Generated on {formatDate(new Date())}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 print:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.profit, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(inventoryByCategory).map(([category, data]) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell>{data.items}</TableCell>
                    <TableCell>{data.quantity}</TableCell>
                    <TableCell>{formatCurrency(data.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stock Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">
                  {stockStatusSummary['in-stock'] || 0}
                </div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <div className="text-2xl font-bold text-warning">
                  {stockStatusSummary['low-stock'] || 0}
                </div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">
                  {stockStatusSummary['out-of-stock'] || 0}
                </div>
                <div className="text-sm text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Items */}
        {topItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems.map(({ item, quantity, revenue, profit, transactions }) => (
                    <TableRow key={item!.id}>
                      <TableCell className="font-medium">{item!.name}</TableCell>
                      <TableCell>{quantity} {item!.unit}</TableCell>
                      <TableCell>{formatCurrency(revenue)}</TableCell>
                      <TableCell className="text-success">{formatCurrency(profit)}</TableCell>
                      <TableCell>{transactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Complete Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Inventory List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category || '-'}</TableCell>
                      <TableCell>{item.currentStock} {item.unit}</TableCell>
                      <TableCell>{item.minStockLevel} {item.unit}</TableCell>
                      <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell>
                        {status === 'out-of-stock' && <Badge variant="destructive">Out of Stock</Badge>}
                        {status === 'low-stock' && <Badge variant="secondary" className="bg-warning text-warning-foreground">Low Stock</Badge>}
                        {status === 'in-stock' && <Badge variant="secondary" className="bg-success text-success-foreground">In Stock</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}