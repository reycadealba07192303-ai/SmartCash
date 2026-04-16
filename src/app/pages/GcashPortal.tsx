import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Upload, Lock, ShieldCheck, Loader2, Timer, CheckCircle, AlertTriangle } from 'lucide-react';

const GcashPortal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amountParam = searchParams.get('amount') || '49';
  const phoneParam = searchParams.get('phone') || '';
  const amount = parseFloat(amountParam).toFixed(2);
  const { token, user, updateUser } = useAuth();

  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [apiError, setApiError] = useState<{message: string, isInvalidImage: boolean, isAmountMismatch: boolean} | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Set the document title to add realism
  useEffect(() => {
    document.title = 'GCash WebPay - Secure Login';
    return () => { document.title = 'SmartCash'; }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
        navigate('/dashboard/student');
        return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const handlePay = async () => {
    if (!proofImage) return;
    setIsProcessing(true);
    setApiError(null);

    try {
      const response = await fetch('http://localhost:5000/api/payments/submit', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
         },
         body: JSON.stringify({
            amount,
            senderNumber: phoneParam,
            receiptImage: proofImage
         })
      });

      const data = await response.json();
      
      if (!response.ok) {
         setApiError({ 
             message: data.message || data.error || 'Failed to submit payment',
             isInvalidImage: data.error === 'IMAGE_INVALID',
             isAmountMismatch: data.error === 'AMOUNT_MISMATCH'
         });
         setIsProcessing(false);
         // If it's an invalid image or incorrect amount, clear the uploaded image to force them to re-upload
         if (data.error === 'IMAGE_INVALID' || data.error === 'AMOUNT_MISMATCH') {
            setProofImage(null);
         }
         return;
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/dashboard/student');
      }, 3000);

    } catch (err) {
      console.error('GCash Error', err);
      setApiError({ message: 'Network error occurred. Please try again.', isInvalidImage: false, isAmountMismatch: false });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#005CEE] font-sans selection:bg-blue-300 flex flex-col items-center">
      {/* Official-looking Header */}
      <div className="w-full bg-[#0050D0] shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
          <div className="w-8 h-8 rounded-full bg-white text-[#005CEE] flex items-center justify-center italic font-black">
            G
          </div>
          GCash
        </div>
        <div className="text-white/80 text-sm font-medium flex items-center gap-1">
          <Lock size={14} /> Secure WebPay
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-16">
        
        {/* Left Side: QR Code & Order Summary */}
        <div className="w-full max-w-sm text-white text-center md:text-left">
          <h2 className="text-[#99C2FF] font-semibold text-sm uppercase tracking-widest mb-2">Merchant</h2>
          <h1 className="text-3xl font-bold mb-8">SmartCash Premium</h1>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col items-center mb-6">
            <h3 className="font-medium text-[#99C2FF] mb-4">Scan QR code using GCash app</h3>
            <div className="bg-white p-2 text-center rounded-2xl w-56 h-56 flex items-center justify-center shadow-lg relative glow overflow-hidden">
              <img 
                src="/qr.png" 
                alt="My GCash QR" 
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SmartCash+Payment';
                }}
              />
            </div>
            <p className="mt-6 text-sm text-white/80 font-medium flex items-center gap-2 bg-blue-900/30 px-3 py-1.5 rounded-full">
               <Timer size={16} /> 
               Valid for {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
          
          <div className="flex justify-between items-end border-t border-white/20 pt-6">
            <span className="text-[#99C2FF] font-medium">Total Amount Due</span>
            <span className="text-4xl font-bold tracking-tight">₱ {amount}</span>
          </div>
        </div>

        {/* Right Side: Login Terminal */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden min-h-[480px] flex flex-col mt-4 md:mt-0 relative">
            
            {/* Loading / Success Overlay */}
            {(isProcessing || isSuccess) && (
              <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                {isSuccess ? (
                   <>
                     <CheckCircle size={64} className="text-emerald-500 mb-4 animate-bounce" />
                     <p className="text-emerald-600 font-bold text-xl mb-2">Receipt Submitted!</p>
                     <p className="text-slate-600 text-sm">Your payment is now pending review by our admins. You will be redirected shortly.</p>
                   </>
                ) : (
                   <>
                     <Loader2 size={48} className="text-[#005CEE] animate-spin mb-4" />
                     <p className="text-[#0050D0] font-bold text-lg animate-pulse">Verifying Receipt...</p>
                     <p className="text-slate-500 text-sm mt-2">Our AI is checking your uploaded image. Please wait...</p>
                   </>
                )}
              </div>
            )}

            <div className="p-8 md:p-10 flex-1 flex flex-col">
              <h2 className="text-[#0050D0] text-xl font-bold mb-2">
                Submit Proof of Payment
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Please secure your payment via GCash app, then upload a screenshot of your receipt.
              </p>

              {apiError && (
                 <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${apiError.isInvalidImage || apiError.isAmountMismatch ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <div className="text-sm">
                       <p className="font-bold">{apiError.isInvalidImage ? 'Invalid Receipt Detected' : apiError.isAmountMismatch ? 'Incorrect Payment Amount' : 'Upload Error'}</p>
                       <p className="mt-1 opacity-90">{apiError.message}</p>
                    </div>
                 </div>
              )}

              <div className="flex-1 flex flex-col items-center justify-center w-full">
                  {proofImage ? (
                    <div className="flex flex-col items-center w-full mt-auto mb-auto">
                       <img src={proofImage} alt="Proof" className="max-h-[170px] rounded-lg mb-4 border border-slate-200 shadow-sm" />
                       <button onClick={() => setProofImage(null)} className="text-sm text-red-500 font-medium hover:underline p-2">Remove Image</button>
                    </div>
                  ) : (
                    <label className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors p-6 group min-h-[180px]">
                      <div className="w-12 h-12 bg-[#005CEE]/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="text-[#005CEE]" size={24} />
                      </div>
                      <span className="text-[#0050D0] font-semibold text-center">Upload Receipt</span>
                      <span className="text-slate-400 text-xs mt-1">PNG or JPG</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onload = (e) => setProofImage(e.target?.result as string);
                             reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
              </div>

               <button 
                  onClick={handlePay}
                  disabled={!proofImage}
                  className="w-full bg-[#005CEE] hover:bg-[#004BBF] text-white font-bold py-4 rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
               >
                  Submit Payment
               </button>
            </div>
            
            <div className="bg-slate-50 py-4 px-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secured by GCash WebPay Portal Simulation
            </div>
          </div>
        </div>
        
      </div>

    </div>
  );
};

export default GcashPortal;
