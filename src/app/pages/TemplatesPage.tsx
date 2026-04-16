import React, { useState } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { Download, FileText, PieChart, TrendingUp, Shield, Loader2, CreditCard, Wallet, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';

interface TemplatesPageProps {
    role?: 'student' | 'teacher' | 'admin';
}

// ─── Helpers: trigger browser download ─────────────────────────────────────
const downloadXLS = (filename: string, htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ─── Template definitions ──────────────────────────────────────────────────
const TEMPLATES = [
    {
        id: 1,
        title: 'Monthly Budget Planner',
        description: 'Premium rich Excel layout. Pre-filled with your actual income and expense transactions from the Budget Tool.',
        icon: PieChart,
        color: 'purple',
        format: 'Excel (.xls)',
        filename: 'monthly_budget_planner.xls',
        connected: true,
        isPremium: true,
    },
    {
        id: 2,
        title: 'Savings Goal Tracker',
        description: 'Pre-filled with your savings goals from the Budget Tool — including goal names, current amounts, and target amounts.',
        icon: TrendingUp,
        color: 'emerald',
        format: 'Excel (.xls)',
        filename: 'savings_goal_tracker.xls',
        connected: true,
        isPremium: true,
    },
    {
        id: 3,
        title: 'Daily Income & Expense Tracker',
        description: 'Lists every transaction you recorded in the Budget Tool day-by-day, with income vs. expense, category, description.',
        icon: FileText,
        color: 'blue',
        format: 'Excel (.xls)',
        filename: 'daily_income_expense_tracker.xls',
        connected: true,
        isPremium: true,
    },
    {
        id: 4,
        title: 'Debt Repayment Calculator',
        description: 'Plan your path to becoming debt-free. Understand amortization, calculate monthly payments, and visualize.',
        icon: Shield,
        color: 'rose',
        format: 'Excel (.xls)',
        filename: 'debt_repayment_calculator.xls',
        connected: false,
        isPremium: true,
    },
];

// ─── Data generators ───────────────────────────────────────────────────────

const generateMonthlyBudgetHtml = (transactions: any[]): string => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const expenseMap: Record<string, number> = {};
    expenses.forEach((t: any) => { expenseMap[t.category] = (expenseMap[t.category] || 0) + Number(t.amount); });

    const categoryRows = Object.entries(expenseMap).map(([cat, spent]) => {
        const budget = (spent * 1.2).toFixed(2);
        const remaining = (Number(budget) - spent).toFixed(2);
        return `<tr>
                <td class="cell" style="text-align:left;">🏷️ ${cat}</td>
                <td class="cell">₱ ${Number(budget).toLocaleString()}</td>
                <td class="cell">₱ ${spent.toLocaleString()}</td>
                <td class="cell" style="color: ${Number(remaining) < 0 ? 'red' : 'green'}; font-weight: bold;">₱ ${remaining}</td>
                <td class="cell">🏦 Auto/Cash</td><td class="cell" style="color:#166534;">✅ Yes</td><td class="cell">End of month</td>
            </tr>`;
    });

    if (categoryRows.length === 0) categoryRows.push('<tr><td colspan="7" class="cell">No expenses recorded yet!</td></tr>');

    return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8" />
        <style>
            .table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
            .title-row td { background-color: #8b5cf6; color: white; font-size: 28px; font-weight: bold; text-align: left; padding: 15px; }
            .header-row td { background-color: #f3e8ff; color: #4c1d95; font-weight: bold; font-size: 14px; text-align: center; border: 1px solid #e5e7eb; padding: 10px; }
            .cell { border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-size: 14px; }
        </style>
    </head>
    <body>
        <table class="table" width="1000">
            <tr class="title-row"><td colspan="7">Monthly Budget 💸</td></tr>
            <tr class="header-row"><td>Category</td><td>Budget</td><td>Spent</td><td>Remaining</td><td>Payment Method</td><td>Recurring?</td><td>Due Date</td></tr>
            ${categoryRows.join('')}
            <tr><td class="cell" style="font-weight:bold; background-color:#eff6ff;">TOTAL</td><td class="cell" style="font-weight:bold; background-color:#eff6ff;" colspan="3"></td><td class="cell" colspan="3"></td></tr>
        </table>
    </body>
    </html>`;
};

const generateSavingsTrackerHtml = (savingsGoals: any[]): string => {
    const goalRows = savingsGoals.length > 0 ? savingsGoals.map((g: any) => {
        const current = Number(g.current_amount || 0);
        const target = Number(g.target_amount || 0);
        const remaining = Math.max(0, target - current);
        const pct = target > 0 ? ((current / target) * 100).toFixed(1) : '0.0';
        const isReached = current >= target;
        return `
            <tr>
                <td class="cell" style="text-align:left; font-weight:bold;">🎯 ${g.name}</td>
                <td class="cell">₱ ${target.toLocaleString()}</td>
                <td class="cell">₱ ${current.toLocaleString()}</td>
                <td class="cell">₱ ${remaining.toLocaleString()}</td>
                <td class="cell" style="color: ${isReached ? '#166534' : '#b45309'};">${pct}%</td>
                <td class="cell" style="background-color: ${isReached ? '#dcfce7' : '#fef3c7'}; font-weight:bold; color: ${isReached ? '#166534' : '#b45309'};">
                    ${isReached ? '✅ Reached!' : '⏳ In Progress'}
                </td>
            </tr>
        `;
    }) : ['<tr><td colspan="6" class="cell">No savings goals set yet! Add one in the Budget Tool.</td></tr>'];

    return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8" />
        <style>
            .table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
            .title-row td { background-color: #059669; color: white; font-size: 28px; font-weight: bold; text-align: left; padding: 15px; }
            .header-row td { background-color: #d1fae5; color: #065f46; font-weight: bold; font-size: 14px; text-align: center; border: 1px solid #e5e7eb; padding: 10px; }
            .cell { border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-size: 14px; }
        </style>
    </head>
    <body>
        <table class="table" width="1000">
            <tr class="title-row"><td colspan="6">Savings Goal Tracker 📈</td></tr>
            <tr class="header-row"><td>Goal Name</td><td>Target Amount</td><td>Current Savings</td><td>Remaining</td><td>Progress</td><td>Status</td></tr>
            ${goalRows.join('')}
        </table>
    </body>
    </html>`;
};

const generateDailyTrackerHtml = (transactions: any[]): string => {
    const byDate: Record<string, any[]> = {};
    transactions.forEach((t: any) => {
        const d = new Date(t.date).toLocaleDateString('en-PH');
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(t);
    });

    const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let runningBalance = 0;
    const rows: string[] = [];

    sortedDates.forEach(date => {
        const dayTxns = byDate[date];
        let dayNet = 0;
        
        dayTxns.forEach((t: any) => {
            const isIncome = t.type === 'income';
            const amt = Number(t.amount);
            dayNet += isIncome ? amt : -amt;
            runningBalance += isIncome ? amt : -amt;

            rows.push(`
                <tr>
                    <td class="cell">${date}</td>
                    <td class="cell" style="color: ${isIncome ? '#16a34a' : '#ef4444'}; font-weight:bold;">${isIncome ? '💰 Income' : '💸 Expense'}</td>
                    <td class="cell">${t.category}</td>
                    <td class="cell" style="text-align:left;">${t.description || ''}</td>
                    <td class="cell" style="color: ${isIncome ? '#16a34a' : '#ef4444'};">${isIncome ? '+' : '-'} ₱${amt.toLocaleString()}</td>
                    <td class="cell">₱ ${runningBalance.toLocaleString()}</td>
                </tr>
            `);
        });
        
        rows.push(`
            <tr style="background-color: #f8fafc;">
                <td class="cell" colspan="4" style="text-align:right; font-weight:bold; color: #475569;">Daily Net:</td>
                <td class="cell" style="font-weight:bold; color: ${dayNet >= 0 ? '#16a34a' : '#ef4444'};">${dayNet >= 0 ? '+' : ''}₱${dayNet.toLocaleString()}</td>
                <td class="cell" style="background-color:#e0f2fe; font-weight:bold; color: #0284c7;">₱ ${runningBalance.toLocaleString()}</td>
            </tr>
        `);
    });

    if (rows.length === 0) rows.push('<tr><td colspan="6" class="cell">No transactions recorded yet!</td></tr>');

    return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8" />
        <style>
            .table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
            .title-row td { background-color: #2563eb; color: white; font-size: 28px; font-weight: bold; text-align: left; padding: 15px; }
            .header-row td { background-color: #dbeafe; color: #1e3a8a; font-weight: bold; font-size: 14px; text-align: center; border: 1px solid #e5e7eb; padding: 10px; }
            .cell { border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-size: 14px; }
        </style>
    </head>
    <body>
        <table class="table" width="1000">
            <tr class="title-row"><td colspan="6">Daily Income & Expense Tracker 📄</td></tr>
            <tr class="header-row"><td>Date</td><td>Type</td><td>Category</td><td>Description</td><td>Amount</td><td>Running Balance</td></tr>
            ${rows.join('')}
        </table>
    </body>
    </html>`;
};

const generateDebtCalculatorHtml = (): string => {
    const rows = Array.from({ length: 12 }, (_, i) => `
        <tr>
            <td class="cell">${i + 1}</td>
            <td class="cell bg-empty"></td><td class="cell bg-empty"></td><td class="cell bg-empty"></td><td class="cell bg-empty"></td><td class="cell bg-empty"></td>
        </tr>
    `).join('');

    return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8" />
        <style>
            .table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
            .title-row td { background-color: #e11d48; color: white; font-size: 28px; font-weight: bold; text-align: left; padding: 15px; }
            .section-header td { background-color: #ffe4e6; color: #9f1239; font-weight: bold; font-size: 16px; text-align: left; border: 1px solid #e5e7eb; padding: 10px; }
            .header-row td { background-color: #f1f5f9; color: #334155; font-weight: bold; font-size: 14px; text-align: center; border: 1px solid #e5e7eb; padding: 10px; }
            .cell { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 14px; }
            .bg-empty { background-color: #f8fafc; }
        </style>
    </head>
    <body>
        <table class="table" width="1000">
            <tr class="title-row"><td colspan="6">Debt Repayment Calculator 🛡️</td></tr>
            <tr><td colspan="6" style="height:20px;"></td></tr>
            <tr class="section-header"><td colspan="6">--- LOAN / DEBT DETAILS ---</td></tr>
            <tr class="header-row"><td colspan="2">Description</td><td colspan="2">Input Value</td><td colspan="2">Notes</td></tr>
            <tr><td colspan="2" class="cell" style="font-weight:bold;">Creditor Name</td><td colspan="2" class="cell bg-empty"></td><td colspan="2" class="cell" style="color:#6b7280; font-size:12px;">e.g., Family, Bank, SSS</td></tr>
            <tr><td colspan="2" class="cell" style="font-weight:bold;">Principal Amount (₱)</td><td colspan="2" class="cell bg-empty"></td><td colspan="2" class="cell" style="color:#6b7280; font-size:12px;">Original amount borrowed</td></tr>
            <tr><td colspan="2" class="cell" style="font-weight:bold;">Annual Interest Rate (%)</td><td colspan="2" class="cell bg-empty"></td><td colspan="2" class="cell" style="color:#6b7280; font-size:12px;">e.g., 12 for 12% per year</td></tr>
            <tr><td colspan="2" class="cell" style="font-weight:bold;">Loan Term (months)</td><td colspan="2" class="cell bg-empty"></td><td colspan="2" class="cell" style="color:#6b7280; font-size:12px;">How many months to repay</td></tr>
            <tr><td colspan="6" style="height:20px;"></td></tr>
            <tr class="section-header"><td colspan="6">--- AMORTIZATION SCHEDULE ---</td></tr>
            <tr class="header-row"><td>Month #</td><td>Opening Balance (₱)</td><td>Monthly Payment (₱)</td><td>Interest Portion (₱)</td><td>Principal Portion (₱)</td><td>Closing Balance (₱)</td></tr>
            ${rows}
        </table>
    </body>
    </html>`;
};

// ─── Main Component ────────────────────────────────────────────────────────
const TemplatesPage: React.FC<TemplatesPageProps> = ({ role = 'student' }) => {
    const { token, user } = useAuth();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState<typeof TEMPLATES[0] | null>(null);

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
            case 'emerald': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
            case 'purple': return 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20';
            case 'rose': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
            default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        }
    };

    const handleDownloadClick = (template: typeof TEMPLATES[0]) => {
        if (template.isPremium && !user?.isPremium) {
            setPendingTemplate(template);
            setShowPaymentModal(true);
        } else {
            executeDownload(template);
        }
    };

    const handlePaymentComplete = () => {
        // Obsolete local state logic removed. We now handle payment in /checkout page
        setShowPaymentModal(false);
        if (pendingTemplate) {
            // Ideally they should be routed to /checkout if they try to download
        }
    };

    const executeDownload = async (template: typeof TEMPLATES[0]) => {
        setLoadingId(template.id);
        setPendingTemplate(null);
        try {
            let transactions: any[] = [];
            let goals: any[] = [];
            
            if (role === 'student' && token && template.connected) {
                const [transRes, goalsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/budget/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/api/budget/savings`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                transactions = transRes.ok ? await transRes.json() : [];
                goals = goalsRes.ok ? await goalsRes.json() : [];
            }

            let htmlContent = '';
            if (template.id === 1) htmlContent = generateMonthlyBudgetHtml(transactions);
            else if (template.id === 2) htmlContent = generateSavingsTrackerHtml(goals);
            else if (template.id === 3) htmlContent = generateDailyTrackerHtml(transactions);
            else if (template.id === 4) htmlContent = generateDebtCalculatorHtml();

            downloadXLS(template.filename, htmlContent);

            // Log download server-side
            if (role === 'student' && token) {
                await fetch(`${API_BASE}/api/student/templates/download`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ template: template.title })
                }).catch(() => { });
            }
        } catch (err) {
            console.error('Download error:', err);
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
                        Tools to help you budget, save, and track your spending effectively. Premium templates feature rich Excel styling!
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TEMPLATES.map((template) => (
                        <div key={template.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl border ${getColorClasses(template.color)}`}>
                                    {template.isPremium && !user?.isPremium ? <Lock size={24} className="text-slate-400" /> : <template.icon size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {template.title}
                                        </h3>
                                        {template.isPremium && !user?.isPremium && (
                                            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                Premium
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
                                            onClick={() => handleDownloadClick(template)}
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
            </div>

            {/* Payment Modal Simulation */}
            {showPaymentModal && pendingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transform animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="relative p-6 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/10">
                            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock Premium Template</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                To download the styled <strong>{pendingTemplate.title}</strong>, upgrade to the Premium Plan.
                            </p>
                        </div>
                        
                        {/* Body - Price */}
                        <div className="p-6">
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6 border border-slate-100 dark:border-slate-700">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Premium Plan (1 Month)</span>
                                <span className="font-bold text-xl text-slate-900 dark:text-white">₱49.00</span>
                            </div>

                            <a href="/checkout" className="w-full inline-flex font-bold items-center justify-center py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors gap-2">
                                <Shield size={18} /> Proceed to Secure Checkout
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TemplatesPage;
