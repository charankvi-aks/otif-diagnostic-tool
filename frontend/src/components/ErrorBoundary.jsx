import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-8 max-w-3xl mx-auto my-12 text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Component Rendering Notice</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            An error occurred while loading this view. See diagnostic details below:
          </p>
          {this.state.error && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left overflow-x-auto text-xs font-mono text-rose-300 max-h-64 whitespace-pre-wrap">
              <div className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</div>
              {this.state.errorInfo?.componentStack && (
                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 mt-2">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="bg-diy-orange hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-diy-orange/20"
          >
            <RefreshCw className="w-4 h-4" /> Try Reloading View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
