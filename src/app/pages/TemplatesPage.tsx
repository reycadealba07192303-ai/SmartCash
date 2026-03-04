import React, { useState } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { Download, FileText, PieChart, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TemplatesPageProps {
    role?: 'student' | 'teacher' | 'admin';
}

// ─── Helper: trigger browser download ─────────────────────────────────────
const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const toCSV = (rows: string[][]) => rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');

// ─── Template definitions ──────────────────────────────────────────────────
const TEMPLATES = [
    {
        id: 1,
        title: 'Monthly Budget Planner',
        description: 'Pre-filled with your actual income and expense transactions from the Budget Tool, grouped by category using the 50/30/20 budgeting rule.',
        icon: PieChart,
        color: 'blue',
        format: 'CSV (.csv)',
        filename: 'monthly_budget_planner.csv',
        connected: true,
    },
    {
        id: 2,
        title: 'Savings Goal Tracker',
        description: 'Pre-filled with your savings goals from the Budget Tool — including goal names, current amounts, and target amounts.',
        icon: TrendingUp,
        color: 'emerald',
        format: 'CSV (.csv)',
        filename: 'savings_goal_tracker.csv',
        connected: true,
    },
    {
        id: 3,
        title: 'Daily Income & Expense Tracker',
        description: 'Lists every transaction you recorded in the Budget Tool day-by-day, with income vs. expense, category, description, and running net balance.',
        icon: FileText,
        color: 'purple',
        format: 'CSV (.csv)',
        filename: 'daily_income_expense_tracker.csv',
        connected: true,
    },
    {
        id: 4,
        title: 'Debt Repayment Calculator',
        description: 'Plan your path to becoming debt-free. Understand amortization, calculate monthly payments, and visualize how extra payments can shorten your repayment period.',
        icon: Shield,
        color: 'rose',
        format: 'CSV (.csv)',
        filename: 'debt_repayment_calculator.csv',
        connected: false,
    },
];

// ─── Data generators (using real budget data) ──────────────────────────────

const generateMonthlyBudget = (transactions: any[]): string => {
    const now = new Date();
    const monthLabel = now.toLocaleString('en-PH', { month: 'long', year: 'numeric' });

    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalExpenses = expenses.reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalSavings = totalIncome - totalExpenses;

    // Group expenses by category
    const expenseMap: Record<string, number> = {};
    expenses.forEach((t: any) => {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + Number(t.amount);
    });

    const incomeMap: Record<string, number> = {};
    income.forEach((t: any) => {
        incomeMap[t.category] = (incomeMap[t.category] || 0) + Number(t.amount);
    });

    const rows: string[][] = [
        ['MONTHLY BUDGET PLANNER', '', '', ''],
        [`Month/Year: ${monthLabel}`, '', 'Generated from SmartCash Budget Tool', ''],
        ['', '', '', ''],
        ['--- INCOME ---', '', '', ''],
        ['Source / Category', 'Total (₱)', 'Notes', ''],
        ...Object.entries(incomeMap).map(([cat, amt]) => [cat, amt.toFixed(2), '', '']),
        income.length === 0 ? ['(No income recorded yet)', '', '', ''] : [''],
        ['TOTAL INCOME', totalIncome.toFixed(2), '', ''],
        ['', '', '', ''],
        ['--- EXPENSES ---', '', '', ''],
        ['Category', 'Total Spent (₱)', '% of Income', 'Notes'],
        ...Object.entries(expenseMap).map(([cat, amt]) => [
            cat,
            amt.toFixed(2),
            totalIncome > 0 ? `${((amt / totalIncome) * 100).toFixed(1)}%` : '—',
            ''
        ]),
        expenses.length === 0 ? ['(No expenses recorded yet)', '', '', ''] : [''],
        ['TOTAL EXPENSES', totalExpenses.toFixed(2), '', ''],
        ['', '', '', ''],
        ['--- SUMMARY (50/30/20 Reference) ---', '', '', ''],
        ['Total Income', totalIncome.toFixed(2), '', ''],
        ['Total Expenses', totalExpenses.toFixed(2), '', ''],
        ['Net Savings', totalSavings.toFixed(2), '', ''],
        ['', '', '', ''],
        ['Target (50% Needs)', (totalIncome * 0.5).toFixed(2), '', ''],
        ['Target (30% Wants)', (totalIncome * 0.3).toFixed(2), '', ''],
        ['Target (20% Savings)', (totalIncome * 0.2).toFixed(2), '', ''],
        ['', '', '', ''],
        ['TIP: Aim for 50% Needs | 30% Wants | 20% Savings', '', '', ''],
    ];

    return toCSV(rows);
};

const generateSavingsTracker = (savingsGoals: any[], transactions: any[]): string => {
    const savingsTransactions = transactions.filter((t: any) => t.type === 'income' && t.category?.toLowerCase().includes('saving'))
        .concat(transactions.filter((t: any) => t.category?.toLowerCase().includes('saving')));

    const rows: string[][] = [
        ['SAVINGS GOAL TRACKER', '', '', '', '', ''],
        ['Generated from SmartCash Budget Tool', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['--- MY SAVINGS GOALS ---', '', '', '', '', ''],
        ['Goal Name', 'Target Amount (₱)', 'Current Savings (₱)', 'Remaining (₱)', 'Progress (%)', 'Status'],
        ...(savingsGoals.length > 0
            ? savingsGoals.map((g: any) => {
                const current = Number(g.current_amount || 0);
                const target = Number(g.target_amount || 0);
                const remaining = Math.max(0, target - current);
                const pct = target > 0 ? ((current / target) * 100).toFixed(1) : '0.0';
                const status = current >= target ? '✅ Reached!' : 'In Progress';
                return [g.name, target.toFixed(2), current.toFixed(2), remaining.toFixed(2), `${pct}%`, status];
            })
            : [['(No savings goals set yet — add one in the Budget Tool)', '', '', '', '', '']]
        ),
        ['', '', '', '', '', ''],
        ['--- SAVINGS TRANSACTIONS LOG ---', '', '', '', '', ''],
        ['Date', 'Description', 'Amount (₱)', 'Type', '', ''],
        ...(savingsTransactions.length > 0
            ? savingsTransactions.slice(0, 20).map((t: any) => [
                new Date(t.date).toLocaleDateString('en-PH'),
                t.description || t.category,
                Number(t.amount).toFixed(2),
                t.type,
                '', ''
            ])
            : [['(No savings transactions yet)', '', '', '', '', '']]
        ),
        ['', '', '', '', '', ''],
        ['SAVINGS TIPS:', '', '', '', '', ''],
        ['"Save first, spend what remains" - Warren Buffett', '', '', '', '', ''],
        ['Even ₱20/day = ₱7,300/year!', '', '', '', '', ''],
    ];

    return toCSV(rows);
};

const generateDailyTracker = (transactions: any[]): string => {
    // Group transactions by date
    const byDate: Record<string, any[]> = {};
    transactions.forEach((t: any) => {
        const d = new Date(t.date).toLocaleDateString('en-PH');
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(t);
    });

    const rows: string[][] = [
        ['DAILY INCOME & EXPENSE TRACKER', '', '', '', '', ''],
        ['Generated from SmartCash Budget Tool', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['Date', 'Type', 'Category', 'Description', 'Amount (₱)', 'Net Balance'],
    ];

    const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let runningBalance = 0;
    sortedDates.forEach(date => {
        const dayTxns = byDate[date];
        const dayIncome = dayTxns.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount), 0);
        const dayExpense = dayTxns.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount), 0);
        const dayNet = dayIncome - dayExpense;
        runningBalance += dayNet;

        rows.push([`--- ${date} ---`, '', '', '', '', '']);
        dayTxns.forEach((t: any) => {
            rows.push([
                date,
                t.type === 'income' ? '💰 Income' : '💸 Expense',
                t.category,
                t.description || '',
                (t.type === 'income' ? '+' : '-') + Number(t.amount).toFixed(2),
                ''
            ]);
        });
        rows.push([
            `Day Total`, '', '',
            `Income: ₱${dayIncome.toFixed(2)} | Expenses: ₱${dayExpense.toFixed(2)}`,
            `Net: ₱${dayNet >= 0 ? '+' : ''}${dayNet.toFixed(2)}`,
            `Running Balance: ₱${runningBalance.toFixed(2)}`
        ]);
        rows.push(['', '', '', '', '', '']);
    });

    if (sortedDates.length === 0) {
        rows.push(['(No transactions recorded yet — add them in the Budget Tool)', '', '', '', '', '']);
    }

    // Monthly summary
    const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount), 0);

    rows.push(
        ['=== MONTHLY SUMMARY ===', '', '', '', '', ''],
        ['Total Income (₱)', totalIncome.toFixed(2), '', '', '', ''],
        ['Total Expenses (₱)', totalExpense.toFixed(2), '', '', '', ''],
        ['Net Balance (₱)', (totalIncome - totalExpense).toFixed(2), '', '', '', ''],
        ['', '', '', '', '', ''],
        ['FINANCIAL INSIGHT: If Net Balance is NEGATIVE regularly, review your expenses and cut non-essentials first.', '', '', '', '', '']
    );

    return toCSV(rows);
};

