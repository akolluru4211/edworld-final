import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserPlus, 
  Check, 
  ExternalLink, 
  Award, 
  MapPin, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  X,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  getPublicProfiles, 
  getConnectionRequests, 
  sendConnectionRequest, 
  respondConnectionRequest, 
  getConnectedUsers 
} from '../services/firestoreService';

export default function NetworkingPage() {
  const { user, userProfile } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'requests' | 'connections'
  const [peers, setPeers] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequestUids, setSentRequestUids] = useState(new Set());

  const loadNetworkData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profiles, requestsData, conns] = await Promise.all([
        getPublicProfiles(user.uid, { search: searchTerm }),
        getConnectionRequests(user.uid),
        getConnectedUsers(user.uid)
      ]);

      setPeers(profiles);
      setIncomingRequests(requestsData.incoming || []);
      setOutgoingRequests(requestsData.outgoing || []);
      setConnectedUsers(conns || []);

      const outgoingUids = new Set((requestsData.outgoing || []).map(r => r.toUserId));
      setSentRequestUids(outgoingUids);
    } catch (err) {
      console.warn('Error loading network data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadNetworkData();
  };

  const handleConnect = async (peer) => {
    if (!user) return;
    try {
      await sendConnectionRequest(
        { uid: user.uid, displayName: userProfile?.displayName, headline: userProfile?.headline, photoURL: userProfile?.photoURL },
        { uid: peer.uid, displayName: peer.displayName, photoURL: peer.photoURL }
      );
      setSentRequestUids(prev => new Set(prev).add(peer.uid));
      showToast(`Connection request sent to ${peer.displayName}!`);
    } catch (err) {
      showToast('Failed to send connection request', 'error');
    }
  };

  const handleRespond = async (request, accept) => {
    try {
      await respondConnectionRequest(
        request.id, 
        accept, 
        request.fromUserId, 
        request.toUserId,
        { displayName: userProfile?.displayName },
        { displayName: request.fromUserName }
      );

      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      showToast(accept ? 'Connection accepted! 🎉' : 'Request declined.', accept ? 'success' : 'info');
      loadNetworkData();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="networking-page">
      {/* 1. HEADER */}
      <div className="hero-banner" style={{ padding: '36px 32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: '10px' }}>
              <Users size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Real Peer Network
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Developer Community & Peers
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              Connect with verified student engineers for hackathon collaboration, mock interviews, and code reviews.
            </p>
          </div>

          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              <Search size={15} /> Discover Peers ({peers.length})
            </button>
            <button 
              className={`nav-tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Inbox size={15} /> Requests ({incomingRequests.length})
            </button>
            <button 
              className={`nav-tab ${activeTab === 'connections' ? 'active' : ''}`}
              onClick={() => setActiveTab('connections')}
            >
              <CheckCircle size={15} /> Connections ({connectedUsers.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. DISCOVER PEERS TAB */}
      {activeTab === 'discover' && (
        <>
          {/* Search Bar */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '42px' }}
                  placeholder="Search real peers by name, skill (e.g. React, Node.js), college, or career goal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Search Network
              </button>
            </form>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Searching registered peers...</div>
          ) : peers.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Users size={40} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '6px' }}>No peers matching your filter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Try broadening your search term or exploring all registered members.</p>
            </div>
          ) : (
            <div className="grid-3">
              {peers.map(peer => {
                const isSent = sentRequestUids.has(peer.uid);
                const isAlreadyConnected = connectedUsers.some(c => c.uid === peer.uid);

                return (
                  <div key={peer.uid} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                      <img 
                        src={peer.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`} 
                        alt={peer.displayName} 
                        className="avatar" 
                        style={{ width: '56px', height: '56px' }} 
                      />
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{peer.displayName}</h3>
                        <p style={{ color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '600' }}>{peer.headline || 'Software Engineer'}</p>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{peer.college || 'Technology Institute'}</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Career Readiness</span>
                      <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>{peer.careerScore || 75} / 100</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', flex: 1 }}>
                      {(peer.skills || ['React', 'Node.js']).map((s, idx) => (
                        <span key={idx} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{s}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <Link to={`/u/${peer.username}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        <ExternalLink size={13} /> View Passport
                      </Link>

                      {isAlreadyConnected ? (
                        <button disabled className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                          <Check size={13} /> Connected
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleConnect(peer)}
                          disabled={isSent}
                          className={`btn btn-sm ${isSent ? 'btn-secondary' : 'btn-outline'}`}
                          style={{ flex: 1 }}
                        >
                          {isSent ? <><Check size={13} /> Sent</> : <><UserPlus size={13} /> Connect</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 3. INCOMING REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              Pending Connection Requests ({incomingRequests.length})
            </h3>

            {incomingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem' }}>No pending connection requests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingRequests.map(req => (
                  <div key={req.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={req.fromUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'} alt={req.fromUserName} className="avatar" style={{ width: '44px', height: '44px' }} />
                      <div>
                        <h4 style={{ fontWeight: '700', fontSize: '0.98rem' }}>{req.fromUserName}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{req.fromUserHeadline || 'Software Engineer'}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRespond(req, true)} className="btn btn-primary btn-sm">
                        <Check size={14} /> Accept
                      </button>
                      <button onClick={() => handleRespond(req, false)} className="btn btn-secondary btn-sm" style={{ color: 'var(--rose)' }}>
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MY CONNECTIONS TAB */}
      {activeTab === 'connections' && (
        <div>
          {connectedUsers.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Users size={40} color="var(--secondary)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>No Active Connections Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
                Start expanding your professional circle by discovering and connecting with peers.
              </p>
              <button onClick={() => setActiveTab('discover')} className="btn btn-primary btn-sm">
                Explore Peer Directory
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {connectedUsers.map(conn => (
                <div key={conn.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                    <img src={conn.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${conn.username}`} alt={conn.displayName} className="avatar" />
                    <div>
                      <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{conn.displayName}</h4>
                      <p style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>{conn.headline || 'Software Engineer'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', flex: 1 }}>
                    {(conn.skills || ['React', 'Node.js']).map((s, i) => (
                      <span key={i} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{s}</span>
                    ))}
                  </div>

                  <Link to={`/u/${conn.username}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    <ExternalLink size={13} /> View Career Passport
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
