import React from 'react';

/*
  Catches a crash inside one window so the rest of the desktop keeps running
  (without this, any error unmounts the whole app and leaves a blank page).
  Shows the error in a classic "illegal operation" box with a restart button.
*/
export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[${this.props.name}] crashed:`, error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div role="alert" className="w-full max-w-md bevel bg-paper">
          <p className="bg-ink px-3 py-2 font-mono text-lg uppercase leading-none text-paper">{this.props.name}.exe</p>
          <div className="p-4">
            <p className="font-mono text-xl leading-tight text-ink">
              This program has performed an illegal operation and will be shut down.
            </p>
            <p className="mt-3 break-words bg-ink/5 p-2 font-mono text-base leading-tight text-ink/70">
              {String(error?.message || error)}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-4 bevel bg-accent px-4 py-2 font-mono text-lg uppercase leading-none text-ink hover:bg-accent-2"
            >
              Restart app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
