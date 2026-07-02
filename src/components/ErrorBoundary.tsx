import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional label shown in the error card — defaults to "screen" */
  name?: string;
}

interface State {
  error: Error | null;
}

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[CLAO] Screen error:", error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 32,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(239,68,68,.08)",
            border: "1px solid rgba(239,68,68,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ font: `600 13px ${sans}`, color: "#F5F0E8", marginBottom: 8 }}>
            {this.props.name ?? "Screen"} encountered an error
          </div>
          <div
            style={{
              font: `400 11px/1.5 ${mono}`,
              color: "#6B6560",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 5,
              padding: "8px 12px",
              marginBottom: 20,
              wordBreak: "break-all",
              textAlign: "left",
            }}
          >
            {error.message}
          </div>
          <button
            onClick={this.reset}
            style={{
              font: `600 12px ${sans}`,
              color: "#F5F0E8",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 5,
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
