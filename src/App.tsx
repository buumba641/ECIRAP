import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Shield, Building2, Users, FileBarChart, CreditCard, Megaphone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';

type Role = 'CEO' | 'Manager' | 'HR' | 'Analyst' | 'Marketing' | 'Cashier' | 'Sales' | 'Accountant';

type Branch = { branch_id: number; branch_name: string; location_details: string | null };

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Request failed');
  return r.json();
});

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('Sales');
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(null);

  const { data: branches } = useSWR<Branch[]>('/api/branches', fetcher);

  // Default to the first branch once branches load (for branch-scoped roles).
  useEffect(() => {
    if (branches && branches.length > 0 && currentBranchId === null) {
      setCurrentBranchId(branches[0].branch_id);
    }
  }, [branches, currentBranchId]);

  const roles: Role[] = ['CEO', 'Manager', 'HR', 'Analyst', 'Marketing', 'Cashier', 'Sales', 'Accountant'];
  const currentBranch = branches?.find((b) => b.branch_id === currentBranchId);

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
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {currentRole !== 'CEO' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 block">Current Branch</label>
                <select
                  value={currentBranchId ?? ''}
                  onChange={(e) => setCurrentBranchId(Number(e.target.value))}
                  className="w-full bg-slate-800 border-slate-700 text-sm rounded-md p-2 focus:ring-indigo-500 text-white"
                >
                  {(branches ?? []).map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
            {currentRole === 'CEO' ? 'Global Command Center' : `${currentBranch?.branch_name ?? '...'} — ${currentRole} Dashboard`}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE SYNC
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentRole}-${currentBranchId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <DashboardView role={currentRole} branchId={currentBranchId} branchName={currentBranch?.branch_name} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </button>
  );
}

function DashboardView({ role, branchId, branchName }: { role: Role; branchId: number | null; branchName?: string }) {
  if (role === 'CEO') return <CEODashboard />;
  if (role === 'Sales') return <SalesDashboard branchId={branchId} />;
  if (role === 'Accountant') return <AccountantDashboard />;
  if (role === 'Cashier') return <CashierDashboard branchId={branchId} />;

  return (
    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
      <h3 className="text-lg font-medium text-slate-900 mb-2">{role} Workspace</h3>
      <p className="text-slate-500">Access limited to {branchName ?? 'your branch'} operations.</p>
    </div>
  );
}

type Overview = {
  totalRevenue: number;
  activeLeasesM2Plus: number;
  branches: { branchId: number; branchName: string; revenue: number; deals: number }[];
};

