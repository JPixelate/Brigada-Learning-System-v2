import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, UserPlus, Users } from 'lucide-react';
import { User, UserRole } from '../types';
import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100];

// --- Sub-components ---

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles: Record<string, string> = {
    [UserRole.ADMIN]: 'bg-brand-primary text-brand-primary-text font-bold',
    [UserRole.INSTRUCTOR]: 'bg-main-bg text-main-heading border border-main-border',
    [UserRole.STUDENT]: 'bg-main-bg text-slate-500 border border-main-border',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs uppercase font-semibold tracking-wide ${styles[role]}`}>
      {role}
    </span>
  );
};

const StatusDot = ({ status }: { status: 'Active' | 'Inactive' }) => (
  <span className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`} />
    <span className={`text-sm font-medium ${status === 'Active' ? 'text-main-heading' : 'text-slate-400'}`}>{status}</span>
  </span>
);

// --- Main Component ---

const UsersPage = () => {
  const { data, deleteEmployee } = useData();
  const { departments, positions } = data.commonData;
  const DEPARTMENTS = departments;
  const ALL_EMPLOYEES = data.employees;
  const ALL_EMPLOY_ACTIVE_COUNT = ALL_EMPLOYEES.filter(emp => emp.status === 'Active').length;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  // Debounced-style: reset to page 1 on filter/search change
  const resetPage = useCallback(() => setCurrentPage(1), []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    resetPage();
  }, [resetPage]);

  const handleDeptFilter = useCallback((value: string) => {
    setFilterDept(value);
    resetPage();
  }, [resetPage]);

  const handleStatusFilter = useCallback((value: string) => {
    setFilterStatus(value);
    resetPage();
  }, [resetPage]);

  const handleRoleFilter = useCallback((value: string) => {
    setFilterRole(value);
    resetPage();
  }, [resetPage]);

  const handleItemsPerPage = useCallback((value: number) => {
    setItemsPerPage(value);
    resetPage();
  }, [resetPage]);

  // Memoized filtering — only recalculates when dependencies change
  const filteredEmployees = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return ALL_EMPLOYEES.filter(emp => {
      if (filterDept !== 'All' && emp.department !== filterDept) return false;
      if (filterStatus !== 'All' && emp.status !== filterStatus) return false;
      if (filterRole !== 'All' && emp.role !== filterRole) return false;
      if (lowerSearch && !(
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.email.toLowerCase().includes(lowerSearch) ||
        emp.department.toLowerCase().includes(lowerSearch) ||
        emp.position.toLowerCase().includes(lowerSearch)
      )) return false;
      return true;
    });
  }, [searchTerm, filterDept, filterStatus, filterRole]);

  // Memoized pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredEmployees.length);

  // Page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const activeFilterCount = [filterDept, filterStatus, filterRole].filter(f => f !== 'All').length;

  return (
    <div className="relative space-y-4">
      <PageHeader 
        title="Employee Directory"
        description="Manage your workforce, assign roles, and track employee engagement across the platform."
        icon={Users}
        stats={[
          { label: 'Total Employees', value: ALL_EMPLOYEES.length.toLocaleString() },
          { label: 'Active', value: ALL_EMPLOY_ACTIVE_COUNT }
        ]}
        actions={[
          { 
            label: 'Add Employee', 
            icon: UserPlus, 
            variant: 'primary',
            onClick: () => console.log('Add Employee') 
          }
        ]}
      />

      {/* Table Card */}
      <div className="bg-main-surface rounded-xl border border-main-border shadow-sm overflow-hidden transition-colors">
        {/* Search & Filters Bar */}
        <div className="p-5 border-b border-main-border space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, department, or position..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-main-heading"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 border rounded-lg text-sm font-semibold transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-brand-primary text-brand-primary-text border-brand-primary'
                  : 'bg-main-surface border-main-border text-main-text hover:bg-main-bg'
              }`}
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-main-surface text-main-heading text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-main-border">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filter Row */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Department</label>
                <select
                  value={filterDept}
                  onChange={(e) => handleDeptFilter(e.target.value)}
                  className="px-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/5 text-main-heading"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/5 text-main-heading"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => handleRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/5 text-main-heading"
                >
                  <option value="All">All Roles</option>
                  <option value={UserRole.ADMIN}>{UserRole.ADMIN}</option>
                  <option value={UserRole.INSTRUCTOR}>{UserRole.INSTRUCTOR}</option>
                  <option value={UserRole.STUDENT}>{UserRole.STUDENT}</option>
                </select>
              </div>
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={() => { setFilterDept('All'); setFilterStatus('All'); setFilterRole('All'); resetPage(); }}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-main-heading transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-main-bg border-b border-main-border">
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main-border">
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-main-bg transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-main-border shadow-sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-main-heading truncate">{emp.name}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-main-bg text-slate-500 border border-main-border">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-main-text">{emp.position}</td>
                  <td className="px-6 py-4"><RoleBadge role={emp.role} /></td>
                  <td className="px-6 py-4"><StatusDot status={emp.status} /></td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{emp.joinedDate}</td>
                   <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-main-surface rounded-lg transition-colors border border-transparent hover:border-main-border"
                        title="Delete Employee"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-slate-400">No employees found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-5 border-t border-main-border bg-main-bg flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredEmployees.length > 0 ? startIndex : 0}–{endIndex} of {filteredEmployees.length.toLocaleString()} employees
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Per page</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 bg-main-surface border border-main-border rounded text-xs font-semibold text-main-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded bg-main-surface border border-main-border text-slate-600 disabled:opacity-40 hover:bg-main-bg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((page, idx) =>
              page === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm ${
                    currentPage === page
                      ? 'bg-brand-primary text-brand-primary-text'
                      : 'bg-main-surface border border-main-border text-main-text hover:bg-main-bg'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded bg-main-surface border border-main-border text-slate-600 disabled:opacity-40 hover:bg-main-bg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
