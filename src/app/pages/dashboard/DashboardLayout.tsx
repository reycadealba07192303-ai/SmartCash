import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard, BookOpen, Users, PieChart, LogOut, Settings, Award, MessageSquare, User, Download, Layers, Menu, X, Wallet } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'student' | 'teacher' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === '/dashboard/student' || path === '/dashboard/faculty' || path === '/dashboard/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/student' },
          { icon: Layers, label: 'My Modules', path: '/dashboard/student/modules' },
          { icon: BookOpen, label: 'My Lessons', path: '/dashboard/student/lessons' },
          { icon: PieChart, label: 'Budget Tool', path: '/dashboard/student/budget' },
          { icon: Award, label: 'Badges', path: '/dashboard/student/badges' },
          { icon: MessageSquare, label: 'Forum', path: '/dashboard/student/forum' },
          { icon: BookOpen, label: 'Blog', path: '/dashboard/student/blog' },
          { icon: Download, label: 'Templates', path: '/dashboard/student/templates' },
          { icon: Wallet, label: 'Payment History', path: '/dashboard/student/payments' },
          { icon: User, label: 'Account Info', path: '/dashboard/student/profile' },
        ];
      case 'teacher':
        return [
          { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/faculty' },
          { icon: Users, label: 'Students', path: '/dashboard/faculty/students' },
          { icon: BookOpen, label: 'Manage Content', path: '/dashboard/faculty/content' },
          { icon: MessageSquare, label: 'Discussions', path: '/dashboard/faculty/discussions' },
          { icon: BookOpen, label: 'Blog', path: '/dashboard/faculty/blog' },
          { icon: Download, label: 'Templates', path: '/dashboard/faculty/templates' },
          { icon: User, label: 'Account Info', path: '/dashboard/faculty/profile' },
        ];
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'System Overview', path: '/dashboard/admin' },
          { icon: Users, label: 'User Management', path: '/dashboard/admin/users' },
          { icon: Wallet, label: 'Pending Payments', path: '/dashboard/admin/payments' },
          { icon: User, label: 'Profile', path: '/dashboard/admin/settings' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4 shadow-sm">
        <Link to={role === 'teacher' ? '/dashboard/faculty' : `/dashboard/${role}`} className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
            Smart<span className="text-emerald-500">Cash</span>
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 fixed inset-y-0 left-0 h-full flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-lg md:shadow-slate-200/20 dark:shadow-none`}>
        <div className="p-8 border-b border-slate-100 dark:border-slate-800/60">
          <Link to={role === 'teacher' ? '/dashboard/faculty' : `/dashboard/${role}`} className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-emerald-500 drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                Smart<span className="text-emerald-500">Cash</span>
              </span>
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Financial Literacy</span>
            </div>
          </Link>
          <div className="mt-6 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center border border-slate-100 dark:border-slate-700/50">
            {role} Portal
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
                }`}
            >
              <item.icon size={20} className={`transition-colors ${isActive(item.path) ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
              {item.label}
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm font-medium mb-4 px-2">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Appearance</span>
            <ThemeToggle className="scale-90" />
          </div>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 pt-20 md:p-8 lg:p-12 overflow-y-auto min-h-screen relative w-full overflow-x-hidden">
        {/* Background Decoration */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px]" />
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
