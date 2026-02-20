import React from 'react'
import { Hammer } from 'lucide-react';
function Notifications() {
    return (

    
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 px-6">
      
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 text-center border border-gray-100">

      
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-md animate-bounce">
            <Hammer size={36} />
          </div>
        </div>

       
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Section en cours de développement
        </h1>

       
        <p className="text-gray-600 mb-8 leading-relaxed">
          Cette fonctionnalité est actuellement en construction.  
          Nous travaillons activement pour vous offrir une expérience optimale.
        </p>

       
      </div>

    </div>
  );
}

export default Notifications
