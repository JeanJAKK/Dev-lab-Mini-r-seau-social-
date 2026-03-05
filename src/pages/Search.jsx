import React, { useEffect, useState } from "react";
import { Search as SearchIcon, UserPlus } from "lucide-react";
import supabase from "../services/supabase.js";

function Search() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const getUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(` name`)
      .order("name", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.username?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-3xl border-1 p-12! border-purple-200 rounded-3xl p-8 bg-white">
        {/* Search Bar */}
        <div className="relative mb-6 gap-12">
          <SearchIcon
            size={20}
            className="absolute left-5! top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher des personnes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full  pl-14! pr-5 py-3! rounded-full border border-gray-200 bg-white shadow-sm text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-purple-300 transition"
          />
        </div>

        {/* Tab: Utilisateurs only */}
        <div className="flex mb-6 bg-gray-100 rounded-full mt-6!">
          <button className="flex-1 py-4! text-base font-semibold text-gray-800 bg-white rounded-full shadow-sm">
            Utilisateurs
          </button>
        </div>

        {/* Users List */}
        <div className="bg-white mt-6! rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-6 animate-pulse"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/5" />
                </div>
                <div className="w-20 h-8 bg-gray-100 rounded-full" />
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Aucun utilisateur trouvé
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-5 p-2! hover:bg-purple-50 transition-all duration-200 ease-in-out transform hover:scale-102"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base truncate">
                    {user.name}
                  </p>
                </div>

                {/* Follow Button */}
                <button className="shrink-0 flex items-center gap-2 px-4! py-2! rounded-full border-1 border-purple-600 text-purple-600 font-bold text-sm font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105">
                  <UserPlus size={14} />
                  Suivre
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
