import { useState } from 'react';
import { Plus, ShoppingCart, DollarSign } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { useToast } from '@/hooks/use-toast';

export default function Sales() {
  const { items, sales, addSale } = useInventoryStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    itemId: string;
    quantity: number | string;
    unitPrice: number | string;
    customer: string;
    reference: string;
  }>({
    itemId: '',
    quantity: 1,
    unitPrice: 0,
    customer: '',
    reference: '',
  });

  const selectedItem = items.find(i => i.id === formData.itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    const quantityNum = typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 1;
    const unitPriceNum = typeof formData.unitPrice === 'number' ? formData.unitPrice : parseFloat(formData.unitPrice) || 0;

    if (quantityNum > selectedItem.currentStock) {
      toast({
        title: "Insufficient stock",
        description: "Not enough items in stock for this sale.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = quantityNum * unitPriceNum;
    const totalCost = quantityNum * selectedItem.costPrice;
    const profit = totalAmount - totalCost;

    addSale({
      itemId: formData.itemId,
      quantity: quantityNum,
      unitPrice: unitPriceNum,
      totalAmount,
      costPrice: selectedItem.costPrice,
      profit,
      customer: formData.customer,
      reference: formData.reference,
    });

    toast({
      title: "Sale recorded",
      description: `Sale of ${formData.quantity} ${selectedItem.unit} of ${selectedItem.name} recorded successfully.`,
    });

    setFormData({
      itemId: '',
      quantity: 1,
      unitPrice: 0,
      customer: '',
      reference: '',
    });
    setIsDialogOpen(false);
  };

  // Auto-fill selling price when item is selected
  const handleItemChange = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    setFormData(prev => ({
      ...prev,
      itemId,
      unitPrice: item?.sellingPrice || 0,
    }));
  };

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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const sortedSales = sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate summary stats
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const avgMargin = totalSales > 0 ? (totalProfit / (totalSales - totalProfit)) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground">
              Record sales transactions and track profitability
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item">Item *</Label>
                  <Select 
                    value={formData.itemId} 
                    onValueChange={handleItemChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.filter(item => item.currentStock > 0).map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Stock: {item.currentStock} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedItem && selectedItem.currentStock === 0 && (
                    <p className="text-sm text-destructive">This item is out of stock</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem?.currentStock || 999}
                      value={formData.quantity === '' ? '' : formData.quantity || 1}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, quantity: val === '' ? '' : parseInt(val) || 1 }));
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') setFormData(prev => ({ ...prev, quantity: 1 }));
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice === '' ? '' : formData.unitPrice || 0}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, unitPrice: val === '' ? '' : parseFloat(val) || 0 }));
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') setFormData(prev => ({ ...prev, unitPrice: 0 }));
                      }}
                      required
                    />
                  </div>
                </div>

                {selectedItem && (typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 0) > 0 && (typeof formData.unitPrice === 'number' ? formData.unitPrice : parseFloat(formData.unitPrice) || 0) > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">
                          {formatCurrency((typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 0) * (typeof formData.unitPrice === 'number' ? formData.unitPrice : parseFloat(formData.unitPrice) || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span>{formatCurrency((typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 0) * selectedItem.costPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit:</span>
                        <span className="font-medium text-success">
                          {formatCurrency(((typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 0) * (typeof formData.unitPrice === 'number' ? formData.unitPrice : parseFloat(formData.unitPrice) || 0)) - ((typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 0) * selectedItem.costPrice))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    value={formData.customer}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="Customer name (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="e.g., Invoice #123, Order #456"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Record Sale</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">
                {sales.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">
                {avgMargin.toFixed(1)}% average margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sale Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sales.length > 0 ? formatCurrency(totalSales / sales.length) : '$0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Sales History ({sales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No sales recorded</h3>
                <p className="text-muted-foreground mb-4">
                  Start recording your sales to track revenue and profitability
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Sale
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSales.map((sale) => {
                      const item = items.find(i => i.id === sale.itemId);
                      
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{formatDate(sale.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {item?.name || 'Unknown Item'}
                          </TableCell>
                          <TableCell>{sale.customer || '-'}</TableCell>
                          <TableCell>
                            {sale.quantity} {item?.unit}
                          </TableCell>
                          <TableCell>{formatCurrency(sale.unitPrice)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(sale.totalAmount)}
                          </TableCell>
                          <TableCell className="text-success font-medium">
                            {formatCurrency(sale.profit)}
                          </TableCell>
                          <TableCell>{sale.reference || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}