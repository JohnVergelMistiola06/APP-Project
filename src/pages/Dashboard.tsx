import { Package, DollarSign, TrendingDown, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { getDashboardStats, getLowStockItems, sales, items } = useInventoryStore();
  const stats = getDashboardStats();
  const lowStockItems = getLowStockItems();
  
  // Get recent sales
  const recentSales = sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Items"
          value={stats.totalItems}
          description="Items in inventory"
          icon={Package}
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(stats.totalValue)}
          description="Total stock value"
          icon={DollarSign}
        />
        <StatsCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          description="Sales revenue today"
          icon={ShoppingCart}
          trend="up"
        />
        <StatsCard
          title="Today's Profit"
          value={formatCurrency(stats.todayProfit)}
          description="Profit margin today"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          description="Need restocking"
          icon={TrendingDown}
          trend={stats.lowStockItems > 0 ? 'down' : 'neutral'}
          className={stats.lowStockItems > 0 ? 'border-warning' : ''}
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStockItems}
          description="Items unavailable"
          icon={AlertTriangle}
          trend={stats.outOfStockItems > 0 ? 'down' : 'neutral'}
          className={stats.outOfStockItems > 0 ? 'border-destructive' : ''}
        />
        <StatsCard
          title="Categories"
          value={new Set(items.map(item => item.category)).size}
          description="Product categories"
          icon={Package}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alert */}
        <LowStockAlert items={lowStockItems} />

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No sales recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => {
                  const item = items.find(i => i.id === sale.itemId);
                  return (
                    <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.quantity} × {formatCurrency(sale.unitPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(sale.totalAmount)}</div>
                        <div className="text-sm text-success">
                          +{formatCurrency(sale.profit)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}