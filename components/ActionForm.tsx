"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from "react";

type State = { error?: string; devCode?: string; done?: boolean; message?: string };

/**
 * A server-action form that keeps what the person typed.
 *
 * React 19 resets an uncontrolled form after its action runs. When the server answers with an error
 * (an email it rejects, a mail outage, too many codes), that reset used to wipe every field and every
 * consent tick, and the only sign was a message at the very bottom: on a phone it looked as if the
 * button did nothing. Submitting through onSubmit + startTransition keeps the values; the error is
 * scrolled into view and focused so it is seen and announced. Without JavaScript the plain `action`
 * still works.
 */
export default function ActionForm({
  action,
  submitLabel,
  children,
  doneView,
  danger,
}: {
  action: (state: State, fd: FormData) => Promise<State>;
  submitLabel: string;
  children: ReactNode;
  doneView?: ReactNode;
  danger?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const errRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.error && errRef.current) {
      errRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      errRef.current.focus({ preventScroll: true });
    }
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  if (state.done && doneView) return <>{doneView}</>;
  return (
    <form action={formAction} onSubmit={onSubmit} className="form">
      {children}
      {state.error && (
        <p className="alert" role="alert" tabIndex={-1} ref={errRef}>
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="notice" role="status">
          {state.message}
        </p>
      )}
      <div className="actions">
        <button type="submit" className={danger ? "btn btn-danger" : "btn"} disabled={pending} aria-busy={pending}>
          {pending ? "…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
