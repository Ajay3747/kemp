import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Upload, Users, User, Home as HomeIcon, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/home', icon: <HomeIcon size={20} /> },
    { name: 'Dealing', path: '/dealing', icon: <ShoppingBag size={20} /> },
    { name: 'Listing', path: '/selling', icon: <Upload size={20} /> },
    { name: 'Community', path: '/community', icon: <Users size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-950/90 backdrop-blur-md shadow-lg' : 'bg-gray-950'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-yellow-400 text-2xl sm:text-3xl font-extrabold tracking-tight transform hover:scale-105 transition-transform duration-300">
          KEMP
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {/* Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center group relative text-gray-400 hover:text-yellow-400 transition-colors duration-300 ${
                location.pathname === item.path ? 'text-yellow-400' : ''
              }`}
            >
              <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                {item.icon}
              </div>
              <span className="text-xs lg:text-sm mt-1 font-medium">{item.name}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center group relative text-gray-400 hover:text-red-400 transition-colors duration-300"
            title="Logout"
          >
            <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
              <LogOut size={20} />
            </div>
            <span className="text-xs lg:text-sm mt-1 font-medium">Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-yellow-400 transition-colors"
          title="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-yellow-400/20 text-yellow-400'
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-all duration-300 w-full"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}