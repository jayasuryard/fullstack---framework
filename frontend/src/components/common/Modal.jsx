// src/components/common/Modal.jsx
import { useEffect, useId, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({ isOpen, onClose, title, children, size = 'md', closeOnEscape = true }) => {
  const titleId = useId();
  const containerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the trigger element so focus can be restored to it on close.
    previouslyFocusedRef.current = document.activeElement;

    const container = containerRef.current;
    const focusables = container ? Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) : [];
    (focusables[0] || container)?.focus();

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key !== 'Tab' || !container) return;

      const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to whatever triggered the modal.
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/50 transition-all" onClick={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#14141f]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 id={titleId} className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            x
          </button>
        </div>
        <div className="p-6 text-white/80">
          {children}
        </div>
      </div>
    </div>
  );
};
