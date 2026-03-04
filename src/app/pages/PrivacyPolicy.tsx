import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased">
            <Navbar />

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h1 className="text-3xl md:text-4xl font-black mb-8 text-emerald-600 dark:text-emerald-400">
                        Privacy Policy
                    </h1>

                    <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
                            <p>
                                Welcome to SmartCash. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application. SmartCash is built specifically for Senior High School ABM students at STI College Malolos. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
                            <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect includes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and student ID or grade section.</li>
                                <li><strong>Financial Data:</strong> Data related to your budget tracking, income, expenses, and savings goals entered into our system for educational tracking purposes.</li>
                                <li><strong>Academic Data:</strong> Lesson progress, quiz scores, and earned badges within the SmartCash learning modules.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
                            <p className="mb-2">Having accurate information about you permits us to provide you with a smooth, efficient, and customized educational experience. Specifically, we may use information collected about you to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Create and manage your student or faculty account.</li>
                                <li>Track your progress through financial literacy modules and quizzes.</li>
                                <li>Generate personalized AI-driven financial tips based on your budget entries.</li>
                                <li>Provide aggregated, anonymized data to faculty for class performance tracking.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Disclosure of Your Information</h2>
                            <p>
                                We may share information we have collected about you in certain situations. Your academic and platform usage data may be visible to designated faculty members and system administrators at STI College Malolos for grading and monitoring purposes. We do not sell, rent, or trade your personal or financial data to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Data Security</h2>
                            <p>
                                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Contact Us</h2>
                            <p>
                                If you have questions or comments about this Privacy Policy, please contact the SmartCash Administration at STI College Malolos.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
