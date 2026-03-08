// ===============================
// Profile.jsx
// Composant 100% Frontend (Mock Data)
// Le backend pourra remplacer les données plus tard
// ===============================

import { useState, useEffect } from "react";
import { Calendar, Settings } from "lucide-react";
import supabase from "../services/supabase.js";

// Composant PostImage ultra-simple comme dans Posts.jsx
function PostImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!loaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#e5e7eb'
        }} />
      )}
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
          display: 'block'
        }}
      />
    </div>
  );
}

export default function Profile() {

  // 1️⃣ ÉTAT POUR LA GESTION DE LA PHOTO DE PROFIL
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // DONNÉES UTILISATEUR (RÉCUPÉRÉES DE SUPABASE)
  const [profile, setProfile] = useState({
    id: null,
    name: "Chargement...",
    username: "",
    bio: "",
    avatar: null,
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    postsCount: 0,
    followers: 0,
    following: 0,
    joinedAt: ""
  });

  // Charger les données utilisateur au montage
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setMessage("Vous devez être connecté pour voir votre profil.");
          return;
        }

        setCurrentUser(user);

        // Récupérer les données du profil depuis la table profiles
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur profil:', error);
          setMessage("Erreur lors du chargement du profil.");
          return;
        }

        if (profileData) {
          setProfile({
            id: profileData.id,
            name: profileData.name || user.email?.split('@')[0] || 'Utilisateur',
            username: profileData.username || '',
            bio: profileData.bio || '',
            avatar: profileData.avatar_url,
            cover: profileData.cover_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            postsCount: profileData.posts_count || 0,
            followers: profileData.followers_count || 0,
            following: profileData.following_count || 0,
            joinedAt: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Date inconnue'
          });
        } else {
          // Créer un profil par défaut si inexistant
          const defaultProfile = {
            id: user.id,
            name: user.email?.split('@')[0] || 'Utilisateur',
            username: '',
            bio: '',
            avatar: null,
            cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            postsCount: 0,
            followers: 0,
            following: 0,
            joinedAt: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          };
          setProfile(defaultProfile);
        }

        // Charger les posts de l'utilisateur
        await loadUserPosts(user.id);
      } catch (err) {
        console.error('Erreur:', err);
        setMessage("Erreur lors du chargement du profil.");
      }
    };

    loadUserProfile();
  }, []);

  // Charger les posts de l'utilisateur
  const loadUserPosts = async (userId) => {
    setPostsLoading(true);
    try {
      console.log("🔄 Chargement des posts de l'utilisateur...", userId);
      
      // Vérifier d'abord si l'utilisateur existe
      const { data: userCheck, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('❌ Erreur vérification utilisateur:', userError);
      } else {
        console.log('✅ Utilisateur vérifié:', userCheck);
      }
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(' Erreur chargement posts:', error);
        console.error(' Détails erreur:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        setMessage("Erreur lors du chargement des publications: " + error.message);
        return;
      }

      console.log("Posts récupérés:", data);
      console.log("Nombre de posts:", data?.length || 0);
      
      if (data && data.length > 0) {
        data.forEach((post, index) => {
          console.log(`Post ${index + 1}:`, {
            id: post.id,
            title: post.title,
            image_url: post.image_url,
            created_at: post.created_at
          });
        });
      }
      
      setUserPosts(data || []);
      setProfile(prev => ({ ...prev, postsCount: data?.length || 0 }));
    } catch (err) {
      console.error(' Erreur générale loadUserPosts:', err);
      setMessage("Erreur inattendue lors du chargement des posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  // GESTION DES ONGLETS
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);

  // GESTION DE LA PHOTO DE PROFIL AVEC SUPABASE
  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  };

  // Upload de la photo de profil
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage("Vous devez être connecté pour modifier votre photo de profil.");
        setLoading(false);
        return;
      }

      // Uploader l'image dans le bucket avatars de Supabase
      const fileName = sanitizeFileName(`${currentUser.id}_${Date.now()}_${file.name}`);
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) {
        setMessage("Erreur upload : " + uploadError.message);
        setLoading(false);
        return;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Mettre à jour la table profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        setMessage("Erreur mise à jour : " + updateError.message);
        setLoading(false);
        return;
      }

      //Mettre à jour l'état local
      setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      setProfileImage(avatarUrl);
      setMessage("Photo de profil mise à jour avec succès !");
      
    } catch (err) {
      console.error('Erreur:', err);
      setMessage("Erreur inattendue lors de l'upload.");
    } finally {
      setLoading(false);
    }
  };

  // Upload de la photo de couverture
  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage("Vous devez être connecté pour modifier votre photo de couverture.");
        setLoading(false);
        return;
      }

      console.log("🔄 Upload de la couverture...");

      // Uploader l'image dans le bucket avatars (temporairement, même bucket que profil)
      const fileName = sanitizeFileName(`${currentUser.id}_cover_${Date.now()}_${file.name}`);
      
      const { error: uploadError } = await supabase.storage
        .from("avatars") // Utiliser le bucket avatars qui existe déjà
        .upload(fileName, file);

      if (uploadError) {
        console.error(" Erreur upload couverture:", uploadError);
        setMessage("Erreur upload couverture : " + uploadError.message);
        setLoading(false);
        return;
      }

      console.log("Upload couverture réussi");

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const coverUrl = urlData.publicUrl;
      console.log(" URL couverture générée:", coverUrl);

      // Mettre à jour la table profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          cover_url: coverUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error("❌ Erreur mise à jour couverture:", updateError);
        setMessage("Erreur mise à jour couverture : " + updateError.message);
        setLoading(false);
        return;
      }

      console.log("✅ Couverture mise à jour en base");
      
      //Mettre à jour l'état local
      setProfile(prev => ({ ...prev, cover: coverUrl }));
      setMessage("✅ Photo de couverture mise à jour avec succès !");
      setIsEditingCover(false);
      
    } catch (err) {
      console.error('❌ Erreur upload couverture:', err);
      setMessage("Erreur inattendue lors de l'upload de la couverture.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage("Vous devez être connecté pour modifier votre photo de profil.");
        setLoading(false);
        return;
      }

      // Supprimer l'URL de la base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          avatar_url: null,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        setMessage("Erreur suppression : " + updateError.message);
        setLoading(false);
        return;
      }

      //  Mettre à jour l'état local
      setProfile(prev => ({ ...prev, avatar: null }));
      setProfileImage(null);
      setMessage("✅ Photo de profil supprimée avec succès !");
      
    } catch (err) {
      console.error('Erreur:', err);
      setMessage("Erreur inattendue lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  //RENDER
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-8 ">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        {/* ================= COVER IMAGE ================= */}
        <div className="relative">
          <div
            className="h-56 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.cover})` }}
          />
          
          {/* Bouton pour modifier la couverture */}
          <button
            onClick={() => setIsEditingCover(!isEditingCover)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition"
          >
            <Settings size={16} />
          </button>
        </div>
        
        {/* Section édition de la couverture */}
        {isEditingCover && (
          <div className="bg-gray-100 p-4 border-b border-gray-200">
            <div className="max-w-5xl mx-auto">
              <h4 className="text-sm font-semibold mb-2">Modifier la photo de couverture</h4>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={loading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                <button
                  onClick={() => setIsEditingCover(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4">

          {/* ================= HEADER PROFIL ================= */}
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between mt-6">

            {/* Avatar + Infos */}
            <div className="flex items-end gap-12">

              {/* Avatar */}
              <div className="relative">
                {profile.avatar || profileImage ? (
                  <img
                    src={profile.avatar || profileImage}
                    alt="avatar"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover -mt-16"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 -mt-16 flex items-center justify-center">
                    <span className="text-gray-600 text-4xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Bouton pour ajouter/modifier la photo */}
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-lg"
                >
                  <Settings size={16} />
                </button>
              </div>

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
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="mt-4! md:mt-0 text-black flex items-center gap-2 border px-4! py-2! rounded-lg hover:bg-gray-50 transition"
            >
              <Settings size={16} />
              {isEditingProfile ? 'Annuler' : 'Modifier le profil'}
            </button>

          </div>

          {/* ================= SECTION ÉDITION PROFIL ================= */}
          {isEditingProfile && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Gérer la photo de profil</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ajouter une photo de profil
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                </div>
                
                {(profile.avatar || profileImage) && (
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.avatar || profileImage}
                      alt="Aperçu"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {loading ? 'Suppression...' : 'Supprimer la photo'}
                    </button>
                  </div>
                )}
                
                {!profile.avatar && !profileImage && (
                  <p className="text-gray-500 text-sm">
                    Vous n'avez pas encore de photo de profil. Ajoutez-en une pour personnaliser votre profil !
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= ONGLET ================= */}
          <div className="mt-16! mb-6! px-6!"> {/* ⬅ marge plus grande pour détacher des infos du haut */}
            <div className="bg-gray-200 text-black font-bold rounded-full p-1 flex">

              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-2! rounded-full text-sm font-medium transition ${
                  activeTab === "posts"
                    ? "bg-white"
                    : "hover:bg-gray-400"
                }`}
              >
                Publications
              </button>

              <button
                onClick={() => setActiveTab("media")}
                className={`flex-1 py-2! rounded-full text-sm font-medium transition ${
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
              <div>
                {postsLoading ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Chargement des publications...</p>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Aucune publication pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userPosts.map((post) => (
                      <div key={post.id} className="aspect-square group relative">
                        {post.image_url ? (
                          <>
                            <PostImage
                              src={post.image_url}
                              alt={post.title || "Post"}
                              onClick={() => console.log('Image cliquée:', post.image_url)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                                <p className="text-sm font-semibold">{post.title}</p>
                                <p className="text-xs">{new Date(post.created_at).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Pas d'image</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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