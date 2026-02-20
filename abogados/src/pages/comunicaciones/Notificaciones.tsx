// M6 - Comunicaciones: Notificaciones
// Centro de notificaciones push y email

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Mail, Smartphone, Settings, Search, Filter,
  Check, X, Clock, AlertCircle, Info, CheckCircle,
  Trash2, Eye, RefreshCw, Send, Plus
} from 'lucide-react';

// Datos mock
const notificacionesMock = [
  { id: 1, tipo: 'push', titulo: 'Nueva factura recibida', mensaje: 'Se ha generado una factura por €1.500', fecha: '2024-05-20 10:30', leida: false, prioridad: 'alta' },
  { id: 2, tipo: 'email', titulo: 'Recordatorio de audiencia', mensaje: 'Audiencia mañana a las 10:00 en Juzgado de Primera Instancia', fecha: '2024-05-20 09:15', leida: true, prioridad: 'alta' },
  { id: 3, tipo: 'push', titulo: 'Caso actualizado', mensaje: 'El caso EXP-2024-001 ha cambiado a "En juicio"', fecha: '2024-05-19 16:45', leida: true, prioridad: 'media' },
  { id: 4, tipo: 'email', titulo: 'Documento firmado', mensaje: 'El documento "Contrato_arrendamiento.pdf" ha sido firmado', fecha: '2024-05-19 14:20', leida: true, prioridad: 'baja' },
  { id: 5, tipo: 'sms', titulo: 'Cita confirmada', mensaje: 'Su cita con el abogado ha sido confirmada para el 22/05', fecha: '2024-05-18 11:00', leida: true, prioridad: 'media' },
];

const plantillasMock = [
  { id: 1, nombre: 'Recordatorio de pago', tipo: 'email', evento: 'factura_vencida' },
  { id: 2, nombre: 'Nueva factura', tipo: 'email', evento: 'factura_creada' },
  { id: 3, nombre: 'Cambio de estado', tipo: 'push', evento: 'caso_actualizado' },
  { id: 4, nombre: 'Recordatorio audiencia', tipo: 'email_push', evento: 'audiencia_24h' },
];

const stats = {
  total: 156,
  noLeidas: 12,
  push: 45,
  email: 89,
  sms: 22,
};

export default function ComunicacionesNotificaciones() {
  const [activeTab, setActiveTab] = useState('todas');
  const [notificaciones, setNotificaciones] = useState(notificacionesMock);
  const [searchTerm, setSearchTerm] = useState('');

  const filtradas = notificaciones.filter(n => {
    const matchesSearch = n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'todas') return matchesSearch;
    if (activeTab === 'noLeidas') return matchesSearch && !n.leida;
    if (activeTab === 'push') return matchesSearch && n.tipo === 'push';
    if (activeTab === 'email') return matchesSearch && n.tipo === 'email';
    if (activeTab === 'sms') return matchesSearch && n.tipo === 'sms';
    return matchesSearch;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'text-red-400 bg-red-400/10';
      case 'media': return 'text-amber-400 bg-amber-400/10';
      case 'baja': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const markAsRead = (id: number) => {
    setNotificaciones(notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  const deleteNotificacion = (id: number) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Notificaciones</h1>
          <p className="text-theme-secondary">Centro de notificaciones y comunicaciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">
          <Settings className="w-4 h-4" />
          Configurar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <p className="text-sm text-theme-secondary">Total</p>
          <p className="text-2xl font-bold text-theme-primary">{stats.total}</p>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <p className="text-sm text-theme-secondary">Sin leer</p>
          <p className="text-2xl font-bold text-amber-400">{stats.noLeidas}</p>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <p className="text-sm text-theme-secondary">Push</p>
          <p className="text-2xl font-bold text-purple-400">{stats.push}</p>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <p className="text-sm text-theme-secondary">Email</p>
          <p className="text-2xl font-bold text-blue-400">{stats.email}</p>
        </div>
        <div className="bg-theme-card border border-theme rounded-xl p-4">
          <p className="text-sm text-theme-secondary">SMS</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.sms}</p>
        </div>
      </div>

      {/* Tabs y filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 border-b border-theme">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'noLeidas', label: 'Sin leer' },
            { id: 'push', label: 'Push' },
            { id: 'email', label: 'Email' },
            { id: 'sms', label: 'SMS' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs pl-10 pr-4 py-2 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary bg-theme-card border border-theme rounded-xl"
        >
          <Check className="w-4 h-4" />
          Marcar todo leído
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-2">
        {filtradas.length === 0 ? (
          <div className="bg-theme-card border border-theme rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 text-theme-muted mx-auto mb-4" />
            <p className="text-theme-primary font-medium">No hay notificaciones</p>
            <p className="text-theme-secondary text-sm mt-1">No se encontraron notificaciones con los filtros aplicados</p>
          </div>
        ) : (
          filtradas.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-theme-card border rounded-xl p-4 hover:border-accent/50 transition-colors ${
                notif.leida ? 'border-theme' : 'border-amber-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  notif.tipo === 'push' ? 'bg-purple-500/20 text-purple-400' :
                  notif.tipo === 'email' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {getTipoIcon(notif.tipo)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${notif.leida ? 'text-theme-secondary' : 'text-theme-primary'}`}>
                      {notif.titulo}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getPrioridadColor(notif.prioridad)}`}>
                      {notif.prioridad}
                    </span>
                    {!notif.leida && (
                      <span className="w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-theme-secondary mt-1">{notif.mensaje}</p>
                  <p className="text-xs text-theme-muted mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {notif.fecha}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!notif.leida && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 text-theme-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      title="Marcar como leído"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotificacion(notif.id)}
                    className="p-2 text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Plantillas de notificaciones */}
      <div className="bg-theme-card border border-theme rounded-xl p-6">
        <h3 className="font-semibold text-theme-primary mb-4">Plantillas de Notificaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {plantillasMock.map((plantilla) => (
            <div key={plantilla.id} className="p-3 bg-theme-tertiary/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                {getTipoIcon(plantilla.tipo)}
                <span className="text-xs px-2 py-0.5 bg-theme-tertiary rounded text-theme-secondary capitalize">
                  {plantilla.tipo}
                </span>
              </div>
              <p className="text-sm font-medium text-theme-primary">{plantilla.nombre}</p>
              <p className="text-xs text-theme-muted mt-1">{plantilla.evento}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
