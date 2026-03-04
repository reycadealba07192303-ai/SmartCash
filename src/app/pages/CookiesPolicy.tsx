import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CookiesPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased">
            <Navbar />

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h1 className="text-3xl md:text-4xl font-black mb-8 text-emerald-600 dark:text-emerald-400">
                        Cookies Policy
                    </h1>

                    <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. What are Cookies?</h2>
                            <p>
                                Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site. SmartCash uses cookies to improve your educational experience on our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. How We Use Cookies</h2>
                            <p className="mb-2">SmartCash uses cookies for the following purposes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Essential Cookies:</strong> These are required for the operation of the SmartCash platform. They include cookies that enable you to log into secure areas of our website, such as your student or faculty dashboard.</li>
                                <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our platform. This enables us to personalize our content for you, greet you by name, and remember your preferences (for example, your choice of light or dark theme).</li>
                                <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognize and count the number of visitors and to see how visitors move around our platform when they are using it. This helps us to improve the way SmartCash works, for example, by ensuring that users are finding what they are looking for easily.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Managing Cookies</h2>
                            <p>
                                You can set your browser not to accept cookies. However, in a few cases, some of our platform features may not function as a result, particularly the authentication and session management required for your dashboard access.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Changes to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CookiesPolicy;
