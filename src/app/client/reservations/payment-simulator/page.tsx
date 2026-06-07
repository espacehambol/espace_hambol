'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const intent = searchParams.get('intent');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');

  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleConfirm = async () => {
    setStatus('PROCESSING');
    try {
      const res = await fetch('/api/client/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: intent, status: 'SUCCESS' })
      });
      if (res.ok) {
        setStatus('SUCCESS');
        setTimeout(() => {
          router.push('/client/reservations'); // Redirect to reservations list
        }, 3000);
      } else {
        setStatus('ERROR');
      }
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
    }
  };

  const handleCancel = async () => {
    setStatus('PROCESSING');
    try {
      await fetch('/api/client/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: intent, status: 'FAILED' })
      });
      setStatus('ERROR');
      setTimeout(() => {
        router.push('/client/reservations');
      }, 3000);
    } catch (e) {
      setStatus('ERROR');
    }
  };

  if (!intent) {
    return <div className="p-20 text-center">Invalid Payment Link</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-[#8B3A1A]/10 text-[#8B3A1A] rounded-full flex items-center justify-center mx-auto text-2xl">
          💳
        </div>
        
        <h1 className="text-2xl font-bold font-title text-gray-900">Paiement Sécurisé</h1>
        
        {status === 'IDLE' && (
          <>
            <p className="text-gray-500 text-sm">Ceci est un simulateur de paiement. En production, vous serez redirigé vers l&apos;interface de CinetPay ou Wave.</p>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant à payer :</span>
                <span className="font-bold text-[#8B3A1A]">{Number(amount).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Moyen de paiement :</span>
                <span className="font-medium text-gray-900">{method}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                <span className="text-gray-400">ID Transaction :</span>
                <span className="font-mono text-gray-400">{intent}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={handleConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95"
              >
                Confirmer le Paiement (Simulation)
              </button>
              <button 
                onClick={handleCancel}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all"
              >
                Annuler
              </button>
            </div>
          </>
        )}

        {status === 'PROCESSING' && (
          <div className="py-10 space-y-4">
            <div className="w-10 h-10 border-4 border-[#8B3A1A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-medium">Traitement de la transaction...</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900">Paiement Réussi !</h2>
            <p className="text-gray-500 text-sm">Votre réservation est maintenant confirmée. Redirection en cours...</p>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
              ✕
            </div>
            <h2 className="text-xl font-bold text-gray-900">Échec du Paiement</h2>
            <p className="text-gray-500 text-sm">La transaction a été annulée ou a échoué. Redirection...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <PaymentSimulatorContent />
    </Suspense>
  );
}
