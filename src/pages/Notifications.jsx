import React, { useState, useEffect } from 'react';
import { 
  Trash2, CheckCheck, Heart, MessageCircle, UserPlus,
  Share2, ArrowLeft, Eye, MoreVertical, Pin,
  Bell, Sparkles, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase.js';

export default function CentreNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [onglet, setOnglet] = useState('toutes');

  useEffect(() => {
    chargerNotifications();
  }, []);

  const chargerNotifications = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('destinataire_id', user.user.id)
        .order('cree_le', { ascending: false });

      const expediteursIds = [...new Set(data?.map(n => n.expediteur_id) || [])];
      let profils = {};
      let followStatus = {};

      if (expediteursIds.length) {
        const { data: p } = await supabase.from('profiles').select('id, name, avatar_url').in('id', expediteursIds);
        profils = Object.fromEntries(p?.map(p => [p.id, p]) || []);
        
        const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.user.id);
        followStatus = Object.fromEntries(follows?.map(f => [f.following_id, true]) || []);
      }

      const pinnedIds = JSON.parse(localStorage.getItem('pinned_notifications') || '[]');

      const nouvellesNotifs = (data || []).map(n => ({
        id: n.id,
        type: n.type,
        lu: n.est_lu,
        expediteur_id: n.expediteur_id,
        nom: profils[n.expediteur_id]?.name || 'Utilisateur',
        avatar: profils[n.expediteur_id]?.avatar_url,
        message: n.message,
        publication_id: n.publication_id,
        date: n.cree_le,
        jeSuit: followStatus[n.expediteur_id] || false,
        pinned: pinnedIds.includes(n.id)
      }));

      setNotifications(nouvellesNotifs);
      
      const nouvellesNonLues = nouvellesNotifs.filter(n => !n.lu).length;
      // Notification sound removed: no audio playback by default.
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const marquerLu = async (id) => {
    await supabase.from('notifications').update({ est_lu: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    setMenuOpen(null);
  };

  const toutMarquerLu = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from('notifications').update({ est_lu: true }).eq('destinataire_id', user.user.id).eq('est_lu', false);
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    }
  };

  const supprimer = async (id) => {
    const pinnedIds = JSON.parse(localStorage.getItem('pinned_notifications') || '[]');
    const newPinned = pinnedIds.filter(pid => pid !== id);
    localStorage.setItem('pinned_notifications', JSON.stringify(newPinned));
    
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setMenuOpen(null);
  };

  const toutSupprimer = async () => {
    if (!confirm('Supprimer toutes les notifications ?')) return;
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from('notifications').delete().eq('destinataire_id', user.user.id);
      setNotifications([]);
      localStorage.setItem('pinned_notifications', JSON.stringify([]));
    }
  };

  const suivreUtilisateur = async (id, suitActuellement) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    if (suitActuellement) {
      await supabase.from('follows').delete().eq('follower_id', user.user.id).eq('following_id', id);
    } else {
      await supabase.from('follows').insert({ follower_id: user.user.id, following_id: id });
    }
    setNotifications(prev => prev.map(n => n.expediteur_id === id ? { ...n, jeSuit: !suitActuellement } : n));
    setMenuOpen(null);
  };

  const epingler = (id) => {
    const pinnedIds = JSON.parse(localStorage.getItem('pinned_notifications') || '[]');
    let newPinned;
    if (pinnedIds.includes(id)) {
      newPinned = pinnedIds.filter(pid => pid !== id);
    } else {
      newPinned = [...pinnedIds, id];
    }
    localStorage.setItem('pinned_notifications', JSON.stringify(newPinned));
    
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
    setMenuOpen(null);
  };

  const allerVoirPublication = (pubId) => {
    if (pubId) navigate(`/home/post/${pubId}`);
  };

  const tempsDepuis = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const heures = Math.floor(minutes / 60);
    const jours = Math.floor(heures / 24);

    if (minutes < 1) return `à l'instant`;
    if (minutes < 60) return `${minutes} min`;
    if (heures < 24) return `${heures} h`;
    return `${jours} j`;
  };

  const getTypeIcone = (type, size = 10) => {
    const icons = {
      like: <Heart size={size} color="white" />,
      comment: <MessageCircle size={size} color="white" />,
      follow: <UserPlus size={size} color="white" />,
      share: <Share2 size={size} color="white" />
    };
    return icons[type] || <Bell size={size} color="white" />;
  };

  const getTypeCouleur = (type) => {
    const couleurs = { like: '#ef4444', comment: '#3b82f6', follow: '#10b981', share: '#8b5cf6' };
    return couleurs[type] || '#6b7280';
  };

  const notifsFiltrees = notifications
    .filter(n => {
      if (onglet === 'nonLus' && n.lu) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    
  const nonLus = notifications.filter(n => !n.lu).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 size={32} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full sm:w-[70%] max-w-[1100px] mx-auto px-0 sm:px-3 py-4">
        
        {/* Header avec titre et filtres sur une ligne */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-purple-100/30 mb-4 overflow-hidden">
          <div className="px-5 py-4">
            <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
              {/* Titre */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <Bell size={24} className="text-purple-600" />
                  {nonLus > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {nonLus}
                    </span>
                  )}
                </div>
                <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Notifications
                </h1>
              </div>

              {/* Actions à droite */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toutMarquerLu}
                  disabled={!notifications.length}
                  className={`p-2 rounded-xl border border-gray-200 transition-all duration-200 ${notifications.length ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                  title="Tout marquer lu"
                >
                  <CheckCheck size={16} />
                </button>
                <button
                  onClick={toutSupprimer}
                  disabled={!notifications.length}
                  className={`p-2 rounded-xl border border-gray-200 transition-all duration-200 ${notifications.length ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                  title="Tout supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>


          {/* Onglets */}
          <div className="flex border-t border-gray-100">
            <button
              onClick={() => setOnglet('toutes')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${onglet === 'toutes' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={14} />
                Toutes
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{notifications.length}</span>
              </div>
            </button>
            <button
              onClick={() => setOnglet('nonLus')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${onglet === 'nonLus' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Bell size={14} />
                Non lues
                {nonLus > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{nonLus}</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="space-y-1">
          {notifsFiltrees.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg shadow-purple-100/30">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Bell size={32} className="text-purple-400" />
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-2">Aucune notification</p>
              <p className="text-sm text-gray-400">Revenez plus tard pour voir vos interactions !</p>
            </div>
          ) : (
            notifsFiltrees.map(notif => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${notif.pinned ? 'ring-2 ring-yellow-400 ring-offset-2 shadow-lg' : ''} ${!notif.lu ? 'border-2 border-purple-300' : 'border border-gray-100'}`}
              >
                <div className="p-1 sm:p-2">
                  <div className="flex gap-3 relative">
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={notif.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.nom)}&background=8b5cf6&color=fff`}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-md cursor-pointer hover:opacity-90 transition"
                        onClick={() => navigate(`/home/profile/${notif.expediteur_id}`)}
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: getTypeCouleur(notif.type) }}
                      >
                        {getTypeIcone(notif.type, 12)}
                      </div>
                      {notif.pinned && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Pin size={12} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="font-semibold text-base cursor-pointer hover:text-purple-600 transition"
                              onClick={() => navigate(`/home/profile/${notif.expediteur_id}`)}
                            >
                              {notif.nom}
                            </span>
                            <span className="text-sm text-gray-600">{notif.message}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              ⏱️ {tempsDepuis(notif.date)}
                            </span>
                          </div>
                        </div>

                        {/* Bouton Voir + Menu */}
                        <div className="flex items-center gap-1 shrink-0">
                          {notif.publication_id && (
                            <button
                              onClick={() => allerVoirPublication(notif.publication_id)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 transition text-blue-600 hover:text-blue-700"
                              title="Voir la publication"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setMenuOpen(menuOpen === notif.id ? null : notif.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                            title="Options"
                          >
                            <MoreVertical size={20} className="text-gray-500" />
                          </button>
                          {menuOpen === notif.id && (
                            <div className="absolute right-2 top-12 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 min-w-[180px]">
                              {!notif.lu && (
                                <button
                                  onClick={() => marquerLu(notif.id)}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 flex items-center gap-3 transition font-medium"
                                >
                                  <CheckCheck size={16} className="text-purple-500" />
                                  <span>Marquer comme lu</span>
                                </button>
                              )}
                              <button
                                onClick={() => epingler(notif.id)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-yellow-50 flex items-center gap-3 transition font-medium"
                              >
                                <Pin size={16} className="text-yellow-500" />
                                <span>{notif.pinned ? 'Désépingler' : 'Épingler'}</span>
                              </button>
                              <div className="border-t border-gray-150 my-1"></div>
                              <button
                                onClick={() => supprimer(notif.id)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition font-medium"
                              >
                                <Trash2 size={16} />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifsFiltrees.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 bg-white/50 inline-block px-4 py-1.5 rounded-full shadow-sm">
              {notifsFiltrees.length} notification{notifsFiltrees.length > 1 ? 's' : ''}
              {nonLus > 0 && ` • ${nonLus} non lue${nonLus > 1 ? 's' : ''}`}
              {notifications.filter(n => n.pinned).length > 0 && ` • 📌 ${notifications.filter(n => n.pinned).length} épinglée${notifications.filter(n => n.pinned).length > 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}