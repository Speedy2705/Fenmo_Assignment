import { Expense } from "@/lib/types";

type Props = {
  expenses: Expense[];
};

export default function ExpenseTable({ expenses }: Props) {
  if (!expenses.length) {
    return <p className="muted">No expenses found for current filters.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            <td>{expense.date}</td>
            <td>{expense.category}</td>
            <td>{expense.description}</td>
            <td>₹{Number(expense.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
