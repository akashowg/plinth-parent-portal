"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type State = { error?: string; devCode?: string; done?: boolean; message?: string };

function Submit({ label, danger }: { label: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={danger ? "btn btn-danger" : "btn"} disabled={pending} aria-busy={pending}>
      {pending ? "…" : label}
    </button>
  );
}

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
  const [state, formAction] = useActionState(action, {});
  if (state.done && doneView) return <>{doneView}</>;
  return (
    <form action={formAction} className="form" noValidate={false}>
      {children}
      {state.error && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="notice" role="status">
          {state.message}
        </p>
      )}
      <div className="actions">
        <Submit label={submitLabel} danger={danger} />
      </div>
    </form>
  );
}
