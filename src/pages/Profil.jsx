import { User } from "lucide-react";

function Profil() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-white px-6">
      
      <div className="text-center max-w-md">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-md">
            <User size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Profil en préparation
        </h1>

        <p className="text-gray-600">
          Cette section sera bientôt disponible.  
          Nous finalisons les derniers détails.
        </p>

      </div>
    </div>
  );
}

export default Profil;
