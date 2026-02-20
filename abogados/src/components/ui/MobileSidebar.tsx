// Responsive Sidebar Component
// Mobile-friendly sidebar with drawer

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    label: string;
    path: string;
    icon?: React.ElementType;
  }>;
}

export function MobileSidebar({ isOpen, onClose, items }: MobileSidebarProps) {
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-theme-card border-r border-theme z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-theme">
              <h2 className="font-bold text-theme-primary">Menú</h2>
              <button
                onClick={onClose}
                className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                      ${isActive 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                      }
                    `}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile Header Button
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg"
      aria-label="Abrir menú"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}

export default MobileSidebar;
