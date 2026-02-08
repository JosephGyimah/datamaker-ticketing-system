export default function EmptyState({
  icon = "inbox",
  title = "Nothing here yet",
  description,
}) {
  return (
    <div className="empty-state" role="status">
      <i
        className={`fa-solid fa-${icon} empty-state-icon`}
        aria-hidden="true"
      />
      <div className="empty-state-title">{title}</div>
      {description ? (
        <div className="empty-state-description">{description}</div>
      ) : null}
    </div>
  );
}