const generateDebtCalculator = (): string => {
    const rows: string[][] = [
        ['DEBT REPAYMENT CALCULATOR & TRACKER', '', '', '', '', ''],
        ['Student Name:', '', '', 'Date:', '', ''],
        ['', '', '', '', '', ''],
        ['--- LOAN / DEBT DETAILS ---', '', '', '', '', ''],
        ['Description', 'Value', 'Notes', '', '', ''],
        ['Creditor (who you owe)', '', 'e.g., Family, Cooperative, SSS', '', '', ''],
        ['Principal Amount (₱)', '', 'Original amount borrowed', '', '', ''],
        ['Annual Interest Rate (%)', '', 'e.g., 12 for 12% per year', '', '', ''],
        ['Monthly Interest Rate (%)', '', '= Annual Rate / 12', '', '', ''],
        ['Loan Term (months)', '', 'How many months to repay', '', '', ''],
        ['Monthly Payment (₱)', '', '= P * r / (1 - (1+r)^-n)', '', '', ''],
        ['Total Amount to Repay (₱)', '', '= Monthly Payment x Months', '', '', ''],
        ['Total Interest to Pay (₱)', '', '= Total Repay - Principal', '', '', ''],
        ['', '', '', '', '', ''],
        ['--- AMORTIZATION SCHEDULE ---', '', '', '', '', ''],
        ['Month #', 'Opening Balance (₱)', 'Monthly Payment (₱)', 'Interest Portion (₱)', 'Principal Portion (₱)', 'Closing Balance (₱)'],
        ...Array.from({ length: 12 }, (_, i) => [`${i + 1}`, '', '', '', '', '']),
        ['TOTALS', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['--- EXTRA PAYMENT STRATEGY ---', '', '', '', '', ''],
        ['If I pay ₱___ extra per month:', '', '', '', '', ''],
        ['New Payoff Time (months)', '', '', '', '', ''],
        ['Interest Saved (₱)', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['REMEMBER: Paying even ₱50-100 extra per month can save thousands in interest!', '', '', '', '', ''],
        ['The AVALANCHE method: Pay highest interest debt first.', '', '', '', '', ''],
        ['The SNOWBALL method: Pay smallest debt first for motivation.', '', '', '', '', ''],
    ];
    return toCSV(rows);
};

// ─── Component ─────────────────────────────────────────────────────────────
const TemplatesPage: React.FC<TemplatesPageProps> = ({ role = 'student' }) => {
    const { token } = useAuth();
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
            case 'emerald': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
            case 'purple': return 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20';
            case 'rose': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
            default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        }
    };

    const handleDownload = async (template: typeof TEMPLATES[0]) => {
        setLoadingId(template.id);

        try {
            let csvContent = '';

            if (template.connected && role === 'student' && token) {
                // Fetch real budget data
                const [transRes, savingsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/budget/transactions', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:5000/api/budget/savings', { headers: { 'Authorization': `Bearer ${token}` } }),
                ]);

                const transactions = transRes.ok ? await transRes.json() : [];
                const savingsGoals = savingsRes.ok ? await savingsRes.json() : [];

                // Filter out challenge goals
                const normalGoals = savingsGoals.filter((g: any) => !g.name?.startsWith('CHALLENGE:'));

                if (template.id === 1) csvContent = generateMonthlyBudget(transactions);
                else if (template.id === 2) csvContent = generateSavingsTracker(normalGoals, transactions);
                else if (template.id === 3) csvContent = generateDailyTracker(transactions);
                else csvContent = generateDebtCalculator();
            } else {
                csvContent = generateDebtCalculator();
            }

            downloadCSV(template.filename, csvContent);

            // Log download server-side
            if (role === 'student' && token) {
                await fetch('http://localhost:5000/api/student/templates/download', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ template: template.title })
                }).catch(() => { });
            }
        } catch (err) {
            console.error('Template download error:', err);
            alert('Failed to generate template. Please try again.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <DashboardLayout role={role}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Downloadable Templates</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Tools to help you budget, save, and track your spending effectively. All templates are in CSV format — open with Excel, Google Sheets, or any spreadsheet app.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TEMPLATES.map((template) => (
                        <div key={template.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl border ${getColorClasses(template.color)}`}>
                                    <template.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {template.title}
                                        </h3>
                                        {template.connected && role === 'student' && (
                                            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                Live Data
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                {template.format}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(template)}
                                            disabled={loadingId === template.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white transition-all shadow-lg shadow-slate-900/10 dark:shadow-none disabled:opacity-60"
                                        >
                                            {loadingId === template.id
                                                ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
                                                : <><Download size={16} /> Download</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Usage tip */}
                <div className="mt-8 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold mb-1">💡 How to use these templates</p>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80">
                        The three <strong>Live Data</strong> templates are pre-filled with your actual Budget Tool transactions and savings goals.
                        Open in <strong>Microsoft Excel</strong>, <strong>Google Sheets</strong>, or <strong>WPS Office</strong> to view and edit your data.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TemplatesPage;
