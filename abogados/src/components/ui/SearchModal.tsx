// Search Modal Component
// Global search with Ctrl+K shortcut

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, FileText, FolderOpen, Users, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: React.ElementType;
  path: string;
}

// Mock results
const mockResults: SearchResult[] = [
  { id: '1', title: 'Expedientes', description: 'Gestión de expedientes', category: 'Módulos', icon: FolderOpen, path: '/core/expedientes' },
  { id: '2', title: 'Facturación', description: 'Facturación y cobros', category: 'Módulos', icon: FileText, path: '/finanzas/facturacion' },
  { id: '3', title: 'Clientes', description: 'Gestión de clientes', category: 'Módulos', icon: Users, path: '/clientes' },
  { id: '4', title: 'Calendario', description: 'Calendario y audiencias', category: 'Módulos', icon: Calendar, path: '/core/calendario' },
  { id: '5', title: 'Prescripciones', description: 'Control de plazos', category: 'M1 - Core Legal', icon: Clock, path: '/core/prescripciones' },
  { id: '6', title: 'Chat IA', description: 'Copiloto legal', category: 'M11 - IA', icon: Search, path: '/ia/chat' },
];

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults(mockResults.slice(0, 5));
      return;
    }

    const filtered = mockResults.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.description?.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].path);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={() => setIsOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-xl bg-theme-card border border-theme rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-theme">
            <Search className="w-5 h-5 text-theme-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar en toda la aplicación..."
              className="flex-1 bg-transparent text-theme-primary placeholder-theme-muted focus:outline-none text-lg"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-theme-muted hover:text-theme-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="p-4 text-center text-theme-muted">
                No se encontraron resultados
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        navigate(result.path);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left
                        ${index === selectedIndex 
                          ? 'bg-accent/10 text-accent' 
                          : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                        }
                      `}
                    >
                      <div className="w-10 h-10 bg-theme-tertiary rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{result.title}</p>
                        <p className="text-sm opacity-70">{result.description}</p>
                      </div>
                      <span className="text-xs text-theme-muted">{result.category}</span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-theme flex items-center justify-between text-xs text-theme-muted">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-theme-tertiary rounded">↑↓</kbd> Navegar</span>
              <span><kbd className="px-1.5 py-0.5 bg-theme-tertiary rounded">↵</kbd> Seleccionar</span>
              <span><kbd className="px-1.5 py-0.5 bg-theme-tertiary rounded">Esc</kbd> Cerrar</span>
            </div>
            <span>Ctrl+K</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SearchModal;
