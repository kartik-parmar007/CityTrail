import React from 'react';
import { Download, Smartphone, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../App.css';

const DownloadPage = () => {
    return (
        <div className="form-page-container" style={{ flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '20px', padding: '0 20px' }}>
                <Link to="/">
                    <img src="/logo.jpeg" alt="CityTrail Logo" style={{ height: '40px', objectFit: 'contain' }} />
                </Link>
                <Link to="/" style={{ color: '#0f172a', fontWeight: '600', textDecoration: 'none' }}>Back to Home</Link>
            </div>

            <div className="auth-form-wrapper" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444' }}>
                        <Smartphone size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Get CityTrail App</h2>
                    <p style={{ color: '#64748b' }}>Install our app on your device for a smoother booking experience.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="install-step" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Globe size={20} color="#ef4444" />
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Android / Chrome</h3>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#475569', fontSize: '0.95rem' }}>
                            <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}>
                                <CheckCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '4px' }} />
                                <span>Open <b>citytrail.in</b> in Chrome browser.</span>
                            </li>
                            <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}>
                                <CheckCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '4px' }} />
                                <span>Wait for the "Add to Home Screen" prompt or click the three dots menu.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <CheckCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '4px' }} />
                                <span>Select <b>"Install App"</b> to add it to your apps.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="install-step" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Smartphone size={20} color="#ef4444" />
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>iOS / Safari</h3>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#475569', fontSize: '0.95rem' }}>
                            <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}>
                                <CheckCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '4px' }} />
                                <span>Open <b>citytrail.in</b> in Safari browser.</span>
                            </li>
                            <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}>
                                <CheckCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '4px' }} />
                                <span>Tap the <b>Share</b> button (square with arrow up).</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <CheckCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '4px' }} />
                                <span>Scroll down and tap <b>"Add to Home Screen"</b>.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', color: '#fff', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Direct APK Download</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Want the raw Android installer? Download it directly below.</p>
                    <button 
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                        disabled
                    >
                        <Download size={20} />
                        APK Coming Soon
                    </button>
                    <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: '#64748b' }}>Play Store submission in progress.</p>
                </div>
            </div>

            <footer style={{ color: '#64748b', fontSize: '0.85rem' }}>
                &copy; {new Date().getFullYear()} CityTrail. All Rights Reserved.
            </footer>
        </div>
    );
};

export default DownloadPage;
