import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [promptState, setPromptState] = useState(null);
  const toastCounter = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = "info", message, title, duration = 3500 }) => {
      const id = ++toastCounter.current;
      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          message,
          duration,
        },
      ]);

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const confirm = useCallback(({ title, message, confirmText, cancelText }) => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        confirmText: confirmText || "Confirm",
        cancelText: cancelText || "Cancel",
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(null);
          resolve(false);
        },
      });
    });
  }, []);

  const prompt = useCallback(
    ({
      title,
      message,
      placeholder,
      confirmText,
      cancelText,
      initialValue,
    }) => {
      return new Promise((resolve) => {
        setPromptState({
          title,
          message,
          placeholder,
          confirmText: confirmText || "Continue",
          cancelText: cancelText || "Cancel",
          value: initialValue || "",
          onConfirm: (value) => {
            setPromptState(null);
            resolve(value);
          },
          onCancel: () => {
            setPromptState(null);
            resolve(null);
          },
        });
      });
    },
    [],
  );

  // Trigger alerts with useAlert().success|error|warning|info("Message").
  const value = useMemo(
    () => ({
      notify,
      confirm,
      prompt,
      success: (message, options = {}) =>
        notify({ type: "success", message, ...options }),
      error: (message, options = {}) =>
        notify({ type: "error", message, ...options }),
      warning: (message, options = {}) =>
        notify({ type: "warning", message, ...options }),
      info: (message, options = {}) =>
        notify({ type: "info", message, ...options }),
    }),
    [notify, confirm, prompt],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="status"
          >
            <div className="toast-content">
              {toast.title ? (
                <div className="toast-title">{toast.title}</div>
              ) : null}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {confirmState ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">{confirmState.title}</h3>
            <p className="modal-message">{confirmState.message}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={confirmState.onCancel}
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmState.onConfirm}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {promptState ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">{promptState.title}</h3>
            <p className="modal-message">{promptState.message}</p>
            <input
              className="form-control"
              type="text"
              placeholder={promptState.placeholder}
              value={promptState.value}
              onChange={(event) =>
                setPromptState((prev) => ({
                  ...prev,
                  value: event.target.value,
                }))
              }
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={promptState.onCancel}
              >
                {promptState.cancelText}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => promptState.onConfirm(promptState.value)}
              >
                {promptState.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
