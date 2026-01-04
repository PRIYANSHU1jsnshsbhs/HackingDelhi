import React, { useState } from 'react';
import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ROLE_LABELS = {
  supervisor: 'Supervisor',
  district_admin: 'District Admin',
  state_analyst: 'State Analyst',
  policy_maker: 'Policy Maker'
};

function Layout() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/auth/role`,
        { role: newRole },
        { withCredentials: true }
      );
      setUser(response.data);
      toast.success(`Role switched to ${ROLE_LABELS[newRole]}`);
    } catch (error) {
      toast.error('Failed to switch role');
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['supervisor', 'district_admin', 'state_analyst', 'policy_maker'] },
    { path: '/review', icon: FileText, label: 'Review Queue', roles: ['supervisor', 'district_admin'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['state_analyst', 'district_admin', 'policy_maker'] },
    { path: '/policy', icon: Settings, label: 'Policy Simulation', roles: ['policy_maker'] },
    { path: '/audit', icon: Shield, label: 'Audit Logs', roles: ['state_analyst', 'district_admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white govt-header sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center space-x-4">
            <button
              data-testid="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-[hsl(var(--saffron))]" />
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">Governance Portal</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Census Intelligence System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={user?.role} onValueChange={handleRoleChange}>
              <SelectTrigger data-testid="role-switcher" className="w-[140px] sm:w-[180px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="district_admin">District Admin</SelectItem>
                <SelectItem value="state_analyst">State Analyst</SelectItem>
                <SelectItem value="policy_maker">Policy Maker</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center space-x-2">
              <UserCircle className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>

            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  data-testid={`nav-${item.path.slice(1)}`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[hsl(var(--saffron))] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;