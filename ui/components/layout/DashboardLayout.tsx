import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Search,
  Calendar,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Star,
  CalendarClock,
  DollarSign,
  Users,
  Library,
  User,
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
import { useAuthStore } from "@/ui/stores/auth.store";
import { NotificationDropdown } from "@/ui/components/notifications";

// Student navigation items
const studentNavItems = [
  {
    title: "Inicio",
    icon: Home,
    path: "/dashboard",
    exact: true,
  },
  {
    title: "Buscar Tutores",
    icon: Search,
    path: "/dashboard/buscar-tutores",
  },
  {
    title: "Mis Sesiones",
    icon: Calendar,
    path: "/dashboard/mis-sesiones",
  },
  {
    title: "Materiales",
    icon: BookOpen,
    path: "/dashboard/materiales",
  },
  {
    title: "Biblioteca",
    icon: Library,
    path: "/dashboard/biblioteca",
  },
  {
    title: "Mis Planes",
    icon: CreditCard,
    path: "/dashboard/planes",
  },
];

// Tutor navigation items
const tutorNavItems = [
  {
    title: "Inicio",
    icon: Home,
    path: "/tutor/dashboard",
    exact: true,
  },
  {
    title: "Mis Sesiones",
    icon: Calendar,
    path: "/tutor/sesiones",
  },
  {
    title: "Disponibilidad",
    icon: CalendarClock,
    path: "/tutor/disponibilidad",
  },
  {
    title: "Ganancias",
    icon: DollarSign,
    path: "/tutor/ganancias",
  },
  {
    title: "Estudiantes",
    icon: Users,
    path: "/tutor/estudiantes",
  },
  {
    title: "Reseñas",
    icon: Star,
    path: "/tutor/resenas",
  },
];

interface DashboardLayoutProps {
  role: "student" | "tutor";
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  const navItems = role === "tutor" ? tutorNavItems : studentNavItems;
  const dashboardHome = role === "tutor" ? "/tutor/dashboard" : "/dashboard";

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

  const displayName = profile?.full_name || user?.email || "Usuario";
  
  // Use avatar URL directly - Supabase storage URLs already have proper caching
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
          <Link to={dashboardHome} className="flex items-center justify-center">
            <div className="relative w-full max-w-[180px] h-12">
              <img
                src="/logo.svg"
                alt="EduConnect"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
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
                    isActive={isActiveLink("/dashboard/perfil") || isActiveLink("/tutor/perfil")}
                    tooltip="Mi Perfil"
                  >
                    <Link to={role === "tutor" ? "/tutor/perfil" : "/dashboard/perfil"}>
                      <User className="size-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveLink("/dashboard/configuracion") || isActiveLink("/tutor/configuracion")}
                    tooltip="Configuración"
                  >
                    <Link to={role === "tutor" ? "/tutor/configuracion" : "/dashboard/configuracion"}>
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
                <Link to={role === "tutor" ? "/tutor/perfil" : "/dashboard/perfil"}>
                  <User className="mr-2 size-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={role === "tutor" ? "/tutor/configuracion" : "/dashboard/configuracion"}>
                  <Settings className="mr-2 size-4" />
                  Configuración
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
          
          <div className="flex-1" />
          
          {/* Notifications */}
          <NotificationDropdown />
          
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
