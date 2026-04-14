import supabase from '../supabase.js';

export const serviceNotifications = {
  async creerNotification({ type, destinataire_id, expediteur_id, publication_id, message }) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          type: type,
          destinataire_id: destinataire_id,
          expediteur_id: expediteur_id,
          publication_id: publication_id || null,
          message: message,
          est_lu: false,
          cree_le: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        console.error("Erreur insertion:", error);
        return { donnees: null, erreur: error };
      }
      
      return { donnees: data?.[0], erreur: null };
    } catch (error) {
      console.error("Erreur:", error);
      return { donnees: null, erreur: error };
    }
  }
};