function CEODashboard() {
  const { data, isLoading } = useSWR<Overview>('/api/analytics/overview', fetcher);
  const maxRevenue = useMemo(
    () => Math.max(1, ...(data?.branches ?? []).map((b) => b.revenue)),
    [data],
  );

  if (isLoading || !data) return <LoadingPanel label="Loading global analytics..." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Global Revenue" value={money(data.totalRevenue)} />
        <StatCard title="Active Leases (M2+)" value={String(data.activeLeasesM2Plus)} />
        <StatCard title="Branches Reporting" value={String(data.branches.length)} />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Branch Performance Comparison</h4>
        <div className="h-64 flex items-end gap-8 pt-8">
          {data.branches.map((b) => (
            <div key={b.branchId} className="flex-1 bg-indigo-100 rounded-t-lg relative group">
              <div className="absolute bottom-full mb-2 w-full text-center text-sm font-semibold opacity-0 group-hover:opacity-100">
                {money(b.revenue)}
              </div>
              <div
                className="bg-indigo-500 rounded-t-lg transition-all w-full"
                style={{ height: `${Math.max(4, (b.revenue / maxRevenue) * 100)}%` }}
              />
              <div className="mt-2 text-center text-xs font-medium text-slate-500 absolute -bottom-6 w-full truncate px-1">
                {b.branchName}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Pipeline = {
  leads: { lead_id: number; client_name: string; phone_number: string; ai_summary: string | null; converted: boolean }[];
  commissions: { instant: number; pendingLeaseClients: number; unlockedLeases: number };
};

function SalesDashboard({ branchId }: { branchId: number | null }) {
  const { data, isLoading } = useSWR<Pipeline>(branchId ? `/api/sales/pipeline?branchId=${branchId}` : null, fetcher);

  if (isLoading || !data) return <LoadingPanel label="Loading pipeline..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">My Pipeline</h3>
          <p className="text-slate-500 text-sm mt-1">Track your leads and pending commissions.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
          + New Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl shadow-sm">
          <div className="text-emerald-800 text-sm font-medium mb-1">Instant Commissions</div>
          <div className="text-2xl font-bold text-emerald-600">{money(data.commissions.instant)}</div>
          <div className="text-emerald-700/80 text-xs mt-2">From Full-Pay Clients</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl shadow-sm">
          <div className="text-amber-800 text-sm font-medium mb-1">Pending Leases</div>
          <div className="text-2xl font-bold text-amber-600">{data.commissions.pendingLeaseClients} Clients</div>
          <div className="text-amber-700/80 text-xs mt-2">Stuck on Month 1</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-sm">
          <div className="text-indigo-800 text-sm font-medium mb-1">Unlocked Leases</div>
          <div className="text-2xl font-bold text-indigo-600">{money(data.commissions.unlockedLeases)}</div>
          <div className="text-indigo-700/80 text-xs mt-2">Hit Month 2+ (Migrated)</div>
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
            {data.leads.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">No leads for this branch yet.</td>
              </tr>
            )}
            {data.leads.map((lead) => (
              <tr key={lead.lead_id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{lead.client_name}</div>
                  <div className="text-xs text-slate-500">{lead.phone_number}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      lead.converted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}
                  >
                    {lead.converted ? 'Converted' : 'Active Lead'}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{lead.ai_summary ?? '—'}</td>
                <td className="p-4 text-right">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    {lead.converted ? 'View' : 'Convert'}
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

type Disbursements = {
  disbursements: { disbursement_id: number; amount: number; status: string; payee: string | null; request_timestamp: string }[];
  audits: { audit_id: number; action_type: string; description: string | null; created_at: string }[];
};

function AccountantDashboard() {
  const { data, isLoading } = useSWR<Disbursements>('/api/finance/disbursements', fetcher);
  const [tab, setTab] = useState<'Requested' | 'Manager_Approved' | 'Audit'>('Requested');

  if (isLoading || !data) return <LoadingPanel label="Loading disbursements..." />;

  const filtered = data.disbursements.filter((d) => d.status === tab);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Disbursements</h3>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <TabButton active={tab === 'Requested'} onClick={() => setTab('Requested')}>Pending Requests</TabButton>
          <TabButton active={tab === 'Manager_Approved'} onClick={() => setTab('Manager_Approved')}>Manager Approved</TabButton>
          <TabButton active={tab === 'Audit'} onClick={() => setTab('Audit')}>Audit Log</TabButton>
        </div>

        <div className="p-6 space-y-4">
          {tab === 'Audit' ? (
            data.audits.map((a) => (
              <div key={a.audit_id} className="p-4 border rounded-lg bg-slate-50">
                <div className="font-medium text-slate-900">{a.action_type}</div>
                <p className="text-sm text-slate-500 mt-1">{a.description}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">Nothing in this queue.</p>
          ) : (
            filtered.map((d) => (
              <div key={d.disbursement_id} className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Payroll Release: {d.payee ?? 'Unknown'}</h4>
                  <p className="text-sm text-slate-500 mt-1">Includes base salary and unlocked M2+ commissions.</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{money(d.amount)}</div>
                  <button className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    {d.status === 'Requested' ? 'Request Verification' : 'Release Funds'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type Shift = { expectedCash: number; paidInvoices: number };

function CashierDashboard({ branchId }: { branchId: number | null }) {
  const { data, isLoading } = useSWR<Shift>(branchId ? `/api/cashier/shift?branchId=${branchId}` : null, fetcher);
  const [counted, setCounted] = useState('');

  if (isLoading || !data) return <LoadingPanel label="Loading shift data..." />;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Till & Shift Auditing</h3>

      <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Expected Cash (Shift)</div>
          <div className="text-5xl font-bold tracking-tight">{money(data.expectedCash)}</div>
          <p className="text-slate-400 text-sm mt-4">Based on {data.paidInvoices} approved invoices marked paid.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-semibold text-slate-900 mb-4">End of Shift Declaration</h4>
        <div className="flex gap-4">
          <input
            type="number"
            value={counted}
            onChange={(e) => setCounted(e.target.value)}
            placeholder="Enter physical cash counted..."
            className="flex-1 border border-slate-300 rounded-md p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
            Submit & Audit
          </button>
        </div>
        {counted !== '' && (
          <p className="mt-3 text-sm font-medium">
            Variance:{' '}
            <span className={Number(counted) - data.expectedCash === 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {money(Number(counted) - data.expectedCash)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${
        active ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
      <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h4 className="text-slate-500 text-sm font-medium mb-2">{title}</h4>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
    </div>
  );
}
