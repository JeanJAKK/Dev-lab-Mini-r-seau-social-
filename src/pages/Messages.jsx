import React from "react";
import { MessageSquare, Clock3 } from "lucide-react";

export default function Messages() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 px-6">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-md">
            <Clock3 size={36} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Section en cours de developpement
        </h1>

        <p className="text-gray-600 mb-2 leading-relaxed">
          La messagerie sera bientot disponible.
        </p>

        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
          <MessageSquare size={16} />
          Disponible prochainement
        </p>
      </div>
    </div>
  );
}
