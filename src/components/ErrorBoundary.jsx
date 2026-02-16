import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1 className="error-boundary__title">Algo salió mal</h1>
          <p className="error-boundary__message">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
          <button type="button" className="retry-btn" onClick={this.handleRetry}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
