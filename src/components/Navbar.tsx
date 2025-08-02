import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import SpeakButton from '@/components/SpeakButton';
import LanguageSelector from '@/components/LanguageSelector';
import { Menu, X, Leaf, User, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/AuthProvider';

const NAV_LINKS = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/crop-planning', key: 'cropPlanning' },
  { href: '/weather', key: 'weather' },
  { href: '/insurance', key: 'insurance' },
  { href: '/market-prices', key: 'marketPrices' },
  { href: '/advisory', key: 'advisory' },
  { href: '/loan-eligibility', key: 'loanEligibility' },
];

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-primary/10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary font-sans tracking-wide">
              Krishi Sure
            </span>
          </div>
          <SpeakButton textKey="dashboard" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <Link
              key={link.key}
              to={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 whitespace-nowrap"
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        {/* Language Selector and Auth */}
        <div className="flex items-center gap-3">
          {/* Language Selector - Always visible */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Authentication */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.email} />
                    <AvatarFallback className="bg-green-100 text-green-800">
                      {user.email ? user.email.split('@')[0].charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
              >
                {t('login')}
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/auth')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {t('signup')}
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-0 right-0 w-80 h-full bg-background shadow-xl flex flex-col">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <span className="font-bold text-primary">Krishi Sure</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-accent"
                  aria-label={t('closeMenu')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex-1 p-4 space-y-2">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.key}
                    to={link.href}
                    className="block py-3 px-4 rounded-lg hover:bg-accent text-foreground/80 hover:text-primary transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>

              {/* Mobile Language Selector */}
              <div className="p-4 border-t">
                <LanguageSelector />
              </div>

              {/* Mobile Authentication */}
              <div className="p-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.email} />
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {user.email ? user.email.split('@')[0].charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setMenuOpen(false);
                      }}
                    >
                      {t('login')}
                    </Button>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        navigate('/auth');
                        setMenuOpen(false);
                      }}
                    >
                      {t('signup')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;