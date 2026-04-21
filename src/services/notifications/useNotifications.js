import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabase.js';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const chargerNotifications = useCallback(async () => {
    try {
      setChargement(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        setNotifications([]);
        setChargement(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('destinataire_id', user.user.id)
        .order('cree_le', { ascending: false });

      if (error) throw error;
      
      const expediteursIds = [...new Set(data?.map(n => n.expediteur_id) || [])];
      let expediteursData = {};
      let followStatus = {};
      
      if (expediteursIds.length > 0) {
        const { data: profils } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', expediteursIds);
        
        expediteursData = (profils || []).reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
        
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.user.id);
        
        followStatus = (follows || []).reduce((acc, f) => {
          acc[f.following_id] = true;
          return acc;
        }, {});
      }
      
      const notificationsFormatees = (data || []).map(n => ({
        id: n.id,
        type: n.type,
        est_lu: n.est_lu,
        expediteur_id: n.expediteur_id,
        expediteur_nom: expediteursData[n.expediteur_id]?.name || 'Utilisateur',
        expediteur_avatar: expediteursData[n.expediteur_id]?.avatar_url,
        expediteur_suit: followStatus[n.expediteur_id] || false,
        message: n.message,
        publication_id: n.publication_id,
        cree_le: n.cree_le
      }));
      
      setNotifications(notificationsFormatees);
      setErreur(null);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerNotifications();
  }, [chargerNotifications]);

  const marquerLu = async (id) => {
    try {
      await supabase
        .from('notifications')
        .update({ est_lu: true })
        .eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lu: true } : n));
    } catch (err) {
      console.error("Erreur marquerLu:", err);
    }
  };

  const toutMarquerLu = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('notifications')
          .update({ est_lu: true })
          .eq('destinataire_id', user.user.id)
          .eq('est_lu', false);
        setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      }
    } catch (err) {
      console.error("Erreur toutMarquerLu:", err);
    }
  };

  const supprimer = async (id) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Erreur supprimer:", err);
    }
  };

  const toutSupprimer = async () => {
    if (!window.confirm('Supprimer toutes les notifications ?')) return;
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('notifications')
          .delete()
          .eq('destinataire_id', user.user.id);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Erreur toutSupprimer:", err);
    }
  };

  const suivre = async (expediteurId, suitActuellement) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      if (suitActuellement) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.user.id)
          .eq('following_id', expediteurId);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.user.id, following_id: expediteurId });
      }
      
      setNotifications(prev => prev.map(notif => 
        notif.expediteur_id === expediteurId
          ? { ...notif, expediteur_suit: !suitActuellement }
          : notif
      ));
    } catch (err) {
      console.error("Erreur suivre:", err);
    }
  };

  return {
    notifications,
    chargement,
    erreur,
    marquerLu,
    toutMarquerLu,
    supprimer,
    toutSupprimer,
    suivre,
    rafraichir: chargerNotifications
  };
}