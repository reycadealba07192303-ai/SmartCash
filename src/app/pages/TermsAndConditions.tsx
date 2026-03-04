import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsAndConditions: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased">
            <Navbar />

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h1 className="text-3xl md:text-4xl font-black mb-8 text-emerald-600 dark:text-emerald-400">
                        Terms and Conditions
                    </h1>

                    <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using SmartCash, you accept and agree to be bound by the terms and provision of this agreement. SmartCash is an educational platform designed for Senior High School ABM students at STI College Malolos. If you do not agree to abide by these terms, please do not use this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Educational Purpose</h2>
                            <p>
                                All content provided on SmartCash is for educational and informational purposes only. The financial tips, budget tracking tools, and AI-generated insights do not constitute professional financial advice. Students are encouraged to consult with their instructors for academic guidance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. User Accounts</h2>
                            <p>
                                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account. SmartCash and STI College Malolos reserve the right to refuse service, terminate accounts, or remove content in our sole discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Intellectual Property</h2>
                            <p>
                                The platform and its original content, features, and functionality are owned by SmartCash developers and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Disclaimer of Warranties</h2>
                            <p>
                                SmartCash is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the site or the information, content, or materials included on the site.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsAndConditions;
