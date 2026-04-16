import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ShieldCheck, Wallet, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'premium';
  const billing = searchParams.get('billing') || 'monthly';
  
  const isYearly = billing === 'yearly';
  const price = isYearly ? 490 : 49;
  
  const [method, setMethod] = useState<'gcash' | 'maya'>('gcash');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const { token, user, updateUser } = useAuth();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setStatus('processing');
    
    // Redirect to the standalone mock WebPay Gateway
    setTimeout(() => {
        if (method === 'gcash') {
            navigate(`/gateway/gcash?amount=${price}&phone=${phone}`);
        } else {
            // For maya, we just simulate inline success since we didn't build a maya portal
            setStatus('success');
        }
    }, 1200);
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md w-full animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="animate-in scale-in duration-300 delay-150" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 mt-4 leading-relaxed">
            Welcome to SmartCash Premium! Your mocked payment of ₱{price} via {method === 'gcash' ? 'GCash' : 'Maya'} was successful. You now have full access.
          </p>
          <button 
            onClick={() => navigate('/dashboard/student')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Simple Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="text-emerald-500">SmartCash</span> 
            <span className="text-slate-300 dark:text-slate-700">/</span> 
            Secure Checkout
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Complete your subscription</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                Select your payment method. This is a secure mock simulation.
              </p>
            </div>

            <form onSubmit={handleCheckout}>
              {/* Payment Methods */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                  Select Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod('gcash')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      method === 'gcash' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'gcash' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      <Wallet size={24} />
                    </div>
                    <span className={`font-bold ${method === 'gcash' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>GCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('maya')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      method === 'maya' 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'maya' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      <Wallet size={24} />
                    </div>
                    <span className={`font-bold ${method === 'maya' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>Maya</span>
                  </button>
                </div>
              </div>

              {/* Account Input */}
              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  {method === 'gcash' ? 'GCash' : 'Maya'} Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+63</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="912 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-14 pr-4 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'processing' || phone.length < 10}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold py-4 rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {status === 'processing' ? (
                  <><Loader2 size={20} className="animate-spin" /> Processing Payment...</>
                ) : (
                  <><ShieldCheck size={20} /> Pay ₱{price}.00 Securely</>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            
            <div className="flex justify-between items-center pb-6 border-b border-slate-700 mb-6">
              <div>
                <p className="font-medium text-slate-300 mb-1">Plan</p>
                <p className="text-xl font-bold">Premium Advanced</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-300 mb-1">Billing</p>
                <p className="text-xl font-bold capitalize">{billing}</p>
              </div>
            </div>

            <ul className="space-y-4 mb-8 text-sm text-slate-300">
              <li className="flex items-start gap-3"><Check size={18} className="text-emerald-400 shrink-0" /> Full access to Advanced Analytics</li>
              <li className="flex items-start gap-3"><Check size={18} className="text-emerald-400 shrink-0" /> Unlock downloadable Excel templates</li>
              <li className="flex items-start gap-3"><Check size={18} className="text-emerald-400 shrink-0" /> Personalized financial coaching insights</li>
              <li className="flex items-start gap-3"><Check size={18} className="text-emerald-400 shrink-0" /> Priority 24/7 dedicated support</li>
            </ul>

            <div className="pt-6 border-t border-slate-700 flex justify-between items-end">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Due</p>
                <p className="text-3xl font-bold">₱{price}<span className="text-xl text-slate-400">.00</span></p>
              </div>
              <div className="text-xs text-slate-400 text-right">
                <ShieldCheck size={16} className="inline mr-1 text-emerald-400" />
                Secure Mock
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
