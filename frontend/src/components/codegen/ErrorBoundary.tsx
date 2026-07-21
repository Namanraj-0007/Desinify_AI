import React, { Component, ErrorInfo, ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 rounded-xl border border-red-500/20 bg-red-500/10">
          <div className="text-2xl mb-3">⚠️</div>
          <h3 className="font-semibold text-red-300 mb-2">Preview Error</h3>
          <p className="text-sm text-red-200/70 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering the preview.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
