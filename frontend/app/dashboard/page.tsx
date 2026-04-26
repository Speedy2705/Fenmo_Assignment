"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseTable from "@/components/ExpenseTable";
import { listExpenses } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { Expense } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [sortDateDesc, setSortDateDesc] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);
  }, [router]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [filtered, all] = await Promise.all([
        listExpenses(token, category || undefined, sortDateDesc ? "date_desc" : undefined),
        listExpenses(token, undefined, undefined),
      ]);

      const categories = Array.from(new Set(all.expenses.map((item) => item.category))).sort();

      setAllCategories(categories);
      setExpenses(filtered.expenses);
      setTotal(filtered.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load expenses";
      setError(message);
      if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("expired")) {
        clearToken();
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [token, category, sortDateDesc, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <main>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1>Expense Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {token ? <ExpenseForm token={token} onCreated={refresh} /> : null}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ minWidth: 220 }}>
            <label>Filter by category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {allCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <label>
            <input
              style={{ width: "auto", marginRight: 6 }}
              type="checkbox"
              checked={sortDateDesc}
              onChange={(e) => setSortDateDesc(e.target.checked)}
            />
            Sort by date (newest first)
          </label>
        </div>

        <p style={{ marginTop: 12, fontWeight: 700 }}>Total: ₹{Number(total).toFixed(2)}</p>

        {loading ? <p>Loading...</p> : <ExpenseTable expenses={expenses} />}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
