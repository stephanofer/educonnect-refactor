import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Library,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/ui/components/shadcn/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/shadcn/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Badge } from "@/ui/components/shadcn/badge";
import { useAuthStore } from "@/ui/stores/auth.store";

// Admin navigation items
const adminNavItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/admin",
    exact: true,
  },
  {
    title: "Biblioteca",
    icon: Library,
    path: "/admin/biblioteca",
  },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email || "Admin";
  const avatarUrl = profile?.avatar_url || undefined;

  const isActiveLink = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        {/* Header with Logo */}
        <SidebarHeader className="p-4">
          <Link to="/admin" className="flex items-center justify-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="size-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">EduConnect</span>
              <Badge variant="secondary" className="text-[10px] w-fit">Admin</Badge>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveLink(item.path, item.exact)}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Settings Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveLink("/admin/configuracion")}
                    tooltip="Configuración"
                  >
                    <Link to="/admin/configuracion">
                      <Settings className="size-4" />
                      <span>Configuración</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with User Profile */}
        <SidebarFooter className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
                <Avatar className="size-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-sm">
                  <span className="font-medium truncate max-w-[120px]">
                    {displayName.split(" ")[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/dashboard">
                  <User className="mr-2 size-4" />
                  Ir al Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 size-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area */}
      <SidebarInset>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              Panel de Administración
            </Badge>
          </div>
          
          <div className="flex-1" />
          
          {/* Mobile User Avatar */}
          <div className="md:hidden">
            <Avatar className="size-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
