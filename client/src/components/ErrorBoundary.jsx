import React from 'react';
import { Bot, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary Caught]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="glass-card rounded-3xl p-7 border border-emerald-500/30 space-y-4 bg-slate-900 text-slate-100 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Bot className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-black text-white">Kuchh samasya aayi hai</h2>
            <p className="text-sm text-slate-300">
              Chatbot me thodi samasya aayi hai. Application crash hone se bacha li gayi hai.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reload Karein
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
