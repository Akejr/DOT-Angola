import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useSocialProof } from '@/hooks/useSocialProof';

const SocialProofNotification = () => {
  const { currentNotification, isVisible, maskCustomerName } = useSocialProof();

  if (!currentNotification || !isVisible) return null;

  // Extrair informações da venda
  const maskedName = maskCustomerName(currentNotification.customer_name);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.5 
          }}
          className="fixed top-16 right-4 z-[99999]"
          style={{ 
            position: 'fixed',
            top: '70px',
            right: '16px',
            zIndex: 99999
          }}
                  >
            <div className="bg-white shadow-xl border border-gray-300 text-gray-800 rounded-lg min-w-[220px] max-w-[280px]">
            <div className="px-3 py-2 flex items-center space-x-2">
              {/* Ícone */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-shrink-0"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
              </motion.div>

              {/* Conteúdo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm text-gray-700 leading-tight">
                  <span className="font-semibold text-gray-900">{maskedName}</span> comprou com a DOT
                </p>
              </motion.div>

              {/* Badge DOT */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-shrink-0"
              >
                <div className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                  DOT
                </div>
              </motion.div>
            </div>

            {/* Barra de progresso */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-0.5 bg-blue-500/30"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofNotification; 