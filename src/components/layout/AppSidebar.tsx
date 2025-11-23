import { TrendingUp, ShoppingCart, FileText, Home, Plus, Package } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
const navigationItems = [{
  title: 'Dashboard',
  url: '/',
  icon: Home
}, {
  title: 'Items',
  url: '/items',
  icon: Package
}, {
  title: 'Stock Movements',
  url: '/stock',
  icon: TrendingUp
}, {
  title: 'Sales',
  url: '/sales',
  icon: ShoppingCart
}, {
  title: 'Reports',
  url: '/reports',
  icon: FileText
}];
export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  return <Sidebar collapsible="icon">
      <SidebarContent>
        {open && (
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="font-bold text-lg text-sidebar-foreground">InventoryPro</h1>
                <p className="text-xs text-sidebar-foreground/70">Business Management</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url} end className="flex items-center">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Add Item">
                  <NavLink
                    to="/items/new"
                    className="flex items-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}
