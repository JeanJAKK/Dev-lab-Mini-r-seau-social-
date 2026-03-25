import React, { useState } from 'react';
import { 
  Trash2, CheckCheck, Heart, MessageCircle, UserPlus, 
  Share2, Play, ArrowLeft, Reply, Eye, MoreVertical,
  Bell, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COULEURS = {
  violet: '#8b5cf6',
  violetFonce: '#7c3aed',
  bleu: '#3b82f6',
  rose: '#ec489a',
  vert: '#10b981',
  orange: '#f59e0b',
  rouge: '#ef4444',
  gris: '#6b7280',
  fondClair: '#faf5ff',
  fondSombre: '#1f2937'
};

export default function CentreNotifications() {
  const navigate = useNavigate();
  const [ongletCourant, setOngletCourant] = useState('toutes');
  const [menuOuvert, setMenuOuvert] = useState(null);
  
  const [mesNotifs, setMesNotifs] = useState([
    {
      id: 1,
      type: 'like',
      expediteur: { id: 'user1', nom: 'AUDE', avatar: null, jeSuit: false },
      message: 'a aimé ta publication ✨',
      publicationId: 101,
      estLu: false,
      creeLe: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
      id: 2,
      type: 'comment',
      expediteur: { id: 'user2', nom: 'Merveille', avatar: null, jeSuit: true },
      message: 'a commenté ta publication 💬',
      publicationId: 102,
      estLu: false,
      creeLe: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 3,
      type: 'follow',
      expediteur: { id: 'user3', nom: 'Elyse', avatar: null, jeSuit: false },
      message: 'a commencé à te suivre 🌟',
      publicationId: null,
      estLu: true,
      creeLe: new Date(Date.now() - 1 * 3600000).toISOString()
    },
    {
      id: 4,
      type: 'share',
      expediteur: { id: 'user4', nom: 'GILDAS', avatar: null, jeSuit: false },
      message: 'a partagé ta vidéo',
      publicationId: 104,
      estLu: false,
      creeLe: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    {
      id: 5,
      type: 'like',
      expediteur: { id: 'user5', nom: 'Fiat', avatar: null, jeSuit: true },
      message: 'a aimé ❤️ ta publication',
      publicationId: 105,
      estLu: true,
      creeLe: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      id: 6,
      type: 'comment',
      expediteur: { id: 'user6', nom: 'Liber', avatar: null, jeSuit: false },
      message: 'a répondu à ton commentaire 💭',
      publicationId: 106,
      estLu: false,
      creeLe: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 7,
      type: 'follow',
      expediteur: { id: 'user7', nom: 'Goodies', avatar: null, jeSuit: false },
      message: 'a commencé à te suivre 🎯',
      publicationId: null,
      estLu: false,
      creeLe: new Date(Date.now() - 2 * 3600000).toISOString()
    }
  ]);

  const totalNotifs = mesNotifs.length;
  const nonLus = mesNotifs.filter(notif => !notif.estLu).length;
  const notifsAffichees = ongletCourant === 'nonLus' 
    ? mesNotifs.filter(notif => !notif.estLu) 
    : mesNotifs;

  const toutMarquerCommeLu = () => {
    setMesNotifs(mesNotifs.map(notif => ({ ...notif, estLu: true })));
  };

  const toutSupprimer = () => {
    if (window.confirm('Supprimer toutes les notifications ? 🗑️')) {
      setMesNotifs([]);
    }
  };

  const supprimerUneNotif = (id) => {
    setMesNotifs(mesNotifs.filter(notif => notif.id !== id));
  };

  const marquerCommeLu = (id) => {
    setMesNotifs(mesNotifs.map(notif => 
      notif.id === id ? { ...notif, estLu: true } : notif
    ));
  };

  const suivreUtilisateur = (id, statutActuel) => {
    setMesNotifs(mesNotifs.map(notif => 
      notif.id === id 
        ? { ...notif, expediteur: { ...notif.expediteur, jeSuit: !statutActuel } } 
        : notif
    ));
  };

  const getIcone = (type) => {
    const taille = 10;
    switch(type) {
      case 'like': return <Heart size={taille} color="#fff" />;
      case 'comment': return <MessageCircle size={taille} color="#fff" />;
      case 'share': return <Share2 size={taille} color="#fff" />;
      case 'follow': return <UserPlus size={taille} color="#fff" />;
      default: return <Bell size={taille} color="#fff" />;
    }
  };

  const getCouleurIcone = (type) => {
    const couleurs = {
      like: COULEURS.rouge,
      comment: COULEURS.bleu,
      share: COULEURS.violet,
      follow: COULEURS.vert
    };
    return couleurs[type] || COULEURS.gris;
  };

  const allerVersPublication = (notif) => {
    if (notif.publicationId) {
      marquerCommeLu(notif.id);
      navigate(`/home/post/${notif.publicationId}`);
    }
  };

  const repondreAuCommentaire = (notif) => {
    if (notif.publicationId) {
      navigate(`/home/post/${notif.publicationId}?reply=true`);
    }
  };

  const voirProfil = (idExpediteur) => {
    navigate(`/home/profile/${idExpediteur}`);
  };

  const tempsDepuis = (timestamp) => {
    const maintenant = new Date();
    const passe = new Date(timestamp);
    const diffMs = maintenant - passe;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHeure = Math.floor(diffMin / 60);
    const diffJour = Math.floor(diffHeure / 24);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHeure < 24) return `Il y a ${diffHeure} h`;
    return `Il y a ${diffJour} j`;
  };

  const getAvatar = (expediteur) => {
    if (expediteur.avatar) return expediteur.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(expediteur.nom)}&background=${COULEURS.violet.replace('#', '')}&color=fff&bold=true`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.conteneur}>
        
        <div style={styles.enTete}>
          <button onClick={() => navigate(-1)} style={styles.boutonRetour}>
            <ArrowLeft size={20} />
            <span style={styles.texteRetour}>Retour</span>
          </button>
          
          <div style={styles.titreZone}>
            <Bell size={24} color={COULEURS.violet} />
            <h1 style={styles.titre}>Notifications</h1>
            {nonLus > 0 && <span style={styles.badgeNonLu}>{nonLus}</span>}
          </div>

          <div style={styles.actionsGroupe}>
            {totalNotifs > 0 && (
              <>
                <button onClick={toutMarquerCommeLu} style={styles.boutonIcone} title="Tout marquer comme lu">
                  <CheckCheck size={20} />
                </button>
                <button onClick={toutSupprimer} style={styles.boutonIcone} title="Tout supprimer">
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        <div style={styles.onglets}>
          <button 
            onClick={() => setOngletCourant('toutes')} 
            style={ongletCourant === 'toutes' ? styles.ongletActif : styles.onglet}
          >
            <Sparkles size={14} />
            Toutes
            {totalNotifs > 0 && <span style={styles.compteur}>{totalNotifs}</span>}
          </button>
          <button 
            onClick={() => setOngletCourant('nonLus')} 
            style={ongletCourant === 'nonLus' ? styles.ongletActif : styles.onglet}
          >
            <Bell size={14} />
            Non lues
            {nonLus > 0 && <span style={styles.badgeNonLuPetit}>{nonLus}</span>}
          </button>
        </div>

        <div style={styles.liste}>
          {notifsAffichees.length === 0 ? (
            <div style={styles.etatVide}>
              <div style={styles.iconeVide}>🔔✨</div>
              <p style={styles.titreVide}>Tranquillité totale !</p>
              <p style={styles.texteVide}>
                Aucune notification pour le moment. Profite de ta pause 🌙
              </p>
              <button onClick={() => navigate('/home')} style={styles.boutonExplorer}>
                Explorer le fil d'actu
              </button>
            </div>
          ) : (
            notifsAffichees.map(notif => (
              <div 
                key={notif.id} 
                style={{
                  ...styles.carte,
                  background: !notif.estLu && ongletCourant === 'toutes' 
                    ? COULEURS.fondClair 
                    : '#fff'
                }}
              >
                {!notif.estLu && <div style={styles.indicateurNonLu} />}
                
                <div 
                  style={styles.avatarWrapper}
                  onClick={() => voirProfil(notif.expediteur.id)}
                >
                  <img 
                    src={getAvatar(notif.expediteur)} 
                    alt={notif.expediteur.nom}
                    style={styles.avatar}
                  />
                  <div style={{...styles.badgeIcone, backgroundColor: getCouleurIcone(notif.type)}}>
                    {getIcone(notif.type)}
                  </div>
                </div>

                <div style={styles.contenu}>
                  <div style={styles.lignePrincipale}>
                    <div style={styles.texteWrapper}>
                      <p style={styles.texteMessage}>
                        <strong 
                          style={styles.nomUtilisateur}
                          onClick={() => voirProfil(notif.expediteur.id)}
                        >
                          {notif.expediteur.nom}
                        </strong>{' '}
                        <span style={styles.messageAction}>{notif.message}</span>
                      </p>
                      <span style={styles.timestamp}>{tempsDepuis(notif.creeLe)}</span>
                    </div>

                    <div style={styles.boutonsActionGroupe}>
                      {notif.type === 'follow' && (
                        <button
                          onClick={() => suivreUtilisateur(notif.id, notif.expediteur.jeSuit)}
                          style={notif.expediteur.jeSuit ? styles.boutonDejaSuivi : styles.boutonSuivre}
                        >
                          <UserPlus size={12} />
                          {notif.expediteur.jeSuit ? 'Suivi' : 'Suivre'}
                        </button>
                      )}

                      {notif.type === 'share' && notif.publicationId && (
                        <button
                          onClick={() => allerVersPublication(notif)}
                          style={styles.boutonVoir}
                        >
                          <Eye size={12} />
                          Voir
                        </button>
                      )}

                      {notif.type === 'comment' && notif.publicationId && (
                        <button
                          onClick={() => repondreAuCommentaire(notif)}
                          style={styles.boutonRepondre}
                        >
                          <Reply size={12} />
                          Répondre
                        </button>
                      )}

                      {notif.type === 'like' && notif.publicationId && (
                        <button
                          onClick={() => allerVersPublication(notif)}
                          style={styles.boutonVoirPost}
                        >
                          <Play size={12} />
                          Voir
                        </button>
                      )}
                    </div>

                    <div style={styles.menuWrapper}>
                      <button 
                        onClick={() => setMenuOuvert(menuOuvert === notif.id ? null : notif.id)} 
                        style={styles.boutonMenu}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {menuOuvert === notif.id && (
                        <div style={styles.dropdown}>
                          {!notif.estLu && (
                            <button 
                              onClick={() => {
                                marquerCommeLu(notif.id);
                                setMenuOuvert(null);
                              }} 
                              style={styles.itemDropdown}
                            >
                              <CheckCheck size={14} />
                              Marquer comme lu
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              supprimerUneNotif(notif.id);
                              setMenuOuvert(null);
                            }} 
                            style={{...styles.itemDropdown, ...styles.itemDanger}}
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { 
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', 
    minHeight: 'calc(80vh - 70px)', 
    padding: '24px', 
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  },
  conteneur: { 
    maxWidth: '100%', 
    margin: '0 auto',
    background: '#fff',
    borderRadius: '28px',
    boxShadow: '0 20px 35px -10px rgba(139, 92, 246, 0.15)',
    overflow: 'hidden'
  },
  enTete: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '20px 28px',
    borderBottom: '1px solid #f3e8ff',
    background: '#fff'
  },
  boutonRetour: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '40px',
    color: '#6b7280',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  texteRetour: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },
  titreZone: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  titre: { 
    fontSize: '22px', 
    fontWeight: '700', 
    margin: 0,
    background: `linear-gradient(135deg, ${COULEURS.violet}, ${COULEURS.rose})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  badgeNonLu: {
    background: COULEURS.rouge,
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '30px'
  },
  actionsGroupe: {
    display: 'flex',
    gap: '6px'
  },
  boutonIcone: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '40px',
    color: '#9ca3af',
    transition: 'all 0.2s'
  },
  onglets: { 
    display: 'flex', 
    gap: '24px', 
    padding: '0 24px',
    borderBottom: '1px solid #f3e8ff',
    background: '#fff'
  },
  onglet: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '14px 0', 
    color: '#9ca3af', 
    fontWeight: '500',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  ongletActif: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '14px 0', 
    color: COULEURS.violet, 
    borderBottom: `2px solid ${COULEURS.violet}`, 
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  compteur: {
    background: '#f3e8ff',
    color: COULEURS.violet,
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  badgeNonLuPetit: {
    background: COULEURS.rouge,
    color: '#fff',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  liste: { 
    maxHeight: '560px', 
    overflowY: 'auto'
  },
  carte: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    padding: '16px 20px', 
    gap: '14px',
    position: 'relative',
    transition: 'all 0.2s',
    borderBottom: '1px solid #f0f0f0'
  },
  indicateurNonLu: { 
    width: '4px', 
    height: '50px', 
    borderRadius: '4px',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    background: `linear-gradient(135deg, ${COULEURS.violet}, ${COULEURS.rose})`
  },
  avatarWrapper: {
    position: 'relative',
    width: '48px',
    height: '48px',
    flexShrink: 0,
    cursor: 'pointer'
  },
  avatar: { 
    width: '48px', 
    height: '48px', 
    borderRadius: '50%', 
    objectFit: 'cover',
    border: '2px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  badgeIcone: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    borderRadius: '50%', 
    padding: '4px', 
    display: 'flex', 
    border: '2px solid white',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px'
  },
  contenu: { 
    flex: 1,
    minWidth: 0
  },
  lignePrincipale: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  texteWrapper: {
    flex: 1,
    minWidth: 0
  },
  texteMessage: { 
    margin: 0, 
    fontSize: '14px', 
    color: '#374151',
    lineHeight: '1.4'
  },
  nomUtilisateur: {
    fontWeight: '700',
    color: '#1f2937',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  messageAction: {
    color: '#6b7280'
  },
  timestamp: { 
    fontSize: '11px', 
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: '4px',
    display: 'block'
  },
  boutonsActionGroupe: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  boutonSuivre: { 
    background: 'transparent', 
    color: COULEURS.violet, 
    border: `1px solid ${COULEURS.violet}`, 
    padding: '4px 12px', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    fontSize: '11px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px',
    transition: 'all 0.2s'
  },
  boutonDejaSuivi: { 
    background: '#f3e8ff', 
    color: COULEURS.violet, 
    border: '1px solid #e9d5ff', 
    padding: '4px 12px', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    fontSize: '11px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px'
  },
  boutonVoir: { 
    background: 'transparent', 
    color: COULEURS.bleu, 
    border: `1px solid ${COULEURS.bleu}`, 
    padding: '4px 12px', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    fontSize: '11px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px'
  },
  boutonRepondre: { 
    background: 'transparent', 
    color: COULEURS.vert, 
    border: `1px solid ${COULEURS.vert}`, 
    padding: '4px 12px', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    fontSize: '11px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px'
  },
  boutonVoirPost: { 
    background: 'transparent', 
    color: COULEURS.orange, 
    border: `1px solid ${COULEURS.orange}`, 
    padding: '4px 12px', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    fontSize: '11px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px'
  },
  menuWrapper: {
    position: 'relative',
    flexShrink: 0
  },
  boutonMenu: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '40px',
    color: '#c4b5fd',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid #f3e8ff',
    zIndex: 10,
    minWidth: '160px',
    overflow: 'hidden'
  },
  itemDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#4b5563',
    transition: 'all 0.2s'
  },
  itemDanger: {
    color: COULEURS.rouge,
    borderTop: '1px solid #f3e8ff'
  },
  etatVide: {
    textAlign: 'center',
    padding: '80px 24px'
  },
  iconeVide: {
    fontSize: '72px',
    marginBottom: '20px'
  },
  titreVide: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  texteVide: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '28px'
  },
  boutonExplorer: {
    background: `linear-gradient(135deg, ${COULEURS.violet}, ${COULEURS.rose})`,
    color: '#fff',
    border: 'none',
    padding: '10px 28px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }
};