import React, { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { Plus, Minus, TrendingUp, TrendingDown, DollarSign, PieChart, Save, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Transaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
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
    const [financialTip, setFinancialTip] = useState('Loading smart tip...');

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

            // Fetch Financial Tip
            const tipRes = await fetch('https://smartcash-x4j5.onrender.com/api/student/financial-tips', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (tipRes.ok) {
                const tipData = await tipRes.json();
                if (tipData.tip) setFinancialTip(tipData.tip);
            }

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
    const [newTrans, setNewTrans] = useState<Partial<Transaction>>({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: 'Food', // Pre-fill so dropdown is valid from the start
        amount: undefined,
        description: ''
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [isAddingSavings, setIsAddingSavings] = useState(false);
    const [tempSavingsInput, setTempSavingsInput] = useState('');
    const [tempGoalName, setTempGoalName] = useState('');
    const [tempGoalTarget, setTempGoalTarget] = useState('');

    const handleAddSavings = async () => {
        if (!tempSavingsInput) return;
        const amount = parseFloat(tempSavingsInput);
        if (isNaN(amount) || amount <= 0) return;

        // Optimistic UI update
        const newCurrent = savingsGoal.current + amount;
        setSavingsGoal(prev => ({ ...prev, current: newCurrent }));
        setTempSavingsInput('');
        setIsAddingSavings(false);

        try {
            // Update Goal in Backend
            await fetch(`https://smartcash-x4j5.onrender.com/api/budget/savings/${savingsGoal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...savingsGoal, current_amount: newCurrent })
            });

            // Add Transaction for record
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

            // Re-fetch to ensure sync
            fetchBudgetData();

        } catch (error) {
            console.error('Error adding savings:', error);
            // Revert on error would go here
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

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(newTrans.amount);
        if (!amount || amount <= 0 || !newTrans.category) {
            setSaveError('Please fill in all required fields.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const res = await fetch('https://smartcash-x4j5.onrender.com/api/budget/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...newTrans, amount })
            });

            if (res.ok) {
                const data = await res.json();
                setTransactions([data, ...transactions]);
                setIsAdding(false);
                setNewTrans({ type: 'expense', date: new Date().toISOString().split('T')[0], category: 'Food', amount: undefined, description: '' });
                setSaveError(null);
            } else {
                const errData = await res.json().catch(() => ({}));
                setSaveError(errData.error || `Server error: ${res.status}. Please try again.`);
            }
        } catch (error: any) {
            console.error('Error adding transaction:', error);
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
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={20} />
                        Add Transaction
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Transaction Form */}
                    {isAdding && (
                        <div className="lg:col-span-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-xl mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Transaction</h3>
                            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            onClick={() => { setIsAdding(false); setSaveError(null); }}
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
                                                <><Save size={18} />Save Transaction</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Recent Transactions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Transactions</h3>
                            <div className="space-y-4">
                                {transactions.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                                {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{t.category}</p>
                                                <p className="text-xs text-slate-500">{t.description} • {t.date}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${t.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Savings Goals / Info */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <PieChart size={20} />
                                        Savings Goal
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={openEditGoal}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                            title="Edit Goal"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setIsAddingSavings(true)}
                                            className="p-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-bold shadow-sm"
                                            title="Add Savings"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {isEditingGoal ? (
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4 space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-emerald-100 block mb-1">Goal Name</label>
                                            <input
                                                value={tempGoalName}
                                                onChange={(e) => setTempGoalName(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-emerald-200/50 focus:outline-none focus:bg-white/30 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-emerald-100 block mb-1">Target Amount</label>
                                            <input
                                                type="number"
                                                value={tempGoalTarget}
                                                onChange={(e) => setTempGoalTarget(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-emerald-200/50 focus:outline-none focus:bg-white/30 text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={handleUpdateGoal} className="flex-1 bg-white text-emerald-600 py-1.5 rounded-lg text-sm font-bold">Save</button>
                                            <button onClick={() => setIsEditingGoal(false)} className="flex-1 bg-transparent border border-white/30 text-emerald-100 py-1.5 rounded-lg text-sm font-bold">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-emerald-100 text-lg font-medium mb-6">{savingsGoal.name}</p>
                                )}

                                {isAddingSavings && (
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4 animate-in fade-in zoom-in duration-200">
                                        <label className="text-xs font-bold text-emerald-100 block mb-1">Add Amount to Save</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={tempSavingsInput}
                                                onChange={(e) => setTempSavingsInput(e.target.value)}
                                                placeholder="Amount"
                                                className="flex-1 px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-emerald-200/50 focus:outline-none focus:bg-white/30 text-sm"
                                                autoFocus
                                            />
                                            <button onClick={handleAddSavings} className="bg-emerald-400 text-white p-2 rounded-lg hover:bg-emerald-300">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => setIsAddingSavings(false)} className="bg-red-400/80 text-white p-2 rounded-lg hover:bg-red-400">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between text-xs font-bold mb-2 text-emerald-50">
                                    <span>₱{savingsGoal.current.toLocaleString()} Saved</span>
                                    <span>₱{savingsGoal.target.toLocaleString()} Goal</span>
                                </div>
                                <div className="w-full bg-black/20 h-3 rounded-full mb-2 overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out"
                                        style={{ width: `${Math.min((savingsGoal.current / savingsGoal.target) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-right text-emerald-100 mt-2 font-bold">
                                    {Math.round((savingsGoal.current / savingsGoal.target) * 100)}% Completed
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Weekly Challenges</h3>

                            {challenges.length === 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500 mb-4">You don't have any active challenges. Join one below to earn badges!</p>
                                    <div className="p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                        <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Save ₱100 this week</h4>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">Cut back on one snack a day.</p>
                                        <button onClick={() => handleAcceptChallenge('Save ₱100 this week', 100)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition w-full">Join Challenge</button>
                                    </div>
                                    <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">No-Spend Weekend</h4>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">Try spending ₱0 on Saturday & Sunday.</p>
                                        <button onClick={() => handleAcceptChallenge('No-Spend Weekend', 500)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition w-full">Join Challenge</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {challenges.map(c => {
                                        const progress = Math.min((Number(c.current_amount) / Number(c.target_amount)) * 100, 100);
                                        const isCompleted = progress >= 100;
                                        return (
                                            <div key={c.id} className="p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl relative overflow-hidden group">
                                                {isCompleted && <div className="absolute inset-0 bg-emerald-500/10 z-0"></div>}
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{c.name.replace('CHALLENGE: ', '')}</h4>
                                                        {isCompleted && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Completed</span>}
                                                    </div>
                                                    <div className="flex justify-between text-xs font-bold mb-2 text-slate-500">
                                                        <span>₱{Number(c.current_amount).toLocaleString()} Saved</span>
                                                        <span>₱{Number(c.target_amount).toLocaleString()} Goal</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Budget Calculator */}
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Budget Calculator</h3>
                            <p className="text-sm text-slate-500 mb-4">Based on your current balance of <strong>₱{balance.toLocaleString()}</strong>, here is the recommended 50/30/20 budget split:</p>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 font-medium flex justify-between items-center group hover:border-emerald-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-slate-700 dark:text-slate-300">Needs (50%)</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">₱{(balance * 0.5).toLocaleString()}</span>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 font-medium flex justify-between items-center group hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-slate-700 dark:text-slate-300">Wants (30%)</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600">₱{(balance * 0.3).toLocaleString()}</span>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 font-medium flex justify-between items-center group hover:border-purple-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="text-slate-700 dark:text-slate-300">Savings (20%)</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600">₱{(balance * 0.2).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Financial Tips</h3>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl text-sm text-orange-800 dark:text-orange-300">
                                <p className="font-bold mb-2">💡 Did you know?</p>
                                <p className="leading-relaxed">{financialTip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BudgetPage;
