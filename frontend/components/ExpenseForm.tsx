"use client";

import { FormEvent, useEffect, useState } from "react";
import { createExpense } from "@/lib/api";
import { ExpenseCreatePayload } from "@/lib/types";

const PENDING_KEY = "expense_pending_submission";

type Props = {
  token: string;
  onCreated: () => void;
};

type PendingSubmission = {
  idempotencyKey: string;
  payload: ExpenseCreatePayload;
};

function randomId() {
  return crypto.randomUUID();
}

export default function ExpenseForm({ token, onCreated }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<PendingSubmission | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PendingSubmission;
      setPending(parsed);
    } catch {
      localStorage.removeItem(PENDING_KEY);
    }
  }, []);

  async function submit(payload: ExpenseCreatePayload, idempotencyKey: string) {
    setBusy(true);
    setError("");

    localStorage.setItem(PENDING_KEY, JSON.stringify({ idempotencyKey, payload }));
    setPending({ idempotencyKey, payload });

    try {
      await createExpense(token, payload, idempotencyKey);
      localStorage.removeItem(PENDING_KEY);
      setPending(null);
      setAmount("");
      setCategory("");
      setDescription("");
      setDate("");
      onCreated();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create expense";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);

    if (!date) {
      setError("Date is required");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const payload: ExpenseCreatePayload = {
      amount: value.toFixed(2),
      category: category.trim(),
      description: description.trim(),
      date,
    };

    if (!payload.category || !payload.description) {
      setError("Category and description are required");
      return;
    }

    await submit(payload, randomId());
  }

  return (
    <div className="card">
      <h2>Add Expense</h2>
      <form onSubmit={onSubmit}>
        <div className="row">
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 499.50"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Food, Travel..."
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Date</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend on?"
            required
          />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button disabled={busy} type="submit">
            {busy ? "Saving..." : "Save Expense"}
          </button>
          {pending && (
            <button
              type="button"
              disabled={busy}
              onClick={() => submit(pending.payload, pending.idempotencyKey)}
            >
              Retry Pending Submission
            </button>
          )}
        </div>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </div>
  );
}
