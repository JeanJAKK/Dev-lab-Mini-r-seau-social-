import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '../services/systemeLike/getUser';

const FollowContext = createContext();

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};

// Fonction utilitaire pour charger depuis localStorage
const loadFollowingFromStorage = () => {
  try {
    const stored = localStorage.getItem('followingIds');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur localStorage:', error);
    return [];
  }
};

// Fonction utilitaire pour sauvegarder dans localStorage
const saveFollowingToStorage = (followingIds) => {
  try {
    localStorage.setItem('followingIds', JSON.stringify(followingIds));
  } catch (error) {
    console.error('Erreur localStorage:', error);
  }
};

export const FollowProvider = ({ children }) => {
  const [followingIds, setFollowingIds] = useState(() => loadFollowingFromStorage());
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFollowing = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);
    if (error) {
      console.error("Erreur récupération follows", error);
      return;
    }
    const newFollowingIds = (data || []).map((row) => row.following_id);
    setFollowingIds(newFollowingIds);
    saveFollowingToStorage(newFollowingIds); // Sauvegarder dans localStorage
  };

  const toggleFollow = async (targetId) => {
    const me = await getUser().id;
    if (!me) return;

    if (followingIds.includes(targetId)) {
      // Unfollow
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: me, following_id: targetId });
      if (!error) {
        const newFollowingIds = followingIds.filter((id) => id !== targetId);
        setFollowingIds(newFollowingIds);
        saveFollowingToStorage(newFollowingIds); // Sauvegarder dans localStorage
        await updateFollowCounts(targetId, -1);
      } else {
        console.error("Erreur unfollow", error);
      }
      return;
    }

    // Follow
    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: me, following_id: targetId }]);
    if (!error) {
      const newFollowingIds = [...followingIds, targetId];
      setFollowingIds(newFollowingIds);
      saveFollowingToStorage(newFollowingIds); // Sauvegarder dans localStorage
      await updateFollowCounts(targetId, +1);
    } else {
      console.error("Erreur follow", error);
    }
  };

  const updateFollowCounts = async (targetUserId, change) => {
    try {
      // Mettre à jour le nombre de followers de la cible
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("followers_count")
        .eq("id", targetUserId)
        .single();
      
      if (targetProfile) {
        const newFollowersCount = (targetProfile.followers_count || 0) + change;
        await supabase
          .from("profiles")
          .update({ followers_count: newFollowersCount })
          .eq("id", targetUserId);
      }
      
      // Mettre à jour le nombre de following de l'utilisateur courant
      const me = await getUser().id;
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("following_count")
        .eq("id", me)
        .single();
      
      if (myProfile) {
        const newFollowingCount = (myProfile.following_count || 0) + change;
        await supabase
          .from("profiles")
          .update({ following_count: newFollowingCount })
          .eq("id", me);
      }
    } catch (error) {
      console.error("Erreur mise à jour compteurs:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = await getUser();
      if (user && user.id) {
        setMyId(user.id);
        await loadFollowing(user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Rafraîchir les follows toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = await getUser();
      if (user && user.id) {
        await loadFollowing(user.id);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    followingIds,
    myId,
    loading,
    toggleFollow,
    loadFollowing
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};
