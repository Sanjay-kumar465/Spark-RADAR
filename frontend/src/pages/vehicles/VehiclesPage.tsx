import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Search,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  FileX2,
  Archive,
  RotateCcw,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { Vehicle } from '../../types';
import { AttentionBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AddVehicleModal } from './AddVehicleModal';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';
import { getVehicleImage } from '../../utils/vehicleImages';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status_filter') || '');
  const [sortBy, setSortBy] = useState('next_expiry');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.getVehicles({
        search,
        category: category || undefined,
        status_filter: statusFilter || undefined,
        sort_by: sortBy,
        include_archived: showArchived,
      });
      setVehicles(res);
    } catch (err: any) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [category, statusFilter, sortBy, showArchived]);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || loading) return;
      if (viewMode === 'cards') {
        gsap.fromTo(
          '.vehicle-fleet-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.4, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [loading, viewMode, vehicles.length] }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleUnarchive = async (e: React.MouseEvent, vehId: string) => {
    e.stopPropagation();
    try {
      await api.unarchiveVehicle(vehId);
      fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Failed to restore vehicle');
    }
  };

  const categories = [
    { code: '', label: 'All Fleet Categories' },
    { code: 'sedan_taxi', label: 'Taxis & Sedan Cabs' },
    { code: 'suv_commercial', label: 'Commercial SUVs & MUVs' },
    { code: 'tempo_traveller', label: 'Tempo Travellers & Maxi Cabs' },
    { code: 'bus', label: 'Buses & Luxury Coaches' },
    { code: 'mini_truck', label: 'Mini Trucks & LCVs' },
    { code: 'goods_truck', label: 'Heavy Lorries & Trucks' },
    { code: 'multi_axle_trailer', label: 'Multi-Axle Trailers' },
    { code: 'tanker', label: 'Liquid & Bulk Tankers' },
    { code: 'tipper', label: 'Tippers & Dumpers' },
    { code: 'container', label: 'Container Carriers' },
  ];

  const statuses = [
    { code: '', label: 'All Attention Levels' },
    { code: 'CRITICAL', label: 'Critical Overdue' },
    { code: 'ATTENTION', label: 'Attention Due Soon' },
    { code: 'INCOMPLETE', label: 'Incomplete Documents' },
    { code: 'COMPLIANT', label: 'Fully Compliant' },
  ];

  // Fleet overview statistics
  const totalCount = vehicles.length;
  const criticalCount = vehicles.filter((v) => v.attention_status === 'CRITICAL').length;
  const attentionCount = vehicles.filter((v) => v.attention_status === 'ATTENTION').length;
  const incompleteCount = vehicles.filter((v) => v.attention_status === 'INCOMPLETE').length;
  const compliantCount = vehicles.filter((v) => v.attention_status === 'COMPLIANT').length;

  return (
    <div ref={containerRef} className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-txt-primary tracking-tight">
            Vehicle Fleet Workspace
          </h1>
          <p className="text-xs sm:text-sm text-txt-secondary mt-1">
            Vehicle-centric fleet compliance: open any vehicle to inspect validities, permits, PUC, FASTag, and driver records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Fleet KPI Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === '' ? 'bg-white border-golden shadow-sm' : 'bg-white/80 border-stone hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-txt-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Fleet</span>
            <Truck className="w-4 h-4 text-golden-dark" />
          </div>
          <p className="text-2xl font-black text-txt-primary mt-1 font-mono">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('CRITICAL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'CRITICAL' ? 'bg-racing-light border-racing/30 shadow-sm' : 'bg-white/80 border-stone hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-racing-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue</span>
            <FileX2 className="w-4 h-4 text-racing" />
          </div>
          <p className="text-2xl font-black text-racing-dark mt-1 font-mono">{criticalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('ATTENTION')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ATTENTION' ? 'bg-golden-light border-golden/40 shadow-sm' : 'bg-white/80 border-stone hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-golden-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due Soon</span>
            <AlertTriangle className="w-4 h-4 text-golden-dark" />
          </div>
          <p className="text-2xl font-black text-golden-dark mt-1 font-mono">{attentionCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('INCOMPLETE')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'INCOMPLETE' ? 'bg-stone border-stone-dark shadow-sm' : 'bg-white/80 border-stone hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-txt-primary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Missing Docs</span>
            <FileText className="w-4 h-4 text-txt-secondary" />
          </div>
          <p className="text-2xl font-black text-txt-primary mt-1 font-mono">{incompleteCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('COMPLIANT')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'COMPLIANT' ? 'bg-sand-light border-sand/40 shadow-sm' : 'bg-white/80 border-stone hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-golden-dark">
            <span className="text-[11px] font-bold uppercase tracking-wider">Compliant</span>
            <ShieldCheck className="w-4 h-4 text-golden-dark" />
          </div>
          <p className="text-2xl font-black text-golden-dark mt-1 font-mono">{compliantCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-stone shadow-subtle flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-txt-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search registration, make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-ivory/40 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
          />
        </form>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden text-txt-primary"
          >
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden text-txt-primary"
          >
            {statuses.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden text-txt-primary"
          >
            <option value="next_expiry">Sort: Urgent Expiry First</option>
            <option value="registration">Sort: Registration #</option>
            <option value="created_at">Sort: Recently Added</option>
          </select>

          {/* Archive Toggle Button */}
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showArchived
                ? 'bg-golden-light border-golden/40 text-golden-dark'
                : 'bg-white border-stone text-txt-secondary hover:text-txt-primary'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Showing Archived' : 'Include Archived'}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-stone p-0.5 bg-ivory">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white shadow-subtle text-golden-dark' : 'text-txt-secondary'}`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-white shadow-subtle text-golden-dark' : 'text-txt-secondary'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-golden border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-stone shadow-subtle space-y-3">
          <Truck className="w-12 h-12 text-txt-muted mx-auto" />
          <h3 className="text-base font-bold text-txt-primary">No Vehicles Found</h3>
          <p className="text-xs text-txt-secondary max-w-md mx-auto">
            {search || category || statusFilter
              ? 'No vehicles match your active search or filter criteria. Clear filters to see your full fleet.'
              : 'Your workspace does not have any vehicles registered yet. Add your first vehicle to start tracking compliance.'}
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Vehicle
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const imgInfo = getVehicleImage(v.vehicle_category, v.photo_url, { preferCutout: true });
            return (
            <div
              key={v.id}
              onClick={() => navigate(`/vehicles/${v.id}`)}
              className={`vehicle-fleet-card p-5 rounded-2xl bg-white border shadow-card hover:shadow-elevated cursor-pointer transition-all space-y-4 group ${
                v.is_archived
                  ? 'border-stone/60 opacity-70 bg-ivory/30'
                  : 'border-stone hover:border-golden'
              }`}
            >
              {/* Vehicle Photograph Container (Real or Fleet Category Representative) */}
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/90 border border-graphite/40 flex items-center justify-center p-3 group-hover:border-golden/50 transition-colors">
                <img
                  src={imgInfo.src}
                  alt={`${v.registration_number} ${v.make} ${v.model}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 border border-golden/30 text-[10px] font-mono font-bold text-golden">
                  {v.registration_number}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-graphite/90 border border-sand/30 text-[9px] font-mono text-sand">
                  {imgInfo.isRealPhoto ? 'Verified Photo' : 'Fleet Category Asset'}
                </div>
              </div>

              {/* Header: Reg & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black tracking-wider text-txt-primary group-hover:text-golden-dark transition-colors">
                      {v.registration_number}
                    </span>
                    {v.is_archived && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-stone text-txt-secondary border border-stone-dark">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-txt-secondary font-medium">
                    {v.make} {v.model}
                  </p>
                </div>
                <AttentionBadge status={v.attention_status} size="sm" />
              </div>

              {/* Vehicle Category & Assigned Driver */}
              <div className="pt-2 border-t border-stone/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-txt-secondary">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Category</span>
                  <span className="font-medium text-txt-primary capitalize">
                    {v.vehicle_category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-txt-secondary">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Assigned Driver</span>
                  <span className="font-medium text-txt-primary truncate max-w-[150px]">
                    {v.assigned_driver_name || 'None assigned'}
                  </span>
                </div>

                {v.seating_capacity && (
                  <div className="flex items-center justify-between text-txt-secondary">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Capacity</span>
                    <span className="font-medium text-txt-primary font-mono">{v.seating_capacity} Seats</span>
                  </div>
                )}

                {v.gross_vehicle_weight_kg && (
                  <div className="flex items-center justify-between text-txt-secondary">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">GVW</span>
                    <span className="font-medium text-txt-primary font-mono">{(v.gross_vehicle_weight_kg / 1000).toFixed(1)} Tonnes</span>
                  </div>
                )}
              </div>

              {/* Next Upcoming Obligation Banner */}
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                  v.attention_status === 'CRITICAL'
                    ? 'bg-racing-light/60 border border-racing/30 text-racing-dark'
                    : v.attention_status === 'ATTENTION'
                    ? 'bg-golden-light/60 border border-golden/40 text-golden-dark'
                    : 'bg-ivory border border-stone text-txt-secondary'
                }`}
              >
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider">
                    Next Obligation
                  </p>
                  <p className="font-bold truncate max-w-[170px] mt-0.5">
                    {v.next_obligation ? v.next_obligation.category_name : 'No pending obligation'}
                  </p>
                </div>

                <div className="text-right">
                  {v.next_obligation ? (
                    <span className="font-bold text-xs">
                      {v.next_obligation.days_remaining < 0
                        ? `${Math.abs(v.next_obligation.days_remaining)}d overdue`
                        : `${v.next_obligation.days_remaining}d left`}
                    </span>
                  ) : (
                    <span className="font-medium text-xs">Up to date</span>
                  )}
                </div>
              </div>

              {/* Bottom Quick Stats or Unarchive Action */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-txt-muted border-t border-stone/40">
                {v.is_archived ? (
                  <button
                    onClick={(e) => handleUnarchive(e, v.id)}
                    className="flex items-center gap-1 font-bold text-golden-dark hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore to Active Fleet</span>
                  </button>
                ) : (
                  <>
                    <span>{v.valid_count} valid certs</span>
                    {v.expired_count > 0 && (
                      <span className="text-racing font-bold">{v.expired_count} expired</span>
                    )}
                    {v.missing_count > 0 && (
                      <span className="text-golden-dark font-medium">{v.missing_count} missing</span>
                    )}
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-ivory/60 border-b border-stone text-txt-secondary uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4">Attention Status</th>
                <th className="py-3 px-4">Next Obligation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-stone">
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                  className={`hover:bg-ivory/40 cursor-pointer transition-colors ${
                    v.is_archived ? 'opacity-70 bg-ivory/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-txt-primary">
                    {v.registration_number}
                    {v.is_archived && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone text-txt-secondary border border-stone-dark">
                        ARCHIVED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-txt-secondary">
                    {v.make} {v.model}
                  </td>
                  <td className="py-3 px-4 capitalize text-txt-secondary">
                    {v.vehicle_category.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-txt-secondary">
                    {v.assigned_driver_name || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <AttentionBadge status={v.attention_status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    {v.next_obligation ? (
                      <div>
                        <span className="font-semibold text-txt-primary">{v.next_obligation.category_name}</span>
                        <span className="block text-[11px] text-txt-muted">
                          {v.next_obligation.days_remaining < 0
                            ? `${Math.abs(v.next_obligation.days_remaining)}d overdue`
                            : `In ${v.next_obligation.days_remaining} days`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-txt-muted">Up to date</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {v.is_archived ? (
                      <button
                        onClick={(e) => handleUnarchive(e, v.id)}
                        className="text-golden-dark font-semibold hover:underline flex items-center gap-1 justify-end ml-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    ) : (
                      <span className="text-golden-dark font-semibold hover:underline">
                        Open Workspace →
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newV) => {
          setIsAddModalOpen(false);
          fetchVehicles();
          navigate(`/vehicles/${newV.id}`);
        }}
      />
    </div>
  );
};
