import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl font-black">!</span>
          </div>
          <h3 className="text-lg font-black text-zinc-900 mb-2">Algo deu errado</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-md">
            Ocorreu um erro inesperado ao carregar esta seção. Tente novamente.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-3 rounded-xl bg-zinc-950 text-white font-bold text-sm hover:bg-zinc-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
