// ===============================
// Profile.jsx
// Composant 100% Frontend (Mock Data)
// Le backend pourra remplacer les données plus tard
// ===============================

import { useState } from "react";
import { Calendar, Settings } from "lucide-react";

export default function Profile() {

  // ==========================================
  // 1️⃣ DONNÉES MOCKÉES (À REMPLACER PAR BACKEND)
  // ==========================================
  const profile = {
    id: 1,
    name: "Sophie Martin",
    username: "sophiem",
    bio: "Passionnée de photographie et de voyage 📸✈️",
    avatar: "https://i.pravatar.cc/300",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    postsCount: 156,
    followers: 1284,
    following: 432,
    joinedAt: "Mars 2024"
  };

  // ==========================================
  // Posts fictifs (backend remplacera ça)
  // ==========================================
  const posts = [
    { id: 1, image: "https://picsum.photos/400?random=1" },
    { id: 2, image: "https://picsum.photos/400?random=2" },
    { id: 3, image: "https://picsum.photos/400?random=3" },
    { id: 4, image: "https://picsum.photos/400?random=4" },
    { id: 5, image: "https://picsum.photos/400?random=5" },
    { id: 6, image: "https://picsum.photos/400?random=6" },
  ];

  // ==========================================
  // 2️⃣ Gestion des onglets
  // ==========================================
  const [activeTab, setActiveTab] = useState("posts");

  // ==========================================
  // 3️⃣ RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-8 ">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        {/* ================= COVER IMAGE ================= */}
        <div
          className="h-56 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.cover})` }}
        />

        <div className="max-w-5xl mx-auto px-4">

          {/* ================= HEADER PROFIL ================= */}
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between mt-6">

            {/* Avatar + Infos */}
            <div className="flex items-end gap-12">

              {/* Avatar */}
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover -mt-16"
              />

              {/* Nom + username + bio */}
              <div className="space-y-3">
                <h1 className="text-2xl text-black font-bold">{profile.name}</h1>
                <p className="text-gray-500">@{profile.username}</p>
                <p className="mt-2 text-black">{profile.bio}</p>

                {/* Stats */}
                <div className="flex text-black gap-6 mt-3 text-sm">
                  <span><strong>{profile.postsCount}</strong> Publications</span>
                  <span><strong>{profile.followers}</strong> Abonnés</span>
                  <span><strong>{profile.following}</strong> Abonnements</span>
                </div>

                {/* Date d'inscription */}
                <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                  <Calendar size={16} />
                  <span>Inscrit en {profile.joinedAt}</span>
                </div>
              </div>
            </div>

            {/* Bouton Modifier */}
            <button className="mt-4 md:mt-0 text-black flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              <Settings size={16} />
              Modifier le profil
            </button>

          </div>

          {/* ================= ONGLET ================= */}
          <div className="mt-16 mb-6 px-6"> {/* ⬅ marge plus grande pour détacher des infos du haut */}
            <div className="bg-gray-200 text-black font-bold rounded-full p-1 flex">

              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "posts"
                    ? "bg-white"
                    : "hover:bg-gray-400"
                }`}
              >
                Publications
              </button>

              <button
                onClick={() => setActiveTab("media")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "media"
                    ? "bg-white"
                    : "hover:bg-gray-400"
                }`}
              >
                Médias
              </button>

              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "likes"
                    ? "bg-white"
                    : "hover:bg-gray-400"
                }`}
              >
                J'aime
              </button>
            </div>
          </div>

          {/* ================= CONTENU ================= */}
          <div className="mt-6">

            {activeTab === "posts" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="aspect-square">
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "media" && (
              <div className="text-center text-gray-500 py-10">
                Aucun média disponible.
              </div>
            )}

            {activeTab === "likes" && (
              <div className="text-center text-gray-500 py-10">
                Aucun contenu aimé.
              </div>
            )}

          </div>

        </div>
      </div> {/* FIN CONTAINER PRINCIPAL */}
    </div>
  );
}