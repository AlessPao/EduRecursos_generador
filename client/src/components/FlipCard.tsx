import React, { ReactNode, useState } from "react";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-64 cursor-pointer perspective transition-all duration-300 hover:shadow-lg"
      onClick={() => setFlipped((f) => !f)}
      aria-label="Tarjeta interactiva - haz clic para voltear"
    >
      <div 
        className={`absolute w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Card */}
        <div 
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-indigo-100"
        >
          <div className="text-center text-lg">{front}</div>
          <div className="absolute bottom-3 right-3">
            <div className="text-xs text-indigo-400 animate-pulse">Clic para ver respuesta</div>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl"></div>
        </div>

        {/* Back Card */}
        <div 
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md p-6 flex flex-col items-center justify-center rotate-y-180 border border-green-100"
        >
          <div className="text-center">{back}</div>
          <div className="absolute bottom-3 right-3">
            <div className="text-xs text-green-400">Clic para volver</div>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-xl"></div>
        </div>
      </div>

      {/* Card Effects */}
      <div className={`absolute inset-0 bg-black opacity-0 rounded-xl transition-opacity duration-700 ${flipped ? 'z-10 opacity-5' : '-z-10'}`}></div>
      
      <style jsx>{`
        .perspective { 
          perspective: 1500px; 
        }
        .transform-style-preserve-3d { 
          transform-style: preserve-3d; 
        }
        .backface-hidden { 
          backface-visibility: hidden; 
        }
        .rotate-y-180 { 
          transform: rotateY(180deg); 
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FlipCard;