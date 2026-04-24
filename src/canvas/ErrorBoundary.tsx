import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Canvas render failed', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid h-screen place-items-center bg-paper px-6 text-ink">
          <section className="max-w-md rounded-[8px] border border-ink/10 bg-paper-2 p-5 shadow-sm">
            <h1 className="font-display text-[32px] leading-none">Canvas failed to render</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
              A block threw while rendering. The rest of the app is still mounted so the canvas JSON
              can be fixed locally.
            </p>
            <pre className="mt-4 overflow-auto rounded-[6px] border border-ink/10 bg-paper p-3 font-mono text-[11px] text-ink-2">
              {this.state.error.message}
            </pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
