function RiskBadge({ risk }) {
  const colors = {
    High: "#DC2626",
    Medium: "#F59E0B",
    Low: "#16A34A",
  };

  return (
    <div
      style={{
        background: colors[risk] + "20",
        color: colors[risk],
        padding: "6px 14px",
        borderRadius: 20,
        fontWeight: 600,
        textAlign: "center",
        width: 80,
      }}
    >
      {risk}
    </div>
  );
}

export default RiskBadge;
