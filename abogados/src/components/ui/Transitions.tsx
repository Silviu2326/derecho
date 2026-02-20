// Page Transitions Component
// Animated page transitions using Framer Motion

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  mode?: 'fade' | 'slide' | 'scale';
}

export function PageTransition({ children, mode = 'fade' }: PageTransitionProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const currentOutlet = outlet || children;

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants[mode]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        {currentOutlet}
      </motion.div>
    </AnimatePresence>
  );
}

// Fade in animation for elements
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  direction = 'none',
  className = '' 
}: FadeInProps) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Stagger({ children, className = '', delay = 0.05 }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: delay }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item for use inside Stagger
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Expand/Collapse animation
interface ExpandProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function Expand({ isOpen, children, className = '' }: ExpandProps) {
  return (
    <motion.div
      initial={false}
      animate={{ 
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.2 }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Modal animation
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Drawer animation (slide from side)
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  direction?: 'left' | 'right';
  className?: string;
}

export function Drawer({ 
  isOpen, 
  onClose, 
  children, 
  direction = 'right',
  className = '' 
}: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: direction === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: direction === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 z-50 bg-theme-card border-l border-theme ${
              direction === 'right' ? 'right-0 w-96 max-w-[90vw]' : 'left-0 w-96 max-w-[90vw]'
            } ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PageTransition;
