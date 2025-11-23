import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/types/inventory';
import { Link } from 'react-router-dom';

interface LowStockAlertProps {
  items: InventoryItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-success" />
            Stock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-success text-2xl mb-2">✓</div>
            <p className="text-sm text-muted-foreground">All items are well stocked</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.sku}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current: {item.currentStock} {item.unit} | Min: {item.minStockLevel} {item.unit}
                </div>
              </div>
              <Badge variant="secondary" className="bg-warning text-warning-foreground">
                {item.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
              </Badge>
            </div>
          ))}
          
          {items.length > 5 && (
            <div className="text-center text-sm text-muted-foreground">
              +{items.length - 5} more items need attention
            </div>
          )}
          
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/items?filter=low-stock">
                View All Low Stock Items
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}