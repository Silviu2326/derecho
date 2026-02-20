// Date Picker Component
// Simple date picker for dates

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({ value, onChange, minDate, maxDate }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange?.(newDate);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    return (
      value.getDate() === day &&
      value.getMonth() === currentMonth.getMonth() &&
      value.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl p-4 w-72">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-theme-muted" />
        </button>
        <span className="font-medium text-theme-primary">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-theme-muted" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs text-theme-muted py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          
          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              disabled={disabled}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${disabled 
                  ? 'text-theme-muted cursor-not-allowed' 
                  : 'hover:bg-theme-tertiary cursor-pointer'
                }
                ${selected 
                  ? 'bg-accent text-white' 
                  : 'text-theme-primary'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Date Range Picker
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (start: Date | undefined, end: Date | undefined) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [start, setStart] = useState<Date | undefined>(startDate);
  const [end, setEnd] = useState<Date | undefined>(endDate);

  const handleStartChange = (date: Date) => {
    setStart(date);
    onChange?.(date, end);
  };

  const handleEndChange = (date: Date) => {
    setEnd(date);
    onChange?.(start, date);
  };

  return (
    <div className="flex gap-4">
      <div>
        <label className="block text-sm text-theme-muted mb-2">Desde</label>
        <DatePicker value={start} onChange={handleStartChange} />
      </div>
      <div>
        <label className="block text-sm text-theme-muted mb-2">Hasta</label>
        <DatePicker value={end} onChange={handleEndChange} minDate={start} />
      </div>
    </div>
  );
}

export default DatePicker;
