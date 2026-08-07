function RiskBadge({ risk }) {
  let badge = {
    text: "Low",
    color: "#15803D",
    background: "#DCFCE7",
  };

  const value =
    typeof risk === "number"
      ? risk
      : risk === "High"
        ? 90
        : risk === "Medium"
          ? 60
          : 20;

  if (value >= 80) {
    badge = {
      text: "High",
      color: "#DC2626",
      background: "#FEE2E2",
    };
  } else if (value >= 50) {
    badge = {
      text: "Medium",
      color: "#D97706",
      background: "#FEF3C7",
    };
  }

  return (
    <span
      style={{
        background: badge.background,
        color: badge.color,
        padding: "8px 14px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "14px",
        display: "inline-block",
        minWidth: "75px",
        textAlign: "center",
      }}
    >
      {badge.text}
    </span>
  );
}

export default RiskBadge;
