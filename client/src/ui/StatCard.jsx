import "./ui.css";

export function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <small>{label}</small>
      <strong>{value}</strong>
      {hint && (
        <span
          style={{
            display: "block",
            marginTop: "0.3rem",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
