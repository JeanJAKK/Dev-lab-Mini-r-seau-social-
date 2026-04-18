import supabase from '../supabase.js';

export const serviceNotifications = {
  async creerNotification({ type, destinataire_id, expediteur_id, publication_id, message }) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          type,
          destinataire_id,
          expediteur_id,
          publication_id: publication_id || null,
          message,
          est_lu: false,
          cree_le: new Date().toISOString()
        }])
        .select();
      
      if (error) console.error("Erreur insertion:", error);
      return { donnees: data?.[0], erreur: error };
    } catch (error) {
      console.error("Erreur:", error);
      return { donnees: null, erreur: error };
    }
  }
};