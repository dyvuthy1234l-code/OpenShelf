import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('OpenShelf render error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin + window.location.pathname.replace(/\/+$/, '') + '/#/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="os-panel p-8 max-w-sm text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-navy-50 text-navy-700 flex items-center justify-center text-xl font-extrabold">
              !
            </div>
            <h2 className="text-lg font-extrabold text-brand-text tracking-tight mb-1">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              The page failed to load. A quick refresh or returning home usually fixes it.
            </p>
            <div className="space-y-2">
              <button onClick={this.handleReload} className="os-btn-primary w-full">
                Refresh Page
              </button>
              <button onClick={this.handleGoHome} className="os-btn-secondary w-full text-xs">
                Back to Home Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
