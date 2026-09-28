import { Component, type ReactNode } from 'react'
import { ErrorState } from './States'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error(error)
  }

  render() {
    if (this.state.error) {
      const chunk = /dynamically imported module|Loading chunk/i.test(this.state.error.message)
      return (
        <ErrorState
          title={chunk ? 'Não foi possível carregar esta página' : 'Ocorreu um erro'}
          text={chunk ? 'Verifique a ligação à internet e tente novamente.' : 'Tente recarregar a página.'}
          onRetry={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}
