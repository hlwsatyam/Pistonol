import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log this to an error tracking service
    console.error("🧨 UI Error:", error);
    console.error("📋 Error Info:", info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center text-red-700">
          <h1 className="text-3xl font-bold mb-4">⚠️ Something went wrong</h1>
          <p className="mb-2 text-lg">
            {this.state.error?.message || "Unknown error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
