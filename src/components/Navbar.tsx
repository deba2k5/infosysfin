import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { 
  Leaf, 
  BarChart3, 
  CloudSun, 
  ShieldCheck, 
  MessageSquare, 
  User,
  LogOut 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Crop Planning', path: '/crop-planning', icon: Leaf },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'Insurance', path: '/insurance', icon: ShieldCheck },
    { name: 'Advisory', path: '/advisory', icon: MessageSquare },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="relative">
            <Leaf className="h-8 w-8 text-primary animate-glow-pulse" />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm"></div>
          </div>
          <span className="font-bold text-xl hero-text">KrishakSure</span>
        </Link>

        {user && (
          <div className="flex items-center space-x-6 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary neon-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      KrishakSure Farmer
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="gradient-primary">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;