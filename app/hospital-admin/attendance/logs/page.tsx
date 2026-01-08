'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Trash
} from 'lucide-react';
import { hospitalAdminService } from '@/lib/integrations/services/hospitalAdmin.service';
import { toast } from 'react-hot-toast';
import { AttendanceRecord } from '@/lib/integrations/types';

export default function AttendanceLogs() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    staffId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [filters]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await hospitalAdminService.getAttendance(filters);
      setAttendance(res.attendance || []);
    } catch (error) {
      console.error('Failed to load attendance logs:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'late': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'absent': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'half-day': return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'on-leave': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const filteredAttendance = attendance.filter(item => 
    item.staff?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.staff?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Personnel Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Detailed attendance registry and status verification.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none">
            <Calendar className="w-4 h-4" /> Schedule Outage
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or employee ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none min-w-[150px]">
            <input 
              type="date" 
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="flex-1 lg:flex-none min-w-[150px] px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on-leave">On Leave</option>
          </select>

          <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-500 rounded-2xl hover:text-blue-500 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
            <Filter className="w-5 h-5" />
          </button>
          
          <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-500 rounded-2xl hover:text-emerald-500 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Personnel Identifier</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Temporal Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Registry (In/Out)</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Operational Data</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8">
                      <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {record.staff?.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-base font-black text-gray-900 dark:text-white leading-none">{record.staff?.user?.name}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase mt-1.5 tracking-tighter">
                            {record.staff?.employeeId || 'EMP-001'} • {record.staff?.designation || 'Staff'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(record.status)}`}>
                        {record.status === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         record.status === 'late' ? <Clock className="w-3.5 h-3.5" /> :
                         <XCircle className="w-3.5 h-3.5" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Ingress</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Egress</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                           {record.workHours ? `${record.workHours} hrs` : '--:--'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                          {record.location?.name || 'Main Gate'} Registry
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1">
                        <button className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 rounded-xl transition-all" title="View Details">
                           <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 rounded-xl transition-all" title="Override Status">
                           <Edit2 className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 rounded-xl transition-all" title="Invalidate Entry">
                           <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white italic">Zero matches found in data cycle</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Adjust your topological filters or search query parameters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/20">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white">{filteredAttendance.length}</span> registry entries
          </p>
          <div className="flex items-center gap-2">
             <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-blue-500 disabled:opacity-50" disabled>
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-200 dark:shadow-none">
               1
             </button>
             <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-600 text-xs font-black hover:bg-gray-50">
               2
             </button>
             <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-blue-500">
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
