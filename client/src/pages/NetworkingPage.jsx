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
  Inbox,
  UserCheck
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
import UserAvatar from '../components/common/UserAvatar';

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

      setPeers(profiles || []);
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
      showToast(`Connection request sent to ${peer.displayName || 'peer'}!`);
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
      showToast('Failed to respond to request', 'error');
    }
  };

  return (
    <div className="networking-page" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(192, 132, 252, 0.18)', border: '1px solid rgba(192, 132, 252, 0.35)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px' }}>
              <Users size={13} color="#c084fc" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#e9d5ff', textTransform: 'uppercase' }}>
                Peer Directory
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
              Student Engineer Network
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Connect with fellow developers, build project teams, and exchange verified peer feedback.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              {connectedUsers.length} Connections
            </span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SEGMENT TABS */}
      <div style={{ marginBottom: '20px' }}>
        <div className="segment-tabs-container">
          <button
            onClick={() => setActiveTab('discover')}
            className={`segment-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          >
            <Users size={15} /> Discover Peers ({peers.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`segment-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          >
            <Inbox size={15} /> Requests {incomingRequests.length > 0 ? `(${incomingRequests.length})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`segment-tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
          >
            <UserCheck size={15} /> My Network ({connectedUsers.length})
          </button>
        </div>
      </div>

      {/* 3. DISCOVER TAB */}
      {activeTab === 'discover' && (
        <div>
          {/* Search Input */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '38px' }}
                  placeholder="Search by name, skills, college, or career goal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 20px' }}>
                Search
              </button>
            </form>
          </div>

          {/* User Cards Grid */}
          <div className="responsive-grid-2">
            {peers.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <Users size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '4px' }}>No student profiles found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {searchTerm ? 'Try broadening your search query.' : 'When other students complete onboarding, they will appear in this directory.'}
                </p>
              </div>
            ) : (
              peers.map(peer => {
                const isSent = sentRequestUids.has(peer.uid);
                return (
                  <div key={peer.uid} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                      <UserAvatar 
                        name={peer.displayName} 
                        photoURL={peer.photoURL} 
                        size={50} 
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {peer.displayName}
                        </h3>
                        {peer.username && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: '700' }}>
                            @{peer.username}
                          </div>
                        )}
                        {peer.headline && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {peer.headline}
                          </div>
                        )}
                      </div>

                      {peer.careerScore !== undefined && peer.careerScore !== null && (
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                          {peer.careerScore} Score
                        </span>
                      )}
                    </div>

                    {peer.college && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        🎓 {peer.college}
                      </div>
                    )}

                    {/* Skills Tags */}
                    {peer.skills && peer.skills.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {peer.skills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleConnect(peer)}
                        disabled={isSent}
                        className={`btn ${isSent ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {isSent ? 'Request Sent' : <><UserPlus size={14} /> Connect</>}
                      </button>

                      {peer.username && (
                        <Link 
                          to={`/u/${peer.username}`} 
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0 14px' }}
                        >
                          <ExternalLink size={13} /> Passport
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              Incoming Connection Requests ({incomingRequests.length})
            </h3>

            {incomingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.88rem' }}>No pending requests at this time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingRequests.map(req => (
                  <div key={req.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserAvatar 
                        name={req.fromUserName} 
                        photoURL={req.fromUserAvatar} 
                        size={40} 
                      />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{req.fromUserName}</div>
                        {req.fromUserHeadline && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.fromUserHeadline}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRespond(req, true)} className="btn btn-primary btn-sm">
                        Accept
                      </button>
                      <button onClick={() => handleRespond(req, false)} className="btn btn-secondary btn-sm">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MY CONNECTIONS TAB */}
      {activeTab === 'connections' && (
        <div className="responsive-grid-2">
          {connectedUsers.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <UserCheck size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '4px' }}>No active connections yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Discover fellow student engineers on the Discover tab and send connection requests.
              </p>
            </div>
          ) : (
            connectedUsers.map(conn => (
              <div key={conn.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserAvatar 
                    name={conn.displayName} 
                    photoURL={conn.photoURL} 
                    size={44} 
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{conn.displayName}</div>
                    {conn.username && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>@{conn.username}</div>
                    )}
                  </div>
                </div>
                {conn.username && (
                  <Link to={`/u/${conn.username}`} className="btn btn-secondary btn-sm">
                    View Passport
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
