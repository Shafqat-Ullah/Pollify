import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-center px-6">
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Something went wrong</h1>
          <p className="text-zinc-400 text-sm mb-6">
            An unexpected error occurred. Please refresh the page to continue.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
