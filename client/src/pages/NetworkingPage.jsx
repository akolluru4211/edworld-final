import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserPlus, 
  Check, 
  ExternalLink, 
  MapPin, 
  GraduationCap, 
  CheckCircle, 
  X, 
  Sparkles, 
  UserCheck,
  User,
  ShieldCheck
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
import { EmptyState, PageHeader } from '../components/common/UIComponents';

export default function NetworkingPage() {
  const { firebaseUser, profile } = useAuth();
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
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const [profiles, requestsData, conns] = await Promise.all([
        getPublicProfiles(firebaseUser.uid, { search: searchTerm }),
        getConnectionRequests(firebaseUser.uid),
        getConnectedUsers(firebaseUser.uid)
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
  }, [firebaseUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadNetworkData();
  };

  const handleConnect = async (peer) => {
    if (!firebaseUser) return;
    try {
      await sendConnectionRequest(
        { uid: firebaseUser.uid, displayName: profile?.displayName, headline: profile?.headline, photoURL: profile?.photoURL },
        { uid: peer.uid, displayName: peer.displayName, photoURL: peer.photoURL }
      );
      setSentRequestUids(prev => new Set(prev).add(peer.uid));
      showToast(`Connection request sent to ${peer.displayName || 'peer'}! 🎉`);
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
        { displayName: profile?.displayName },
        { displayName: request.fromUserName }
      );

      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      showToast(accept ? 'Connection request accepted! 🤝' : 'Request declined.');
      loadNetworkData();
    } catch (err) {
      showToast('Failed to respond to connection request', 'error');
    }
  };

  const isConnected = (uid) => {
    return connectedUsers.some(u => u.uid === uid || u.id === uid);
  };

  return (
    <div className="networking-page" style={{ paddingBottom: '50px' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        badge="Peer Community"
        title="Student Developer Network"
        description="Find and connect with real engineers, squad collaborators, and peers building across universities."
      />

      {/* 2. SEARCH & NAVIGATION TABS */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '260px', display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
            <Search size={18} color="var(--primary)" style={{ marginRight: '8px' }} />
            <input 
              type="text"
              placeholder="Search peers by name, skills (React, Python), college, or goal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                padding: '10px 0',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem'
              }}
            />
          </form>

          <div className="nav-tabs">
            <button
              onClick={() => setActiveTab('discover')}
              className={`nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
            >
              <Users size={14} /> Discover Peers ({peers.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`nav-tab ${activeTab === 'requests' ? 'active' : ''}`}
            >
              <UserPlus size={14} /> Requests ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`nav-tab ${activeTab === 'connections' ? 'active' : ''}`}
            >
              <UserCheck size={14} /> Connected ({connectedUsers.length})
            </button>
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card" style={{ height: '220px' }}>
              <div className="skeleton" style={{ height: '50px', width: '50px', borderRadius: '50%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '18px', width: '60%', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: '14px', width: '80%' }} />
            </div>
          ))}
        </div>
      ) : activeTab === 'discover' ? (
        peers.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="You're one of the first people on EdWorld"
            description="More students and peer engineers will appear here as they complete their developer identity."
            secondaryActionText="Share Profile Passport"
            secondaryActionLink={`/u/${profile?.username || ''}`}
          />
        ) : (
          <div className="grid-3">
            {peers.map(peer => {
              const isReq = sentRequestUids.has(peer.uid);
              const conn = isConnected(peer.uid);

              return (
                <div 
                  key={peer.id || peer.uid}
                  className="glass-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <UserAvatar 
                      name={peer.displayName} 
                      photoURL={peer.photoURL} 
                      size={54} 
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {peer.displayName || 'Peer'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                        {peer.headline || 'Software Engineer'}
                      </div>
                      {peer.college && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {peer.college}
                        </div>
                      )}
                    </div>
                  </div>

                  {peer.skills && peer.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {peer.skills.slice(0, 3).map((sk, i) => (
                        <span key={i} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                    <Link 
                      to={`/u/${peer.username || ''}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      View Passport
                    </Link>

                    <button 
                      onClick={() => handleConnect(peer)}
                      disabled={isReq || conn}
                      className={`btn btn-sm ${conn ? 'btn-outline' : isReq ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ flex: 1 }}
                    >
                      {conn ? 'Connected' : isReq ? 'Requested' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'requests' ? (
        incomingRequests.length === 0 ? (
          <EmptyState 
            icon={UserPlus}
            title="No pending requests"
            description="When peers request to connect with you, they will appear here."
          />
        ) : (
          <div className="grid-2">
            {incomingRequests.map(req => (
              <div key={req.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <UserAvatar name={req.fromUserName} photoURL={req.fromUserAvatar} size={48} />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{req.fromUserName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.fromUserHeadline || 'Software Engineer'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleRespond(req, true)} className="btn btn-primary btn-sm">
                    Accept
                  </button>
                  <button onClick={() => handleRespond(req, false)} className="btn btn-outline btn-sm">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        connectedUsers.length === 0 ? (
          <EmptyState 
            icon={UserCheck}
            title="No connections yet"
            description="Connect with fellow engineers to expand your developer squad."
            actionText="Discover Peers"
            onAction={() => setActiveTab('discover')}
          />
        ) : (
          <div className="grid-3">
            {connectedUsers.map(conn => (
              <div key={conn.id} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <UserAvatar name={conn.displayName} photoURL={conn.photoURL} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#fff' }}>{conn.displayName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>{conn.headline || 'Engineer'}</div>
                </div>
                <Link to={`/u/${conn.username || ''}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                  Profile
                </Link>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
