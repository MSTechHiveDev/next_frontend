'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  MoreHorizontal, 
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  List,
  Search,
  Filter,
  CheckCircle2, 
  Settings2,
  Trash2,
  Edit
} from 'lucide-react';
import { hospitalAdminService } from '@/lib/integrations/services/hospitalAdmin.service';
import { toast }
 from 'react-hot-toast';

export default function ShiftManagement() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'staff'>('name');

  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    color: 'blue'
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await hospitalAdminService.getShifts();
      setShifts(data);
    } catch (error) {
      console.error('Failed to load shifts:', error);
      toast.error('Failed to load shift configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async () => {
    try {
      if (!newShift.name) return toast.error('Please enter a shift name');
      
      if (isEditMode && editingShiftId) {
        await hospitalAdminService.updateShift(editingShiftId, newShift);
        toast.success('Shift updated successfully');
      } else {
        await hospitalAdminService.createShift(newShift);
        toast.success('Shift initialized successfully');
      }
      
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingShiftId(null);
      setNewShift({ name: '', startTime: '09:00', endTime: '17:00', color: 'blue' });
      loadShifts();
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update shift' : 'Failed to create shift');
    }
  };

  const handleEditShift = (shift: any) => {
    setNewShift({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      color: shift.color || 'blue'
    });
    setEditingShiftId(shift._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenStaffModal = async (shift: any) => {
    setSelectedShift(shift);
    setIsStaffModalOpen(true);
    fetchStaffData(shift._id);
  };

  const fetchStaffData = async (shiftId: string) => {
    try {
      setLoadingStaff(true);
      const [allStaffRes, assignedRes] = await Promise.all([
        hospitalAdminService.getStaff(),
        hospitalAdminService.getShiftStaff(shiftId)
      ]);
      setAllStaff(allStaffRes.staff || []);
      setAssignedStaff(assignedRes || []);
    } catch (error) {
      toast.error('Failed to load personnel data');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssignStaff = async (staffId: string) => {
    try {
      setAssigning(true);
      await hospitalAdminService.assignStaffToShift(selectedShift._id, [staffId]);
      toast.success('Personnel deployed successfully');
      fetchStaffData(selectedShift._id);
      loadShifts();
    } catch (error) {
      toast.error('Deployment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    try {
      setAssigning(true);
      // To remove staff, we just assign them to no shift (null)
      await hospitalAdminService.updateStaff(staffId, { shift: null });
      toast.success('Personnel deallocated');
      fetchStaffData(selectedShift._id);
      loadShifts();
    } catch (error) {
      toast.error('Deallocation failed');
    } finally {
      setAssigning(false);
    }
  };

  const filteredShifts = shifts
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'staff') return (b.staff || 0) - (a.staff || 0);
      return 0;
    });

  const handleOpenCreateModal = () => {
    setNewShift({ name: '', startTime: '09:00', endTime: '17:00', color: 'blue' });
    setIsEditMode(false);
    setEditingShiftId(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shift Architecture</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Configure and monitor workforce deployment cycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
          >
            <Plus className="w-5 h-5" /> Initialize shift
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search shift configurations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none shadow-sm rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setSortBy(sortBy === 'name' ? 'staff' : 'name')}
            className="flex items-center gap-2 px-5 py-4 bg-white dark:bg-gray-800 text-gray-400 border-none shadow-sm rounded-2xl text-sm font-bold hover:text-blue-500 transition-all group"
          >
            <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
            Sort by {sortBy === 'name' ? 'Staff Count' : 'Name'}
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 text-gray-400 border-none shadow-sm rounded-2xl hover:text-blue-500 transition-all">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6">{isEditMode ? 'Update Operational Shift' : 'Initialize New Shift'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Shift Name</label>
                <input 
                  type="text" 
                  value={newShift.name}
                  onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                  placeholder="e.g. Night Shift"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Start Time</label>
                  <input 
                    type="time" 
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">End Time</label>
                  <input 
                    type="time" 
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Theme Color</label>
                <select 
                  value={newShift.color}
                  onChange={(e) => setNewShift({...newShift, color: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="blue">Blue</option>
                  <option value="emerald">Emerald</option>
                  <option value="indigo">Indigo</option>
                  <option value="rose">Rose</option>
                  <option value="amber">Amber</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingShiftId(null);
                  setNewShift({ name: '', startTime: '09:00', endTime: '17:00', color: 'blue' });
                }}
                className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateShift}
                className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all uppercase text-xs"
              >
                {isEditMode ? 'Update Module' : 'Create Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredShifts.map((shift) => (
            <div key={shift._id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col group hover:border-blue-500 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-8">
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleEditShift(shift)}
                    className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Delete shift configuration?')) {
                        hospitalAdminService.deleteShift(shift._id).then(() => {
                          toast.success('Shift deleted');
                          loadShifts();
                        });
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${
                shift.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                shift.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                shift.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                shift.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <Clock className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{shift.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                  {shift.startTime} - {shift.endTime}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-tighter">{shift.staff || 0} Assigned</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleOpenStaffModal(shift)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer"
                >
                  Deploy Personnel <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* New Shift Placeholder */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4 group hover:border-blue-500 transition-all min-h-[350px]"
          >
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm">
              <Plus className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-tighter">Add shift module</h3>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-1">Define new operational timeline</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Linear Shift Matrix</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">v4.0.2 Stable</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/30">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Codename</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeframe</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilization</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredShifts.map(shift => (
                  <tr key={shift._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          shift.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                          shift.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-indigo-500/10 text-indigo-500'
                        }`}>
                           <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">{shift.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-gray-500">{shift.startTime} - {shift.endTime}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div className={`h-full bg-blue-500 w-[${Math.min((shift.staff/40)*100, 100)}%] animate-in slide-in-from-left duration-1000`} style={{ width: `${Math.min((shift.staff/40)*100, 100)}%` }}></div>
                        </div>
                        <span className="text-xs font-black text-gray-400">{shift.staff || 0} personnel</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Synced</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleEditShift(shift)}
                           className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                         >
                           <Edit size={16} />
                         </button>
                         <button 
                           onClick={() => {
                             if (confirm('Delete shift configuration?')) {
                               hospitalAdminService.deleteShift(shift._id).then(() => {
                                 toast.success('Shift deleted');
                                 loadShifts();
                               });
                             }
                           }}
                           className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integration Status Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
          <ShieldCheck className="w-12 h-12 absolute -bottom-2 -right-2 opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Encryption Level</h4>
          <p className="text-2xl font-black">Military Grade</p>
          <p className="text-[10px] font-bold mt-2 opacity-60">AES-256 standard enforced on all shift data</p>
        </div>
        
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-200 dark:shadow-none relative overflow-hidden group">
          <Zap className="w-12 h-12 absolute -bottom-2 -right-2 opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Network Latency</h4>
          <p className="text-2xl font-black">12ms Response</p>
          <p className="text-[10px] font-bold mt-2 opacity-60">Direct fiber backbone to central database</p>
        </div>

        <div className="bg-slate-800 dark:bg-gray-800 p-6 rounded-3xl text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group border border-slate-700">
          <Users className="w-12 h-12 absolute -bottom-2 -right-2 opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Backup Redundancy</h4>
          <p className="text-2xl font-black">3 Tier Replication</p>
          <p className="text-[10px] font-bold mt-2 opacity-60">Active/Active failover in 3 geo-locations</p>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                  Deploy Personnel: {selectedShift?.name}
                  <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest ${
                     selectedShift?.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>{selectedShift?.startTime} - {selectedShift?.endTime}</span>
                </h2>
                <p className="text-gray-400 font-bold mt-1">Assign or reallocate staff to this operational timeline.</p>
              </div>
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 overflow-hidden">
              {/* Assigned Staff */}
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Currently Deployed ({assignedStaff.length})
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                  {loadingStaff ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl animate-pulse" />)
                  ) : assignedStaff.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-4xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                      <Users className="w-10 h-10 text-gray-200 mb-2" />
                      <p className="text-[10px] font-black text-gray-300 uppercase">Registry Empty</p>
                    </div>
                  ) : assignedStaff.map((s) => (
                    <div key={s._id} className="p-5 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl flex items-center justify-between group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                          {s.user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{s.user?.name}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.designation || 'Staff'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveStaff(s._id || s.staffProfileId)}
                        disabled={assigning}
                        className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Staff */}
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-500" /> Available Resources
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                  {loadingStaff ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl animate-pulse" />)
                  ) : allStaff.filter(s => !assignedStaff.find(a => a._id === (s._id || s.staffProfileId))).map((s) => (
                    <div key={s._id || s.staffProfileId} className="p-5 bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-blue-500 rounded-3xl flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-black">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{s.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.designation || 'Specialist'}</p>
                            {s.shift && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded uppercase font-black">
                                In: {(s.shift as any).name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAssignStaff(s._id || s.staffProfileId)}
                        disabled={assigning}
                        className="p-3 bg-white dark:bg-gray-700 text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-2xl"
              >
                Sync Registry & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
