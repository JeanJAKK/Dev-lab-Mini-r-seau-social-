import React, { useState, useEffect } from 'react';
import { 
  Trash2, CheckCheck, Heart, MessageCircle, UserPlus,
  Share2, ArrowLeft, Eye, MoreVertical, Pin,
  Bell, Sparkles, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import supabase from '../services/supabase.js';

export default function CentreNotifications() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [onglet, setOnglet] = useState('toutes');

  useEffect(() => {
    chargerNotifications();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        chargerNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      chargerNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
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
        const { data: p } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', expediteursIds);
        profils = Object.fromEntries(p?.map(p => [p.id, p]) || []);
        
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.user.id);
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
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.lu) {
      setNotifications(prev => prev.map(n => 
        n.id === notif.id ? { ...n, lu: true } : n
      ));
      
      try {
        await supabase
          .from('notifications')
          .update({ est_lu: true })
          .eq('id', notif.id);
      } catch (err) {
        setNotifications(prev => prev.map(n => 
          n.id === notif.id ? { ...n, lu: false } : n
        ));
      }
    }
    
    if (notif.publication_id) {
      allerVoirPublication(notif.publication_id);
    } else if (notif.type === 'follow') {
      navigate(`/home/profile/${notif.expediteur_id}`);
    }
  };

  const marquerLu = async (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, lu: true } : n
    ));
    setMenuOpen(null);
    
    try {
      await supabase
        .from('notifications')
        .update({ est_lu: true })
        .eq('id', id);
    } catch (err) {
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, lu: false } : n
      ));
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  const toutMarquerLu = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      
      await supabase
        .from('notifications')
        .update({ est_lu: true })
        .eq('destinataire_id', user.user.id)
        .eq('est_lu', false);
    } catch (err) {
      console.error('Erreur:', err);
      await chargerNotifications();
    }
  };

  const supprimer = async (id) => {
    const pinnedIds = JSON.parse(localStorage.getItem('pinned_notifications') || '[]');
    const newPinned = pinnedIds.filter(pid => pid !== id);
    localStorage.setItem('pinned_notifications', JSON.stringify(newPinned));
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    setMenuOpen(null);
    
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      await chargerNotifications();
    }
  };

  const toutSupprimer = async () => {
    if (!confirm('Supprimer toutes les notifications ?')) return;
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        setNotifications([]);
        localStorage.setItem('pinned_notifications', JSON.stringify([]));
        
        await supabase
          .from('notifications')
          .delete()
          .eq('destinataire_id', user.user.id);
      }
    } catch (err) {
      console.error('Erreur:', err);
      await chargerNotifications();
    }
  };

  const suivreUtilisateur = async (id, suitActuellement) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    setNotifications(prev => prev.map(n => 
      n.expediteur_id === id ? { ...n, jeSuit: !suitActuellement } : n
    ));
    setMenuOpen(null);
    
    try {
      if (suitActuellement) {
        await supabase.from('follows').delete().eq('follower_id', user.user.id).eq('following_id', id);
      } else {
        await supabase.from('follows').insert({ follower_id: user.user.id, following_id: id });
      }
    } catch (err) {
      setNotifications(prev => prev.map(n => 
        n.expediteur_id === id ? { ...n, jeSuit: suitActuellement } : n
      ));
      console.error('Erreur:', err);
    }
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
      <div className={`flex justify-center items-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <Loader2 size={32} className={`animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <div className="w-full sm:w-[70%] max-w-[1100px] mx-auto px-0 sm:px-3 py-4">
        
        <div className={`rounded-2xl border shadow-xl mb-4 overflow-hidden transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700 shadow-purple-900/20' 
            : 'bg-white border-gray-200 shadow-purple-100/30'
        }`}>
          <div className="px-5 py-4">
            <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <Bell size={24} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                  {nonLus > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {nonLus}
                    </span>
                  )}
                </div>
                <h1 className={`font-bold text-2xl md:text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${
                  isDark ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-500'
                }`}>
                  Notifications
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toutMarquerLu}
                  disabled={!notifications.length}
                  className={`p-2 rounded-xl border transition-all duration-200 ${
                    notifications.length 
                      ? isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                      : isDark
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-200'
                  }`}
                  title="Tout marquer lu"
                >
                  <CheckCheck size={16} />
                </button>
                
                <button
                  onClick={toutSupprimer}
                  disabled={!notifications.length}
                  className={`p-2 rounded-xl border transition-all duration-200 ${
                    notifications.length 
                      ? isDark
                        ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                        : 'bg-gray-900 text-white hover:bg-black border-gray-900'
                      : isDark
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-200'
                  }`}
                  title="Tout supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={`flex border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <button
              onClick={() => setOnglet('toutes')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${
                onglet === 'toutes' 
                  ? isDark
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                    : 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={14} />
                Toutes
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {notifications.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setOnglet('nonLus')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${
                onglet === 'nonLus' 
                  ? isDark
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                    : 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Bell size={14} />
                Non lues
                {nonLus > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {nonLus}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {notifsFiltrees.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center shadow-lg transition-colors duration-300 ${
              isDark ? 'bg-gray-800 shadow-purple-900/20' : 'bg-white shadow-purple-100/30'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md ${
                isDark ? 'bg-gradient-to-br from-purple-900 to-pink-900' : 'bg-gradient-to-br from-purple-100 to-pink-100'
              }`}>
                <Bell size={32} className="text-purple-400" />
              </div>
              <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Aucune notification
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                Revenez plus tard pour voir vos interactions !
              </p>
            </div>
          ) : (
            notifsFiltrees.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } ${
                  notif.pinned 
                    ? 'ring-2 ring-yellow-400 ring-offset-2 shadow-lg' 
                    : `border ${isDark ? 'border-gray-700' : 'border-gray-100'}`
                } ${
                  !notif.lu 
                    ? isDark ? 'border-purple-500 border-2' : 'border-purple-300 border-2'
                    : ''
                }`}
              >
                <div className="p-1 sm:p-2">
                  <div className="flex gap-3 relative">
                    <div className="relative shrink-0">
                      <img
                        src={notif.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.nom)}&background=8b5cf6&color=fff`}
                        alt=""
                        className={`w-12 h-12 rounded-full object-cover border-2 shadow-md cursor-pointer hover:opacity-90 transition ${
                          isDark ? 'border-gray-600' : 'border-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/home/profile/${notif.expediteur_id}`);
                        }}
                      />
                      <div
                        className="absolute bottom-4 md:-bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                        style={{ backgroundColor: getTypeCouleur(notif.type) }}
                      >
                        {getTypeIcone(notif.type, 12)}
                      </div>
                      {notif.pinned && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Pin size={12} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`font-semibold text-base cursor-pointer transition ${
                                isDark 
                                  ? 'text-gray-200 hover:text-purple-400' 
                                  : 'text-gray-900 hover:text-purple-600'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/home/profile/${notif.expediteur_id}`);
                              }}
                            >
                              {notif.nom}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {notif.message}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 mt-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span className="flex items-center gap-1">
                              ⏱️ {tempsDepuis(notif.date)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === notif.id ? null : notif.id);
                            }}
                            className={`p-1.5 rounded-lg transition ${
                              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                            title="Options"
                          >
                            <MoreVertical size={20} />
                          </button>
                          
                          {menuOpen === notif.id && (
                            <div className={`absolute right-2 top-12 rounded-xl shadow-2xl border py-2 z-50 min-w-[180px] ${
                              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                              {!notif.lu && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    marquerLu(notif.id);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition font-medium ${
                                    isDark ? 'hover:bg-purple-900/30 text-gray-200' : 'hover:bg-purple-50 text-gray-700'
                                  }`}
                                >
                                  <CheckCheck size={16} className="text-purple-500" />
                                  <span>Marquer comme lu</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  epingler(notif.id);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition font-medium ${
                                  isDark ? 'hover:bg-yellow-900/30 text-gray-200' : 'hover:bg-yellow-50 text-gray-700'
                                }`}
                              >
                                <Pin size={16} className="text-yellow-500" />
                                <span>{notif.pinned ? 'Désépingler' : 'Épingler'}</span>
                              </button>
                              <div className={`border-t my-1 ${isDark ? 'border-gray-700' : 'border-gray-150'}`}></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  supprimer(notif.id);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition font-medium ${
                                  isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                                }`}
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

        {notifsFiltrees.length > 0 && (
          <div className="mt-6 text-center">
            <p className={`text-xs inline-block px-4 py-1.5 rounded-full shadow-sm ${
              isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-white/50 text-gray-400'
            }`}>
              {notifsFiltrees.length} notification{notifsFiltrees.length > 1 ? 's' : ''}
              {nonLus > 0 && ` • ${nonLus} non lue${nonLus > 1 ? 's' : ''}`}
              {notifications.filter(n => n.pinned).length > 0 && 
                ` • 📌 ${notifications.filter(n => n.pinned).length} épinglée${notifications.filter(n => n.pinned).length > 1 ? 's' : ''}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}