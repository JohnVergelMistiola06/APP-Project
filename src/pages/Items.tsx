import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { Link } from 'react-router-dom';
import { InventoryItem } from '@/types/inventory';
export default function Items() {
  const {
    items,
    deleteItem,
    getStockStatus
  } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const stockStatus = getStockStatus(item);
    const matchesStock = !stockFilter || stockFilter === 'low-stock' && stockStatus === 'low-stock' || stockFilter === 'out-of-stock' && stockStatus === 'out-of-stock' || stockFilter === 'in-stock' && stockStatus === 'in-stock';
    return matchesSearch && matchesCategory && matchesStock;
  });
  const handleDelete = (item: InventoryItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      deleteItem(item.id);
    }
  };
  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item);
    switch (status) {
      case 'out-of-stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low-stock':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Low Stock</Badge>;
      default:
        return <Badge variant="secondary" className="bg-success text-success-foreground">In Stock</Badge>;
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  return <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Items</h1>
            <p className="text-muted-foreground">
              Manage your inventory items and stock levels
            </p>
          </div>
          <Button asChild>
            <Link to="/items/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              
              <Select value={categoryFilter} onValueChange={value => setCategoryFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={value => setStockFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStockFilter('');
            }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? <div className="text-center py-12">
                
                <h3 className="text-lg font-medium">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {items.length === 0 ? "Get started by adding your first inventory item" : "Try adjusting your filters or search terms"}
                </p>
                {items.length === 0 && <Button asChild>
                    <Link to="/items/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Link>
                  </Button>}
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => {
                  const stockStatus = getStockStatus(item);
                  const isLowStock = stockStatus === 'low-stock' || stockStatus === 'out-of-stock';
                  return <TableRow key={item.id} className={isLowStock ? 'bg-warning/5' : ''}>
                          <TableCell className="font-mono">{item.sku}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.name}
                              {isLowStock && <AlertTriangle className="h-4 w-4 text-warning" />}
                            </div>
                          </TableCell>
                          <TableCell>{item.category || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.currentStock}</div>
                              <div className="text-xs text-muted-foreground">
                                Min: {item.minStockLevel}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                          <TableCell>{getStockBadge(item)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/items/edit/${item.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(item)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>;
                })}
                  </TableBody>
                </Table>
              </div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
}