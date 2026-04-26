"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onClose: () => void;
  durationMs?: number;
};

export default function Toast({ message, onClose, durationMs = 2600 }: Props) {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onClose, durationMs);
    return () => clearTimeout(timeout);
  }, [message, onClose, durationMs]);

  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-dot" aria-hidden="true">
        ✓
      </span>
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
}
