import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('OpenShelf render error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
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
              The page failed to load. A quick refresh usually fixes it.
            </p>
            <button onClick={this.handleReload} className="os-btn-primary w-full">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
