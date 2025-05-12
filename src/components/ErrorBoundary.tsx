import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Algo deu errado
            </h2>
            <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {this.state.error?.message}
              </pre>
            </div>
            <p className="text-gray-600 mb-4">
              Por favor, tente recarregar a página ou volte para a página inicial.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Recarregar
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Página Inicial
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 