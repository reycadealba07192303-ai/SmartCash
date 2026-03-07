import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';

interface PasswordStrengthProps {
    password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteria = [
        { label: 'At least 8 characters', met: minLength },
        { label: 'Contains an uppercase letter', met: hasUppercase },
        { label: 'Contains a number', met: hasNumber },
        { label: 'Contains a special symbol', met: hasSymbol },
    ];

    const strengthScore = criteria.filter(c => c.met).length;
    let strengthText = 'Weak';
    let strengthColor = 'bg-red-500';

    if (strengthScore === 4) {
        strengthText = 'Strong';
        strengthColor = 'bg-emerald-500';
    } else if (strengthScore >= 2) {
        strengthText = 'Fair';
        strengthColor = 'bg-amber-500';
    }

    return (
        <div className="mt-3 space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Strength</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${strengthColor} bg-opacity-20 ${strengthColor.replace('bg-', 'text-')}`}>
                    {strengthText}
                </span>
            </div>

            <div className="flex gap-1 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                {[1, 2, 3, 4].map((level) => (
                    <motion.div
                        key={level}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`h-full flex-1 ${level <= strengthScore ? strengthColor : 'bg-transparent'}`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 p-1">
                {criteria.map((criterion, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        {criterion.met ? (
                            <div className="bg-emerald-500 text-white rounded-full p-0.5">
                                <Check size={10} strokeWidth={3} />
                            </div>
                        ) : (
                            <div className="bg-slate-200 dark:bg-slate-700 text-slate-400 rounded-full p-0.5">
                                <X size={10} strokeWidth={3} />
                            </div>
                        )}
                        <span className={criterion.met ? "text-emerald-700 dark:text-emerald-400 font-medium" : ""}>
                            {criterion.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const isPasswordStrong = (password: string) => {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password);
};
