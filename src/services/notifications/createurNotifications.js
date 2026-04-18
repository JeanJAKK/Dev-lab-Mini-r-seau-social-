import supabase from '../supabase.js';
import { serviceNotifications } from './serviceNotifications.js';

export async function notifierLike(idUtilisateurQuiLike, idPublication) {
  try {
    const { data: publication } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", idPublication)
      .single();
    
    if (!publication) return;
    if (idUtilisateurQuiLike === publication.user_id) return;
    
    const { data: utilisateur } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", idUtilisateurQuiLike)
      .single();
    
    await serviceNotifications.creerNotification({
      type: 'like',
      destinataire_id: publication.user_id,
      expediteur_id: idUtilisateurQuiLike,
      publication_id: idPublication,
      message: `a aimé votre publication`
    });
  } catch (error) {
    console.error("Erreur notifierLike:", error);
  }
}

export async function notifierCommentaire(idUtilisateurQuiCommente, idPublication) {
  try {
    const { data: publication } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", idPublication)
      .single();
    
    if (!publication) return;
    if (idUtilisateurQuiCommente === publication.user_id) return;
    
    const { data: utilisateur } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", idUtilisateurQuiCommente)
      .single();
    
    await serviceNotifications.creerNotification({
      type: 'comment',
      destinataire_id: publication.user_id,
      expediteur_id: idUtilisateurQuiCommente,
      publication_id: idPublication,
      message: `a commenté votre publication`
    });
  } catch (error) {
    console.error("Erreur notifierCommentaire:", error);
  }
}

export async function notifierAbonnement(idAbonne, idPersonneSuivie) {
  try {
    if (idAbonne === idPersonneSuivie) return;
    
    const { data: utilisateur } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", idAbonne)
      .single();
    
    await serviceNotifications.creerNotification({
      type: 'follow',
      destinataire_id: idPersonneSuivie,
      expediteur_id: idAbonne,
      publication_id: null,
      message: `a commencé à vous suivre`
    });
  } catch (error) {
    console.error("Erreur notifierAbonnement:", error);
  }
}