import FinancialStats from "../dashboard/_components/FinancialStats";
import RoiAnalysis from "../dashboard/_components/RoiAnalysis";
import CreditScore from "../dashboard/_components/CreditScore";
import BudgetExpenses from "../dashboard/_components/BudgetExpenses";
import AiMoneyTips from "../dashboard/_components/AiMoneyTips";

export default function FinancePanel() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      <section className="glass min-h-[280px] rounded-xl border border-white/10 p-4">
        <FinancialStats />
      </section>
      <section className="glass min-h-[280px] rounded-xl border border-white/10 p-4">
        <BudgetExpenses />
      </section>
      <section className="glass min-h-[280px] rounded-xl border border-white/10 p-4">
        <RoiAnalysis />
      </section>
      <section className="glass min-h-[280px] rounded-xl border border-white/10 p-4">
        <CreditScore />
      </section>
      <section className="glass min-h-[220px] rounded-xl border border-white/10 p-4 md:col-span-2">
        <AiMoneyTips />
      </section>
    </div>
  );
}
