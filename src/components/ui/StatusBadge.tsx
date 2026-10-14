type StatusBadgeProps = {
  onDuty: boolean;
};

export function StatusBadge({ onDuty }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        onDuty
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {onDuty ? "On duty" : "Off duty"}
    </span>
  );
}
