import React, { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { Plus, Minus, TrendingUp, TrendingDown, DollarSign, PieChart, Save, Edit2, Check, X, BarChart, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    is_edited?: boolean;
}

const BudgetPage: React.FC = () => {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Savings Goal State
    const [savingsGoal, setSavingsGoal] = useState({
        id: 0,
        name: 'My Savings Goal',
        current: 0,
        target: 1000
    });

    // Weekly Challenges State
    const [challenges, setChallenges] = useState<any[]>([]);

    // Financial Tip State
    const [financialTip, setFinancialTip] = useState('');
    const [isLoadingTip, setIsLoadingTip] = useState(false);

    const fetchTip = async (transData?: any[], savingsData?: any[]) => {
        setIsLoadingTip(true);
        try {
            const expenses = Array.isArray(transData) ? transData.filter((t: any) => t.type === 'expense') : [];
            const totalSpent = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
            const categoryTotals: Record<string, number> = {};
            expenses.forEach((t: any) => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
            });
            const topCategories = Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat]) => cat);

            const currentGoal = Array.isArray(savingsData)
                ? savingsData.find((g: any) => !g.name.startsWith('CHALLENGE:'))
                : undefined;

            // Client-side AI Tip Generation logic for immediate, varied feedback
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulate AI thinking delay for UI

            const generateTip = () => {
                const hasHighSpending = totalSpent > 5000;
                const topCats = topCategories.length > 0 ? topCategories.join(" and ") : "your expenses";

                const tips = [
                    "Always pay yourself first. Set aside your savings before spending your allowance.",
                    "Track every peso! Small daily expenses like snacks add up to big amounts by the end of the month.",
                    `I noticed you spend a lot on ${topCats}. Try setting a weekly limit for those categories!`,
                    "Before buying something you 'want', wait 24 hours. The urge to impulse buy usually fades.",
                    "Needs vs Wants: Always prioritize your school needs before your entertainment wants.",
                    "A budget isn't about restricting yourself, it's about giving your money a purpose.",
                    "Try the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.",
                    currentGoal?.target_amount ? `Keep going! You're working towards your ₱${currentGoal.target_amount} goal for ${currentGoal.name}.` : "Set a specific savings goal to stay motivated!",
                    hasHighSpending ? "Your spending is a bit high this month. Review your Recent Transactions and cut out non-essentials next week." : "Great job keeping your expenses low! Consider moving the extra money to your savings.",
                    "Unsubscribe from promotional emails or delete shopping apps to avoid the temptation to buy."
                ];

                // Ensure we don't show the exact same tip twice in a row
                let newTip = tips[Math.floor(Math.random() * tips.length)];
                while (newTip === financialTip) {
                    newTip = tips[Math.floor(Math.random() * tips.length)];
                }
                return newTip;
            };

            setFinancialTip(generateTip());

        } catch (err) {
            console.error('Tip generation error:', err);
        } finally {
            setIsLoadingTip(false);
        }
    };

    const fetchBudgetData = async () => {
        try {
            // Fetch Transactions
            const transRes = await fetch('https://smartcash-x4j5.onrender.com/api/budget/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const transData = await transRes.json();
            if (transRes.ok) setTransactions(transData);

            // Fetch Savings
            const savingsRes = await fetch('https://smartcash-x4j5.onrender.com/api/budget/savings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const savingsData = await savingsRes.json();
            if (savingsRes.ok) {
                const normalGoals = savingsData.filter((g: any) => !g.name.startsWith('CHALLENGE:'));
                const activeChallenges = savingsData.filter((g: any) => g.name.startsWith('CHALLENGE:'));
                setChallenges(activeChallenges);

                if (normalGoals.length > 0) {
                    setSavingsGoal({
                        id: normalGoals[0].id,
                        name: normalGoals[0].name,
                        current: Number(normalGoals[0].current_amount),
                        target: Number(normalGoals[0].target_amount)
                    });
                } else {
                    await handleCreateDefaultGoal();
                }
            }

            // Compute spending context for personalized AI tip
            const expenses2 = Array.isArray(transData) ? transData.filter((t: any) => t.type === 'expense') : [];
            const categoryTotals2: Record<string, number> = {};
            expenses2.forEach((t: any) => {
                categoryTotals2[t.category] = (categoryTotals2[t.category] || 0) + Number(t.amount);
            });
            // Fire tip fetch in background (don't await, page should load fast)
            fetchTip(transData, Array.isArray(savingsData) ? savingsData : []);

        } catch (error) {
            console.error('Error fetching budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDefaultGoal = async () => {
        try {
            const res = await fetch('https://smartcash-x4j5.onrender.com/api/budget/savings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: 'My Goal', target_amount: 1000, current_amount: 0 })
            });
            const data = await res.json();
            if (res.ok) {
                setSavingsGoal({
                    id: data.id,
                    name: data.name,
                    current: Number(data.current_amount),
                    target: Number(data.target_amount)
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (token) fetchBudgetData();
        else setLoading(false);
    }, [token]);

    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTrans, setNewTrans] = useState<Partial<Transaction>>({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        amount: undefined,
        description: ''
    });

    const handleEditClick = (t: Transaction) => {
        setNewTrans({
            type: t.type,
            date: t.date,
            category: t.category,
            amount: t.amount,
            description: t.description
        });
        setEditingId(t.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyExpensesByCategory = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.category !== 'Savings')
        .reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    const budgetTrackerData = Object.entries(monthlyExpensesByCategory)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

    const totalSpentThisMonth = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [isAddingSavings, setIsAddingSavings] = useState(false);
    const [tempSavingsInput, setTempSavingsInput] = useState('');
    const [tempGoalName, setTempGoalName] = useState('');
    const [tempGoalTarget, setTempGoalTarget] = useState('');

    const handleAddSavings = async () => {
        if (!tempSavingsInput) return;
        const amount = parseFloat(tempSavingsInput);
        if (isNaN(amount) || amount <= 0) return;

        setTempSavingsInput('');
        setIsAddingSavings(false);

        try {
            // Add a Savings transaction — the backend will auto-increment the goal
            await fetch('https://smartcash-x4j5.onrender.com/api/budget/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    type: 'expense',
                    category: 'Savings',
                    amount: amount,
                    description: `Transfer to ${savingsGoal.name}`,
                    date: new Date().toISOString().split('T')[0]
                })
            });

            // Re-fetch to get the updated goal from the server
            fetchBudgetData();

        } catch (error) {
            console.error('Error adding savings:', error);
        }
    };

    const handleAcceptChallenge = async (challengeName: string, targetAmount: number) => {
        try {
            const res = await fetch('https://smartcash-x4j5.onrender.com/api/budget/savings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: `CHALLENGE: ${challengeName}`, target_amount: targetAmount, current_amount: 0 })
            });
            if (res.ok) {
                fetchBudgetData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateGoal = async () => {
        if (!tempGoalName || !tempGoalTarget) return;

        const updatedGoal = {
            ...savingsGoal,
            name: tempGoalName,
            target: parseFloat(tempGoalTarget)
        };

        setSavingsGoal(prev => ({
            ...prev,
            name: updatedGoal.name,
            target: updatedGoal.target
        }));
        setIsEditingGoal(false);

        try {
            await fetch(`https://smartcash-x4j5.onrender.com/api/budget/savings/${savingsGoal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: updatedGoal.name, target_amount: updatedGoal.target })
            });
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const openEditGoal = () => {
        setTempGoalName(savingsGoal.name);
        setTempGoalTarget(savingsGoal.target.toString());
        setIsEditingGoal(true);
    };

    const handleSaveTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(newTrans.amount);
        if (!amount || amount <= 0 || !newTrans.category) {
            setSaveError('Please fill in all required fields.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const isEdit = editingId !== null;
            const url = isEdit
                ? `https://smartcash-x4j5.onrender.com/api/budget/transactions/${editingId}`
                : 'https://smartcash-x4j5.onrender.com/api/budget/transactions';
            const method = isEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...newTrans, amount })
            });

            if (res.ok) {
                const data = await res.json();
                if (isEdit) {
                    setTransactions(transactions.map(t => t.id === editingId ? data : t));
                } else {
                    setTransactions([data, ...transactions]);
                }
                setIsAdding(false);
                setEditingId(null);
                setNewTrans({ type: 'expense', date: new Date().toISOString().split('T')[0], category: 'Food', amount: undefined, description: '' });
                setSaveError(null);

                // If it's a Savings transaction, re-fetch to sync the Savings Goal widget
                if (newTrans.category === 'Savings') {
                    fetchBudgetData();
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                setSaveError(errData.error || `Server error: ${res.status}. Please try again.`);
            }
        } catch (error: any) {
            console.error('Error saving transaction:', error);
            setSaveError('Network error. Is the server running?');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Budget Tool</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Track your allowance, expenses, and savings.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (isAdding) {
                                setIsAdding(false);
                                setEditingId(null);
                                setNewTrans({ type: 'expense', date: new Date().toISOString().split('T')[0], category: 'Food', amount: undefined, description: '' });
                            } else {
                                setIsAdding(true);
                            }
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        {isAdding ? <X size={20} /> : <Plus size={20} />}
                        {isAdding ? 'Cancel' : 'Add Transaction'}
                    </button>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-emerald-500/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Balance</span>
                        </div>
                        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">₱{balance.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Income</span>
                        </div>
                        <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">₱{totalIncome.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-red-500/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
                                <TrendingDown size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Expenses</span>
                        </div>
                        <p className="text-4xl font-extrabold text-red-600 dark:text-red-400">₱{totalExpense.toLocaleString()}</p>
                    </div>
                </div>

                {/* Add/Edit Transaction Form */}
                {isAdding && (
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-xl mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingId ? 'Edit Transaction' : 'Add New Transaction'}
                        </h3>
                        <form onSubmit={handleSaveTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewTrans({ ...newTrans, type: 'income', category: 'Allowance' })}
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${newTrans.type === 'income' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewTrans({ ...newTrans, type: 'expense', category: 'Food' })}
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${newTrans.type === 'expense' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    >
                                        Expense
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount (₱)</label>
                                <input
                                    type="number"
                                    value={newTrans.amount || ''}
                                    onChange={(e) => setNewTrans({ ...newTrans, amount: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                <select
                                    value={newTrans.category}
                                    onChange={(e) => setNewTrans({ ...newTrans, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {newTrans.type === 'income' ? (
                                        <>
                                            <option value="Allowance">Allowance</option>
                                            <option value="Salary">Salary/Side Hustle</option>
                                            <option value="Gift">Gift</option>
                                            <option value="Other">Other</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Food">Food</option>
                                            <option value="Transport">Transport</option>
                                            <option value="School Supplies">School Supplies</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Savings">Savings</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newTrans.description}
                                    onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="What was this for?"
                                />
                            </div>

                            <div className="md:col-span-2 mt-2">
                                {saveError && (
                                    <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
                                        ⚠️ {saveError}
                                    </div>
                                )}
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setSaveError(null);
                                            setEditingId(null);
                                            setNewTrans({ type: 'expense', date: new Date().toISOString().split('T')[0], category: 'Food', amount: undefined, description: '' });
                                        }}
                                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" /></svg>Saving...</>
                                        ) : (
                                            <><Save size={18} />{editingId ? 'Update Transaction' : 'Save Transaction'}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Budget Tracker (Monthly Overview) */}
                    <div className="bg-[#0b1426] text-white p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col max-h-[500px]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Monthly Overview</p>
                                <h2 className="text-2xl font-extrabold tracking-tight">Budget Tracker</h2>
                            </div>
                            <div className="p-2.5 bg-emerald-900/40 rounded-xl">
                                <BarChart className="text-emerald-400" size={24} />
                            </div>
                        </div>

                        <div className="space-y-7 flex-grow overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                            {budgetTrackerData.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">No expenses recorded for this month yet.</p>
                            ) : budgetTrackerData.map((item, index) => {
                                const colors = ['bg-emerald-400', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                                const colorClass = colors[index % colors.length];
                                const percentage = totalSpentThisMonth > 0 ? (item.amount / Math.max(totalSpentThisMonth, 1)) * 100 : 0;

                                return (
                                    <div key={item.category}>
                                        <div className="flex justify-between text-base mb-2.5">
                                            <span className="text-slate-300 font-medium">{item.category}</span>
                                            <span className="font-semibold text-slate-200">₱{item.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-[#1e293b] rounded-full h-3">
                                            <div className={`${colorClass} h-3 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800/70 flex justify-between items-end">
                            <span className="text-slate-400 text-sm font-medium">Total Spent this month</span>
                            <span className="text-xl font-bold">₱{totalSpentThisMonth.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm flex flex-col max-h-[500px]">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Transactions</h3>
                        <div className="space-y-4 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar flex-grow">
                            {transactions.length === 0 ? (
                                <p className="text-slate-500 text-sm italic py-8 text-center">No transactions found.</p>
                            ) : transactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                            {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {t.category}
                                                {t.is_edited && <span className="ml-2 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">Edited</span>}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {t.description} • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold ${t.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => handleEditClick(t)}
                                            className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Edit Transaction"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: 4 Cards in 1 Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* 1. Savings Goal */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden flex flex-col">
                        <div className="relative z-10 h-full flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <PieChart size={16} />
                                    Savings Goal
                                </h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={openEditGoal}
                                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                        title="Edit Goal"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setIsAddingSavings(true)}
                                        className="p-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-bold shadow-sm"
                                        title="Add Savings"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {isEditingGoal ? (
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm mb-3 space-y-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-emerald-100 block mb-1">Goal Name</label>
                                        <input
                                            value={tempGoalName}
                                            onChange={(e) => setTempGoalName(e.target.value)}
                                            className="w-full px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white placeholder-emerald-200/50 focus:outline-none focus:bg-white/30 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-emerald-100 block mb-1">Target Amount</label>
                                        <input
                                            type="number"
                                            value={tempGoalTarget}
                                            onChange={(e) => setTempGoalTarget(e.target.value)}
                                            className="w-full px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white placeholder-emerald-200/50 focus:outline-none focus:bg-white/30 text-xs"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={handleUpdateGoal} className="flex-1 bg-white text-emerald-600 py-1 rounded-lg text-xs font-bold">Save</button>
                                        <button onClick={() => setIsEditingGoal(false)} className="flex-1 bg-transparent border border-white/30 text-emerald-100 py-1 rounded-lg text-xs font-bold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-emerald-100 text-sm font-medium mb-4 truncate">{savingsGoal.name}</p>
                            )}

                            {isAddingSavings && (
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm mb-3 animate-in fade-in zoom-in duration-200">
                                    <label className="text-[10px] font-bold text-emerald-100 block mb-1">Add Amount to Save</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={tempSavingsInput}
                                            onChange={(e) => setTempSavingsInput(e.target.value)}
                                            placeholder="Amount"
                                            className="flex-1 px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white placeholder-emerald-200/50 focus:outline-none focus:bg-white/30 text-xs w-full"
                                            autoFocus
                                        />
                                        <button onClick={handleAddSavings} className="bg-emerald-400 text-white p-1 rounded-lg hover:bg-emerald-300">
                                            <Check size={14} />
                                        </button>
                                        <button onClick={() => setIsAddingSavings(false)} className="bg-red-400/80 text-white p-1 rounded-lg hover:bg-red-400">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between text-[10px] font-bold mb-1.5 text-emerald-50 mt-auto">
                                <span>₱{savingsGoal.current.toLocaleString()}</span>
                                <span>₱{savingsGoal.target.toLocaleString()} Goal</span>
                            </div>
                            <div className="w-full bg-black/20 h-2 rounded-full mb-1 overflow-hidden backdrop-blur-sm">
                                <div
                                    className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min((savingsGoal.current / savingsGoal.target) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-right text-emerald-100 font-bold">
                                {Math.round((savingsGoal.current / savingsGoal.target) * 100)}%
                            </p>
                        </div>
                    </div>

                    {/* 2. Weekly Challenges */}
                    <div className="bg-[#0b1426] backdrop-blur-xl rounded-3xl border border-slate-800 p-5 shadow-sm flex flex-col">
                        <h3 className="text-base font-bold text-white mb-4">Challenges</h3>

                        <div className="overflow-y-auto pr-1 custom-scrollbar flex-grow space-y-3 max-h-[220px]">
                            {challenges.length === 0 ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-400 leading-relaxed text-center py-2">No active challenges.</p>
                                    <div className="p-3 border border-emerald-900/50 bg-[#15233e] rounded-xl text-center">
                                        <h4 className="font-bold text-emerald-100 text-xs mb-1">Save ₱100 this week</h4>
                                        <button onClick={() => handleAcceptChallenge('Save ₱100 this week', 100)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-emerald-700 transition w-full mt-2">Join</button>
                                    </div>
                                    <div className="p-3 border border-blue-900/50 bg-[#15233e] rounded-xl text-center">
                                        <h4 className="font-bold text-blue-100 text-xs mb-1">No-Spend Weekend</h4>
                                        <button onClick={() => handleAcceptChallenge('No-Spend Weekend', 500)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition w-full mt-2">Join</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {challenges.map(c => {
                                        const progress = Math.min((Number(c.current_amount) / Number(c.target_amount)) * 100, 100);
                                        const isCompleted = progress >= 100;
                                        return (
                                            <div key={c.id} className="p-4 bg-[#15233e] border border-slate-700 rounded-2xl relative overflow-hidden group">
                                                {isCompleted && <div className="absolute inset-0 bg-emerald-500/10 z-0"></div>}
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-white text-xs truncate pr-2">{c.name.replace('CHALLENGE: ', '')}</h4>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold mb-1.5 text-slate-400">
                                                        <span>₱{Number(c.current_amount).toLocaleString()}</span>
                                                        <span>₱{Number(c.target_amount).toLocaleString()} Goal</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'}`} style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Budget Calculator */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col justify-center">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Calculator</h3>
                        <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Balance: <strong>₱{balance.toLocaleString()}</strong> split:</p>

                        <div className="space-y-3">
                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex justify-between items-center group transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Needs</span>
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">₱{(balance * 0.5).toLocaleString()}</span>
                            </div>
                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex justify-between items-center group transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Wants</span>
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">₱{(balance * 0.3).toLocaleString()}</span>
                            </div>
                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex justify-between items-center group transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Savings</span>
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">₱{(balance * 0.2).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Financial Tips */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Tips</h3>
                            <button
                                onClick={() => fetchTip(transactions, [])}
                                disabled={isLoadingTip}
                                title="Get a new tip"
                                className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-40"
                            >
                                <RefreshCcw size={13} className={isLoadingTip ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl flex-1 flex flex-col justify-center overflow-hidden">
                            <p className="font-bold mb-2 text-sm text-orange-800 dark:text-orange-400 flex items-center gap-1.5">
                                <TrendingUp size={16} /> Tip
                            </p>
                            {isLoadingTip ? (
                                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                    <RefreshCcw size={13} className="animate-spin flex-shrink-0" />
                                    <p className="text-[11px] font-medium italic">Generating personalized advice...</p>
                                </div>
                            ) : (
                                <p className="text-[11px] font-medium leading-[1.6] text-orange-800/80 dark:text-orange-300">
                                    {financialTip || 'Click ↺ to get a personalized AI tip based on your spending!'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BudgetPage;
