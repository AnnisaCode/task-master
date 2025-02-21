import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarDays, FileText, Settings, Menu, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: CalendarDays, label: "Projects", href: "/projects" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserEmail(user.email);
      setFullName(profile?.full_name || 'User');
    };

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
      console.error(error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border/50 hidden md:block w-[250px] shrink-0">
          <SidebarContent className="flex flex-col h-full">
            <div className="px-6 py-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">TaskMaster</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 px-3 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t">
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Signed in as: {fullName}
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start mb-2"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 mr-2" />
                ) : (
                  <Moon className="h-5 w-5 mr-2" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className={`
          fixed inset-0 z-50 bg-background/80 backdrop-blur-sm
          ${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden
        `}>
          <div className="fixed inset-y-0 left-0 w-[250px] bg-background border-r border-border/50">
            <SidebarContent className="flex flex-col h-full">
              <div className="px-6 py-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">TaskMaster</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="px-3 py-4 border-t">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Signed in as: {fullName}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start mb-2"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 mr-2" />
                  ) : (
                    <Moon className="h-5 w-5 mr-2" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </SidebarContent>
          </div>
        </div>

        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border/50 z-40">
          <div className="flex items-center justify-between px-4 h-full">
            <h2 className="text-2xl font-semibold">TaskMaster</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <main className="flex-1 overflow-auto md:ml-0">
          <div className="container mx-auto p-6 mt-16 md:mt-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
