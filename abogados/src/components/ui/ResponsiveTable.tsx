// Responsive Table Component
// Table that adapts to mobile with card view

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Eye, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  actions?: Array<{
    icon: React.ElementType;
    label: string;
    onClick: (item: T) => void;
  }>;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  actions,
  emptyMessage = 'No hay datos'
}: ResponsiveTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map(c => c.key)
  );

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison * -1;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-theme-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-theme-tertiary/50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`text-left p-4 text-sm font-medium text-theme-secondary ${
                    column.sortable ? 'cursor-pointer hover:text-theme-primary' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="text-left p-4 text-sm font-medium text-theme-secondary">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const key = keyExtractor(item);
              return (
                <motion.tr
                  key={key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`border-t border-theme hover:bg-theme-tertiary/30 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(column => (
                    <td key={column.key} className={`p-4 text-theme-primary ${column.className || ''}`}>
                      {column.render 
                        ? column.render(item) 
                        : String((item as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => action.onClick(item)}
                            className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
                            title={action.label}
                          >
                            <action.icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="lg:hidden space-y-3">
        {sortedData.map((item, index) => {
          const key = keyExtractor(item);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`bg-theme-card border border-theme rounded-xl p-4 ${
                onRowClick ? 'cursor-pointer hover:border-accent/50' : ''
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, i) => (
                <div key={column.key} className={`flex justify-between items-center py-2 ${
                  i === 0 ? 'pb-3 border-b border-theme' : ''
                }`}>
                  <span className="text-sm text-theme-muted">{column.header}</span>
                  <span className="text-sm text-theme-primary font-medium">
                    {column.render 
                      ? column.render(item) 
                      : String((item as Record<string, unknown>)[column.key] ?? '')}
                  </span>
                </div>
              ))}
              
              {actions && (
                <div className="flex justify-end gap-2 pt-3 border-t border-theme mt-3" onClick={e => e.stopPropagation()}>
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => action.onClick(item)}
                      className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg"
                    >
                      <action.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ResponsiveTable;
