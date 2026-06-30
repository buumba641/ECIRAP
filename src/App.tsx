import { useState, useEffect } from 'react';
import { Shield, Building2, Users, FileBarChart, CreditCard, Megaphone, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiProvider, useApi } from './context/ApiContext';

type Role = 'CEO' | 'Manager' | 'HR' | 'Analyst' | 'Marketing' | 'Cashier' | 'Sales' | 'Accountant';

function AppContent() {
  const [currentRole, setCurrentRole] = useState<Role>('Sales');
  const [currentBranch, setCurrentBranch] = useState('Lusaka Downtown');
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  
  const { currentUser, loading, error, fetchLeads, fetchDeals, fetchCurrentUser } = useApi();

  useEffect(() => {
    // Load initial user data
    const userId = parseInt(localStorage.getItem('userId') || '1');
    fetchCurrentUser(userId);
  }, []);

  useEffect(() => {
    // Load leads and deals when user is set or role changes
    if (currentUser) {
      Promise.all([fetchLeads(), fetchDeals()]).then(([l, d]) => {
        setLeads(l);
        setDeals(d);
      });
    }
  }, [currentUser, currentRole]);

  const branches = ['Lusaka Downtown', 'Kitwe Central', 'Livingstone Hub'];
  const roles: Role[] = ['CEO', 'Manager', 'HR', 'Analyst', 'Marketing', 'Cashier', 'Sales', 'Accountant'];

  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="bg-white p-8 rounded-lg border border-red-200 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="font-semibold text-red-900">Connection Error</h2>
          </div>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="font-bold text-lg tracking-tight">Starlink CRM</h1>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 block">Impersonate Role</label>
              <select 
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as Role)}
                className="w-full bg-slate-800 border-slate-700 text-sm rounded-md p-2 focus:ring-indigo-500 text-white"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            
            {currentRole !== 'CEO' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 block">Current Branch</label>
                <select 
                  value={currentBranch}
                  onChange={(e) => setCurrentBranch(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 text-sm rounded-md p-2 focus:ring-indigo-500 text-white"
                >
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Dynamically show links based on role */}
          {['CEO', 'Analyst', 'Manager'].includes(currentRole) && (
            <NavItem icon={<FileBarChart />} label="Global Analytics" active />
          )}
          {['Sales', 'Manager', 'CEO'].includes(currentRole) && (
            <NavItem icon={<Users />} label="Leads Pipeline" active={currentRole === 'Sales'} />
          )}
          {['Cashier', 'Manager'].includes(currentRole) && (
            <NavItem icon={<CreditCard />} label="Shift & Funds" active={currentRole === 'Cashier'} />
          )}
          {['HR', 'Manager'].includes(currentRole) && (
            <NavItem icon={<Building2 />} label="Personnel" active={currentRole === 'HR'} />
          )}
          {['Accountant', 'Manager', 'CEO'].includes(currentRole) && (
            <NavItem icon={<CheckCircle2 />} label="Disbursements" active={currentRole === 'Accountant'} />
          )}
          {['Marketing', 'Analyst'].includes(currentRole) && (
            <NavItem icon={<Megaphone />} label="Campaigns" active={currentRole === 'Marketing'} />
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">
            {currentRole === 'CEO' ? 'Global Command Center' : `${currentBranch} — ${currentRole} Dashboard`}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE SYNC
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRole}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <DashboardView role={currentRole} branch={currentBranch} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </button>
  );
}

function DashboardView({ role, branch }: { role: Role, branch: string }) {
  if (role === 'CEO') return <CEODashboard />;
  if (role === 'Sales') return <SalesDashboard />;
  if (role === 'Accountant') return <AccountantDashboard />;
  if (role === 'Cashier') return <CashierDashboard />;
  
  return (
    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
      <h3 className="text-lg font-medium text-slate-900 mb-2">{role} Workspace</h3>
      <p className="text-slate-500">Access limited to {branch} operations.</p>
    </div>
  );
}

function CEODashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Global Revenue" value="$2.4M" trend="+12.5%" />
        <StatCard title="Active Leases (M2+)" value="1,248" trend="+4.2%" />
        <StatCard title="Sales Velocity (Avg)" value="4.2 Days" trend="-0.8 Days" inverse />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h4 className="font-semibold text-slate-800 mb-4">Branch Performance Comparison</h4>
         <div className="h-64 flex items-end gap-8 pt-8">
            <div className="flex-1 bg-indigo-100 rounded-t-lg relative group">
              <div className="absolute bottom-full mb-2 w-full text-center text-sm font-semibold opacity-0 group-hover:opacity-100">$850k</div>
              <div className="h-[80%] bg-indigo-500 rounded-t-lg transition-all w-full"></div>
              <div className="mt-2 text-center text-xs font-medium text-slate-500 absolute -bottom-6 w-full">Lusaka</div>
            </div>
            <div className="flex-1 bg-indigo-100 rounded-t-lg relative group">
              <div className="absolute bottom-full mb-2 w-full text-center text-sm font-semibold opacity-0 group-hover:opacity-100">$620k</div>
              <div className="h-[60%] bg-indigo-500 rounded-t-lg transition-all w-full"></div>
              <div className="mt-2 text-center text-xs font-medium text-slate-500 absolute -bottom-6 w-full">Kitwe</div>
            </div>
            <div className="flex-1 bg-indigo-100 rounded-t-lg relative group">
              <div className="absolute bottom-full mb-2 w-full text-center text-sm font-semibold opacity-0 group-hover:opacity-100">$930k</div>
              <div className="h-[90%] bg-indigo-500 rounded-t-lg transition-all w-full"></div>
              <div className="mt-2 text-center text-xs font-medium text-slate-500 absolute -bottom-6 w-full">Livingstone</div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

function SalesDashboard() {
  const { createLead, convertLeadToDeal } = useApi();
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [formData, setFormData] = useState({ phone_number: '', client_name: '', email_address: '' });
  const [localLeads, setLocalLeads] = useState<any[]>([]);

  const { fetchLeads } = useApi();

  useEffect(() => {
    fetchLeads().then(l => setLocalLeads(l || []));
  }, []);

  const handleCreateLead = async () => {
    try {
      await createLead(formData);
      setFormData({ phone_number: '', client_name: '', email_address: '' });
      setShowNewLeadForm(false);
      const updated = await fetchLeads();
      setLocalLeads(updated || []);
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleConvertLead = async (leadId: number) => {
    try {
      await convertLeadToDeal(leadId);
      const updated = await fetchLeads();
      setLocalLeads(updated || []);
    } catch (error) {
      console.error('Failed to convert lead:', error);
    }
  };

  const activeLeads = localLeads?.filter((l: any) => !l.conversion_timestamp) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">My Pipeline</h3>
            <p className="text-slate-500 text-sm mt-1">Track your leads and pending commissions.</p>
         </div>
         <button 
            onClick={() => setShowNewLeadForm(!showNewLeadForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
         >
           + New Lead
         </button>
      </div>

      {showNewLeadForm && (
        <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm">
          <h4 className="font-semibold text-slate-900 mb-4">Add New Lead</h4>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-2 text-slate-900"
            />
            <input
              type="text"
              placeholder="Client Name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-2 text-slate-900"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={formData.email_address}
              onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-2 text-slate-900"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateLead}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
              >
                Create Lead
              </button>
              <button
                onClick={() => setShowNewLeadForm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-md font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl shadow-sm">
          <div className="text-emerald-800 text-sm font-medium mb-1">Total Leads</div>
          <div className="text-2xl font-bold text-emerald-600">{activeLeads.length}</div>
          <div className="text-emerald-700/80 text-xs mt-2">Active in pipeline</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl shadow-sm">
          <div className="text-amber-800 text-sm font-medium mb-1">Pending Conversion</div>
          <div className="text-2xl font-bold text-amber-600">{activeLeads.length}</div>
          <div className="text-amber-700/80 text-xs mt-2">Ready to convert</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-sm">
          <div className="text-indigo-800 text-sm font-medium mb-1">Converted</div>
          <div className="text-2xl font-bold text-indigo-600">{localLeads?.filter((l: any) => l.conversion_timestamp).length || 0}</div>
          <div className="text-indigo-700/80 text-xs mt-2">Deals created</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4">Client</th>
              <th className="p-4">Status</th>
              <th className="p-4">AI Summary</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeLeads?.slice(0, 5).map((lead: any) => (
              <tr key={lead.lead_id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{lead.client_name}</div>
                  <div className="text-xs text-slate-500">{lead.phone_number}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Active Lead
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                  {lead.ai_summary_raw || 'No summary yet'}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleConvertLead(lead.lead_id)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Convert
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Disbursements</h3>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium text-sm rounded-md border border-indigo-100">Pending Requests</button>
          <button className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-50 rounded-md">Manager Approved</button>
          <button className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-50 rounded-md">Audit Log</button>
        </div>
        <div className="p-6">
          <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
             <div>
                <h4 className="font-medium text-slate-900">Payroll Release: Sales Agents</h4>
                <p className="text-sm text-slate-500 mt-1">Includes base salary and unlocked M2+ commissions.</p>
             </div>
             <div className="text-right">
                <div className="text-lg font-bold text-slate-900">$12,450.00</div>
                <button className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Request Verification
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CashierDashboard() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Till & Shift Auditing</h3>
      
      <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
         <div className="relative z-10">
            <div className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Expected Cash (Shift)</div>
            <div className="text-5xl font-bold tracking-tight">$4,850.00</div>
            <p className="text-slate-400 text-sm mt-4">Based on 14 converted invoices marked paid.</p>
         </div>
         <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-semibold text-slate-900 mb-4">End of Shift Declaration</h4>
        <div className="flex gap-4">
          <input type="number" placeholder="Enter physical cash counted..." className="flex-1 border border-slate-300 rounded-md p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
            Submit & Audit
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, inverse = false }: { title: string, value: string, trend: string, inverse?: boolean }) {
  const isPositive = trend.startsWith('+');
  const color = isPositive ? (inverse ? 'text-rose-600' : 'text-emerald-600') : (inverse ? 'text-emerald-600' : 'text-rose-600');
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h4 className="text-slate-500 text-sm font-medium mb-2">{title}</h4>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className={`text-sm font-medium ${color}`}>{trend}</span>
      </div>
    </div>
  );
}

