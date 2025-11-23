import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { AlertTriangle } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { getLowStockItems } = useInventoryStore();
  const lowStockItems = getLowStockItems();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">Inventory Management System</h2>
                {lowStockItems.length > 0 && (
                  <Badge variant="secondary" className="bg-warning text-warning-foreground">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {lowStockItems.length} Low Stock
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Small Business Edition
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}