import React, { useState, useEffect } from 'react';
import { Trash2, CheckCheck, Heart, MessageCircle, UserPlus, Share2, Play } from 'lucide-react';
import supabase from '../services/supabase.js';
import { getUserId } from '../services/systemeLike/getUserId.js';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Toutes');
  const navigate = useNavigate();

  // Charger les notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const userId = await getUserId();
    
    if (!userId) return;

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id(name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const handleMarkAllRead = async () => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleMarkAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={14} color="#ef4444" />;
      case 'comment': return <MessageCircle size={14} color="#3b82f6" />;
      case 'share': return <Share2 size={14} color="#8b5cf6" />;
      case 'follow': return <UserPlus size={14} color="#10b981" />;
      default: return <Heart size={14} />;
    }
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    if (notif.post_id) {
      navigate(`/home/post/${notif.post_id}`);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
  };

  const displayedNotifs = activeTab === 'Non lues' 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>Notifications</h2>
          </div>
          <div style={styles.list}>
            {[1,2,3].map(i => (
              <div key={i} style={styles.card}>
                <div style={styles.avatar} className="skeleton" />
                <div style={styles.content}>
                  <div className="skeleton" style={{height: '16px', width: '200px'}} />
                  <div className="skeleton" style={{height: '12px', width: '50px', marginTop: '5px'}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Notifications</h2>
          <button onClick={handleMarkAllRead} style={styles.gradientBtn}>
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        </div>

        <div style={styles.tabs}>
          {['Toutes', 'Non lues'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={activeTab === tab ? styles.tabActive : styles.tab}
            >
              {tab} {tab === 'Non lues' && notifications.filter(n => !n.is_read).length > 0 && 
                `(${notifications.filter(n => !n.is_read).length})`}
            </button>
          ))}
        </div>

        <div style={styles.list}>
          {displayedNotifs.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Aucune notification</p>
            </div>
          ) : (
            displayedNotifs.map(n => (
              <div 
                key={n.id} 
                style={{
                  ...styles.card,
                  background: !n.is_read ? (activeTab === 'Toutes' ? '#f0f9ff' : '#fff') : '#fff',
                  cursor: n.post_id ? 'pointer' : 'default'
                }}
                onClick={() => n.post_id && handleNotificationClick(n)}
              >
                <div style={{
                  ...styles.bar, 
                  background: !n.is_read ? 'linear-gradient(to bottom, #3b82f6, #8b5cf6)' : 'transparent'
                }} />
                
                <div style={styles.avatar}>
                  {n.sender?.avatar_url ? (
                    <img 
                      src={n.sender.avatar_url} 
                      alt={n.sender?.name}
                      style={{width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover'}}
                    />
                  ) : (
                    n.sender?.name?.charAt(0) || '?'
                  )}
                  <div style={styles.iconBadge}>{getIcon(n.type)}</div>
                </div>

                <div style={styles.content}>
                  <p style={styles.text}>
                    <strong>{n.sender?.name || 'Utilisateur'}</strong> {n.content}
                  </p>
                  <span style={styles.time}>{formatTimeAgo(n.created_at)}</span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                  style={styles.trashBtn}
                >
                  <Trash2 size={18} />
                </button>
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
    backgroundColor: '#f9fafb', 
    minHeight: 'calc(100vh - 80px)', 
    padding: '40px', 
    fontFamily: 'Inter, sans-serif',
    marginTop: '76px'
  },
  container: { 
    backgroundColor: '#fff', 
    borderRadius: '16px', 
    padding: '24px', 
    maxWidth: '800px', 
    margin: '0 auto', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
  },
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '25px' 
  },
  title: { 
    fontSize: '24px', 
    fontWeight: '800', 
    margin: 0 
  },
  gradientBtn: { 
    marginLeft: 'auto', 
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', 
    color: '#fff', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  tabs: { 
    display: 'flex', 
    gap: '25px', 
    marginBottom: '20px' 
  },
  tab: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '5px 0', 
    color: '#64748b', 
    fontWeight: '500' 
  },
  tabActive: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '5px 0', 
    color: '#3b82f6', 
    borderBottom: '2px solid #3b82f6', 
    fontWeight: '800' 
  },
  list: { 
    maxHeight: '600px', 
    overflowY: 'auto' 
  },
  card: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '15px', 
    borderBottom: '1px solid #f1f5f9', 
    gap: '15px',
    position: 'relative',
    transition: 'background 0.2s'
  },
  bar: { 
    width: '5px', 
    height: '40px', 
    borderRadius: '3px',
    position: 'absolute',
    left: 0
  },
  avatar: { 
    width: '48px', 
    height: '48px', 
    borderRadius: '14px', 
    background: '#f1f5f9', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative', 
    fontWeight: 'bold' 
  },
  iconBadge: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
    borderRadius: '50%', 
    padding: '5px', 
    display: 'flex', 
    border: '2px solid white' 
  },
  content: { 
    flex: 1 
  },
  text: { 
    margin: '0 0 5px 0', 
    fontSize: '15px', 
    color: '#1e293b' 
  },
  time: { 
    fontSize: '12px', 
    color: '#94a3b8' 
  },
  trashBtn: { 
    background: '#f8fafc', 
    border: 'none', 
    padding: '10px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    color: '#94a3b8' 
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  }
};