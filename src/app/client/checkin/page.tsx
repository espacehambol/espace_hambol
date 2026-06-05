'use client';

import { useState } from 'react';
import { useSite } from '@/context/SiteContext';

export default function CheckinPage() {
  const { currentSite } = useSite();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    idType: 'PASSPORT',
    idNumber: '',
    idExpiry: '',
    confirmInfo: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simuler soumission KYC
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-title font-bold text-primary italic">Check-in Digital</h1>
        <p className="text-gray-500 mt-2">Gagnez du temps à votre arrivée à {currentSite}.</p>
      </header>

      {/* Stepper */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
          <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-100'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
          <div className={`w-20 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-100'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
        </div>
      </div>

      <div className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl border border-gray-100">
        {step === 1 && (
           <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4">Vérification d&apos;Identité</h3>
                <p className="text-gray-500 text-sm">Conformément à la réglementation hôtelière, veuillez fournir une pièce d&apos;identité valide pour tous les voyageurs.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type de document</label>
                  <select 
                    value={formData.idType}
                    onChange={e => setFormData({...formData, idType: e.target.value})}
                    className="w-full bg-[#fdfbf7] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none"
                  >
                    <option value="PASSPORT">Passeport International</option>
                    <option value="CNI">Carte Nationale d&apos;Identité</option>
                    <option value="PERMIS">Permis de Conduire</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Numéro du document</label>
                  <input 
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={e => setFormData({...formData, idNumber: e.target.value})}
                    placeholder="Ex: A12345678"
                    className="w-full bg-[#fdfbf7] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.idNumber}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-lg hover:bg-primary-dk transition-all disabled:opacity-50"
              >
                Continuer
              </button>
           </div>
        )}

        {step === 2 && (
           <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4">Téléchargement</h3>
                <p className="text-gray-500 text-sm">Veuillez télécharger une photo nette de votre pièce d&apos;identité.</p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center space-y-4 hover:border-accent transition-colors cursor-pointer group">
                 <div className="text-5xl group-hover:scale-110 transition-transform">📸</div>
                 <div>
                    <p className="font-bold text-primary">Prendre une photo ou parcourir</p>
                    <p className="text-xs text-gray-400 mt-1">Formats acceptés : JPG, PNG (Max 5MB)</p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <input 
                   type="checkbox" 
                   id="confirm"
                   checked={formData.confirmInfo}
                   onChange={e => setFormData({...formData, confirmInfo: e.target.checked})}
                   className="w-5 h-5 accent-primary" 
                 />
                 <label htmlFor="confirm" className="text-xs text-gray-500 italic">Je certifie que ces informations sont exactes et conformes à l&apos;original.</label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-bold">Retour</button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.confirmInfo || loading}
                  className="flex-[2] py-5 bg-primary text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'Soumission...' : 'Finaliser mon Check-in'}
                </button>
              </div>
           </div>
        )}

        {step === 3 && (
          <div className="text-center py-10 space-y-8 animate-fade-in text-primary">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">✓</div>
            <div>
              <h3 className="text-3xl font-title font-bold">C&apos;est prêt !</h3>
              <p className="text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
                Votre check-in digital a été validé. À votre arrivée à l&apos;hôtel, présentez-vous simplement au comptoir &quot;VIP Digital&quot; pour récupérer vos clés.
              </p>
            </div>
            <a 
              href="/client" 
              className="inline-block px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
            >
              Retour au Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
