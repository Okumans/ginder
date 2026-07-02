import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

// Catches render/lifecycle errors anywhere below it so a bug in one screen
// (e.g. a malformed restaurant record, a WebGL map hiccup) shows a
// recoverable, on-brand screen instead of a blank white page.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Ginder crashed:', error, info);
  }

  handleReload = () => {
    // A corrupted session snapshot is a common cause of a stuck crash loop —
    // clear it so reloading actually recovers instead of crashing again.
    try {
      sessionStorage.removeItem('ginder_session_state');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem',
          background: 'var(--no-bg)', border: '3px solid var(--no-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--no-color)'
        }}>
          <AlertOctagon size={30} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--ink)' }}>
          Something went sideways
        </h2>
        <p style={{ color: 'var(--ink)', opacity: 0.65, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Ginder hit an unexpected error. Reloading usually fixes it — your room code still works if your friends are waiting.
        </p>
        <button className="btn btn-primary" onClick={this.handleReload}>
          <RefreshCw size={18} />
          Reload Ginder
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
