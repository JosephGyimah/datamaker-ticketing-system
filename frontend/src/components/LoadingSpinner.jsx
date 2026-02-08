export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
}) {
  return (
    <div className={`spinner-container spinner-${size}`} role="status">
      <span className={`spinner spinner-${size}`} aria-hidden="true"></span>
      <span className="spinner-text">{message}</span>
    </div>
  );
}
