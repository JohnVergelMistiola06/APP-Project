import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/types/inventory';

interface ItemFormProps {
  item?: InventoryItem;
  onSubmit: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const UNITS = ['pcs', 'box', 'kg', 'lbs', 'liter', 'gallon', 'meter', 'feet'];
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverage', 'Office Supplies', 'Tools & Hardware', 'Sports & Recreation', 'Other'];

export function ItemForm({ item, onSubmit, onCancel, isLoading }: ItemFormProps) {
  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    unit: string;
    costPrice: number | string;
    sellingPrice: number | string;
    category: string;
    currentStock: number | string;
    minStockLevel: number | string;
  }>({
    sku: item?.sku || '',
    name: item?.name || '',
    unit: item?.unit || 'pcs',
    costPrice: item?.costPrice || 0,
    sellingPrice: item?.sellingPrice || 0,
    category: item?.category || '',
    currentStock: item?.currentStock || 0,
    minStockLevel: item?.minStockLevel || 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and basic validation to avoid empty/invalid values slipping through
    const payload = {
      ...formData,
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      costPrice: typeof formData.costPrice === 'number' ? formData.costPrice : parseFloat(formData.costPrice) || 0,
      sellingPrice: typeof formData.sellingPrice === 'number' ? formData.sellingPrice : parseFloat(formData.sellingPrice) || 0,
      currentStock: typeof formData.currentStock === 'number' ? formData.currentStock : parseInt(formData.currentStock as string) || 0,
      minStockLevel: typeof formData.minStockLevel === 'number' ? formData.minStockLevel : parseInt(formData.minStockLevel as string) || 0,
    };

    onSubmit(payload);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberInput = (field: string, value: string, isFloat: boolean = false) => {
    if (value === '') {
      handleChange(field, '' as any);
      return;
    }
    const parsedValue = isFloat ? parseFloat(value) : parseInt(value);
    handleChange(field, isNaN(parsedValue) ? 0 : parsedValue);
  };

  const profit = (typeof formData.sellingPrice === 'number' ? formData.sellingPrice : parseFloat(formData.sellingPrice) || 0) - (typeof formData.costPrice === 'number' ? formData.costPrice : parseFloat(formData.costPrice) || 0);
  const costPriceNum = typeof formData.costPrice === 'number' ? formData.costPrice : parseFloat(formData.costPrice) || 0;
  const marginPercentage = costPriceNum > 0 ? ((profit / costPriceNum) * 100) : 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="e.g., PROD-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Premium Widget"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice === '' ? '' : formData.costPrice || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleNumberInput('costPrice', e.target.value, true)}
                onBlur={(e) => {
                  if (e.target.value === '') handleChange('costPrice', 0);
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice === '' ? '' : formData.sellingPrice || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleNumberInput('sellingPrice', e.target.value, true)}
                onBlur={(e) => {
                  if (e.target.value === '') handleChange('sellingPrice', 0);
                }}
                required
              />
            </div>
          </div>

          {(typeof formData.costPrice === 'number' ? formData.costPrice : parseFloat(formData.costPrice) || 0) > 0 && (typeof formData.sellingPrice === 'number' ? formData.sellingPrice : parseFloat(formData.sellingPrice) || 0) > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Profit per unit:</span>
                  <span className={profit >= 0 ? 'text-success' : 'text-destructive'}>
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Margin:</span>
                  <span className={marginPercentage >= 0 ? 'text-success' : 'text-destructive'}>
                    {marginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={formData.currentStock === '' ? '' : formData.currentStock || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleNumberInput('currentStock', e.target.value, false)}
                onBlur={(e) => {
                  if (e.target.value === '') handleChange('currentStock', 0);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel === '' ? '' : formData.minStockLevel || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleNumberInput('minStockLevel', e.target.value, false)}
                onBlur={(e) => {
                  if (e.target.value === '') handleChange('minStockLevel', 0);
                }}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}