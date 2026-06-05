import Image from "next/image";

export default function GastronomyClientPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-title font-bold text-[#2A241F]">Restaurant & Bar</h1>
          <p className="text-[#6B5C4E] mt-2">Découvrez nos expériences culinaires et passez vos commandes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Reservation Table */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#2E7D1E]/10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#FDFBF9] rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-[#ECE8E4] text-[#8B3A1A]">
            📅
          </div>
          <h3 className="font-title text-xl font-bold text-[#2A241F]">Réserver une Table</h3>
          <p className="text-sm text-[#6B5C4E]">
            Assurez-vous d'avoir une table au Restaurant La Cascade ou au Bar L'Évasion.
          </p>
          <button className="px-6 py-3 bg-[#1A1208] text-white rounded-xl font-bold text-sm hover:bg-[#2A241F] transition-all">
            Nouvelle Réservation
          </button>
        </div>

        {/* Room Service */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#2E7D1E]/10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#FDFBF9] rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-[#ECE8E4] text-[#8B3A1A]">
            🛎️
          </div>
          <h3 className="font-title text-xl font-bold text-[#2A241F]">Room Service</h3>
          <p className="text-sm text-[#6B5C4E]">
            Commandez vos plats préférés directement dans votre chambre, disponible 24/7.
          </p>
          <button className="px-6 py-3 bg-[#8B3A1A] text-white rounded-xl font-bold text-sm hover:bg-[#5C2410] transition-all">
            Voir le Menu
          </button>
        </div>
      </div>

      <div>
         <h2 className="text-2xl font-title font-bold text-[#2A241F] mb-6">Vos Réservations Récentes</h2>
         <div className="bg-white rounded-3xl shadow-sm border border-[#2E7D1E]/10 p-8 text-center text-[#6B5C4E]">
            <p>Aucune réservation de restaurant prévue pour le moment.</p>
         </div>
      </div>
    </div>
  );
}
