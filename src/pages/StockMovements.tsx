import { useState } from 'react';
import { Plus, Package, TrendingUp, TrendingDown, Edit3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { useToast } from '@/hooks/use-toast';

export default function StockMovements() {
  const { items, movements, addStockMovement } = useInventoryStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    itemId: string;
    type: 'stock-in' | 'stock-out' | 'adjustment';
    quantity: number | string;
    reason: string;
    reference: string;
  }>({
    itemId: '',
    type: 'stock-in' as 'stock-in' | 'stock-out' | 'adjustment',
    quantity: 0,
    reason: '',
    reference: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const item = items.find(i => i.id === formData.itemId);
    if (!item) return;

    const quantityNum = typeof formData.quantity === 'number' ? formData.quantity : parseInt(formData.quantity) || 0;

    let newStock: number;
    
    switch (formData.type) {
      case 'stock-in':
        newStock = item.currentStock + quantityNum;
        break;
      case 'stock-out':
        newStock = Math.max(0, item.currentStock - quantityNum);
        if (quantityNum > item.currentStock) {
          toast({
            title: "Insufficient stock",
            description: "Cannot remove more items than currently in stock.",
            variant: "destructive",
          });
          return;
        }
        break;
      case 'adjustment':
        newStock = quantityNum;
        break;
    }

    addStockMovement({
      itemId: formData.itemId,
      type: formData.type,
      quantity: formData.type === 'adjustment' ? quantityNum : Math.abs(quantityNum),
      previousStock: item.currentStock,
      newStock,
      reason: formData.reason,
      reference: formData.reference,
    });

    toast({
      title: "Stock updated",
      description: `${item.name} stock has been updated successfully.`,
    });

    setFormData({
      itemId: '',
      type: 'stock-in',
      quantity: 0,
      reason: '',
      reference: '',
    });
    setIsDialogOpen(false);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'stock-in':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'stock-out':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'adjustment':
        return <Edit3 className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'stock-in':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Stock In</Badge>;
      case 'stock-out':
        return <Badge variant="destructive">Stock Out</Badge>;
      case 'adjustment':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Adjustment</Badge>;
      default:
        return null;
    }
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

  const sortedMovements = movements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
            <p className="text-muted-foreground">
              Track all stock changes and adjustments
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Stock Movement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item">Item *</Label>
                  <Select 
                    value={formData.itemId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, itemId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Current: {item.currentStock} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Movement Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock-in">Stock In</SelectItem>
                      <SelectItem value="stock-out">Stock Out</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    {formData.type === 'adjustment' ? 'New Stock Level *' : 'Quantity *'}
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity === '' ? '' : formData.quantity || 0}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, quantity: val === '' ? '' : parseInt(val) || 0 }));
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') setFormData(prev => ({ ...prev, quantity: 0 }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Optional reason for this movement"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="e.g., PO-001, Invoice #123"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Add Movement</Button>
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

        {/* Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Movements ({movements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No movements recorded</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your inventory by recording stock movements
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Movement
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Previous Stock</TableHead>
                      <TableHead>New Stock</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMovements.map((movement) => {
                      const item = items.find(i => i.id === movement.itemId);
                      
                      return (
                        <TableRow key={movement.id}>
                          <TableCell>{formatDate(movement.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {item?.name || 'Unknown Item'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMovementIcon(movement.type)}
                              {getMovementBadge(movement.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={
                              movement.type === 'stock-in' ? 'text-success' :
                              movement.type === 'stock-out' ? 'text-destructive' :
                              'text-warning'
                            }>
                              {movement.type === 'stock-in' ? '+' : 
                               movement.type === 'stock-out' ? '-' : ''}
                              {movement.quantity} {item?.unit}
                            </span>
                          </TableCell>
                          <TableCell>{movement.previousStock} {item?.unit}</TableCell>
                          <TableCell className="font-medium">
                            {movement.newStock} {item?.unit}
                          </TableCell>
                          <TableCell>{movement.reason || '-'}</TableCell>
                          <TableCell>{movement.reference || '-'}</TableCell>
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