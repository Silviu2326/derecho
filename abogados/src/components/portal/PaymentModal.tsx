// Payment Modal Component
// Modal for processing invoice payments

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Lock, X, Check, AlertCircle, Loader2,
  DollarSign, FileText, Calendar, ChevronRight
} from 'lucide-react';
import { useInvoicePayments } from '@/hooks/usePayments';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    amount: number;
    concept: string;
    caseTitle?: string;
    dueDate: string;
  } | null;
  client: {
    email: string;
    name: string;
  };
}

export function PaymentModal({ isOpen, onClose, invoice, client }: PaymentModalProps) {
  const { paymentState, isProcessing, error, payInvoice, resetState, formatAmount } = useInvoicePayments();
  const [showDetails, setShowDetails] = useState(false);

  const handlePay = async () => {
    if (!invoice) return;

    const result = await payInvoice(invoice, client);
    
    if (result.success) {
      // Wait a bit then close
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen || !invoice) return null;

  const isSuccess = paymentState === 'success';
  const isError = paymentState === 'error';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-theme-secondary border border-theme rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-500/20 to-emerald-600/5 p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-theme-primary">¡Pago realizado!</h2>
                <p className="text-theme-secondary mt-1">Tu factura ha sido pagada correctamente</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-primary">Pagar Factura</h2>
                  <p className="text-theme-secondary">Secure payment with Stripe</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-400 font-medium">Confirmación</p>
                  <p className="text-sm text-theme-secondary mt-1">
                    ID: {invoice.id}
                  </p>
                </div>
                <p className="text-sm text-theme-muted">
                  Recibirás un email de confirmación en breve
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* Invoice Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-theme-muted" />
                      <span className="text-theme-primary font-medium">{invoice.id}</span>
                    </div>
                    <span className="text-theme-secondary text-sm">{invoice.concept}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-theme-tertiary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-theme-muted" />
                      <span className="text-theme-secondary">Vencimiento</span>
                    </div>
                    <span className="text-theme-primary">
                      {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between p-3 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    <span>Detalles del pago</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-theme-tertiary/30 rounded-xl space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-theme-muted">Subtotal</span>
                            <span className="text-theme-primary">{formatAmount(invoice.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-theme-muted">IVA (21%)</span>
                            <span className="text-theme-primary">{formatAmount(invoice.amount * 0.21)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-theme font-medium">
                            <span className="text-theme-primary">Total</span>
                            <span className="text-emerald-400">{formatAmount(invoice.amount * 1.21)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error Message */}
                {isError && error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pagar {formatAmount(invoice.amount * 1.21)}
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-theme-muted">
                  <Lock className="w-3 h-3" />
                  <span>Pago seguro con Stripe. Tus datos están protegidos.</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PaymentModal;
