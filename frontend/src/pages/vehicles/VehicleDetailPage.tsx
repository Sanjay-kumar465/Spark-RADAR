import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck2,
  CalendarClock,
  Users,
  Wrench,
  CreditCard,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileX2,
  FileText,
  Edit,
  Archive,
  RotateCcw,
  Check,
  UserCheck,
  Tag
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { Vehicle, Driver } from '../../types';
import { AttentionBadge, StatusPill } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { UploadDocumentModal } from '../documents/UploadDocumentModal';
import { EditVehicleModal } from './EditVehicleModal';
import { getVehicleImage } from '../../utils/vehicleImages';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'renewals' | 'drivers' | 'operations'>('overview');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('INSURANCE');
  const [uploadCategoryName, setUploadCategoryName] = useState<string>('');
  const [replacesDocId, setReplacesDocId] = useState<string | undefined>(undefined);

  // Driver Assignment modal
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigningDriver, setAssigningDriver] = useState(false);

  // FASTag Modal
  const [isFastagModalOpen, setIsFastagModalOpen] = useState(false);
  const [fastagId, setFastagId] = useState('');
  const [fastagBank, setFastagBank] = useState('ICICI Bank FASTag');
  const [fastagStatus, setFastagStatus] = useState('active');
  const [savingFastag, setSavingFastag] = useState(false);

  // Maintenance Log Modal
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState('Scheduled Periodic Service');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceKm, setServiceKm] = useState<number | ''>('');
  const [serviceCost, setServiceCost] = useState<number | ''>('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // Create Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDescription, setTaskDescription] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const fetchVehicle = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getVehicleDetail(id);
      setVehicle(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicle workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const loadDrivers = async () => {
    try {
      const drvs = await api.getDrivers();
      setAvailableDrivers(drvs);
    } catch (err) {
      console.error('Failed to load drivers', err);
    }
  };

  const handleOpenUpload = (catCode?: string, catName?: string, replaceId?: string) => {
    setUploadCategory(catCode || 'INSURANCE');
    setUploadCategoryName(catName || '');
    setReplacesDocId(replaceId);
    setIsUploadOpen(true);
  };

  const handleArchiveToggle = async () => {
    if (!vehicle) return;
    if (vehicle.is_archived) {
      try {
        await api.unarchiveVehicle(vehicle.id);
        fetchVehicle();
      } catch (err: any) {
        alert(err.message || 'Failed to restore vehicle');
      }
    } else {
      if (window.confirm(`Are you sure you want to archive vehicle ${vehicle.registration_number}? It will be hidden from the active fleet view.`)) {
        try {
          await api.archiveVehicle(vehicle.id);
          fetchVehicle();
        } catch (err: any) {
          alert(err.message || 'Failed to archive vehicle');
        }
      }
    }
  };

  const handleOpenAssignDriver = () => {
    loadDrivers();
    setSelectedDriverId(vehicle?.assigned_driver_id || '');
    setIsAssignDriverOpen(true);
  };

  const handleSaveDriverAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !selectedDriverId) return;

    setAssigningDriver(true);
    try {
      await api.assignDriverToVehicle(vehicle.id, selectedDriverId);
      setIsAssignDriverOpen(false);
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to assign driver');
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleUnassignDriver = async () => {
    if (!vehicle) return;
    if (!window.confirm(`Unassign driver ${vehicle.assigned_driver_name} from this vehicle?`)) return;

    try {
      await api.unassignDriverFromVehicle(vehicle.id);
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to unassign driver');
    }
  };

  const handleSaveFastag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !fastagId.trim()) return;

    setSavingFastag(true);
    try {
      await api.createFASTag({
        vehicle_id: vehicle.id,
        tag_id: fastagId.trim().toUpperCase(),
        issuer_bank: fastagBank,
        recorded_status: fastagStatus,
      });
      setIsFastagModalOpen(false);
      setFastagId('');
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to record FASTag');
    } finally {
      setSavingFastag(false);
    }
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !serviceDesc.trim()) return;

    setSavingMaintenance(true);
    try {
      await api.createMaintenance({
        vehicle_id: vehicle.id,
        service_date: serviceDate,
        service_type: serviceType,
        description: serviceDesc.trim(),
        odometer_km: serviceKm ? Number(serviceKm) : undefined,
        service_provider: serviceProvider.trim() || undefined,
        cost: serviceCost ? Number(serviceCost) : undefined,
      });
      setIsMaintenanceOpen(false);
      setServiceDesc('');
      setServiceKm('');
      setServiceCost('');
      setServiceProvider('');
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to save maintenance record');
    } finally {
      setSavingMaintenance(false);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !taskTitle.trim() || !taskDueDate) return;

    setSavingTask(true);
    try {
      await api.createRenewalTask({
        vehicle_id: vehicle.id,
        title: taskTitle.trim(),
        due_date: taskDueDate,
        priority: taskPriority,
        description: taskDescription.trim() || undefined,
      });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDueDate('');
      setTaskDescription('');
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to create renewal task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.updateRenewalTask(taskId, {
        status: 'completed',
        completion_notes: 'Completed from vehicle workspace',
      });
      fetchVehicle();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    }
  };

  if (loading) {


  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-golden border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vehicle) {


  return (
      <div className="p-6 rounded-2xl bg-racing-light border border-racing/30 text-racing-dark text-sm max-w-2xl mx-auto space-y-3">
        <p className="font-bold">Vehicle Not Found</p>
        <p className="text-xs">{error || 'This vehicle may have been removed or belongs to another workspace.'}</p>
        <Button size="sm" onClick={() => navigate('/vehicles')}>
          Back to Vehicles List
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Matrix', icon: FileCheck2 },
    { id: 'documents', label: `Documents (${vehicle.documents?.length || 0})`, icon: FileText },
    { id: 'renewals', label: `Renewals & Tasks (${vehicle.tasks?.length || 0})`, icon: CalendarClock },
    { id: 'drivers', label: 'Drivers & Licences', icon: Users },
    { id: 'operations', label: 'FASTag & Maintenance', icon: Wrench },
  ];

  const vehicleImg = getVehicleImage(vehicle.vehicle_category, { preferCutout: true });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/vehicles')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-txt-secondary hover:text-txt-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Workspace</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            icon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit Specs
          </Button>

          <Button
            size="sm"
            variant={vehicle.is_archived ? 'primary' : 'outline'}
            onClick={handleArchiveToggle}
            icon={vehicle.is_archived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          >
            {vehicle.is_archived ? 'Restore Vehicle' : 'Archive'}
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenUpload()}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Vehicle Hero Workspace Header */}
      <div className="p-6 rounded-2xl bg-white border border-stone shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Vehicle Photograph & Indian RTO Registration Plate Visual Design */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg bg-black/95 border border-graphite/60 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                <img
                  src={vehicleImg.src}
                  alt={vehicleImg.alt}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="inline-flex items-center rounded-lg border-2 border-charcoal/80 bg-ivory px-3 py-1 font-mono shadow-subtle">
                <span className="text-[10px] font-black tracking-widest text-txt-muted mr-2 border-r border-charcoal/30 pr-1.5">
                  IND
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-wider text-txt-primary">
                  {vehicle.registration_number}
                </span>
              </div>

              <AttentionBadge status={vehicle.attention_status} size="md" />

              {vehicle.is_archived && (
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-stone text-txt-secondary border border-stone-dark">
                  Archived Vehicle
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-txt-secondary font-medium">
              <span className="text-txt-primary font-bold text-sm">
                {vehicle.make} {vehicle.model}
              </span>
              <span>•</span>
              <span className="capitalize">
                {vehicle.vehicle_category.replace(/_/g, ' ')} ({vehicle.manufacturing_year || 'Year unrecorded'})
              </span>
              <span>•</span>
              <span>Fuel: {vehicle.fuel_type || 'Diesel'}</span>
              <span>•</span>
              <span>Ownership: {vehicle.ownership_type || 'Owned'}</span>
              {vehicle.seating_capacity && (
                <>
                  <span>•</span>
                  <span>{vehicle.seating_capacity} Seater</span>
                </>
              )}
              {vehicle.gross_vehicle_weight_kg && (
                <>
                  <span>•</span>
                  <span>GVW: {(vehicle.gross_vehicle_weight_kg / 1000).toFixed(1)}T</span>
                </>
              )}
            </div>
          </div>

          {/* Assigned Driver & FASTag Quick Summary Widget */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-xl bg-ivory border border-stone text-xs flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sand-light text-golden-dark">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                  Assigned Driver
                </p>
                <p className="font-bold text-txt-primary truncate max-w-[140px]">
                  {vehicle.assigned_driver_name || 'No Driver Assigned'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-ivory border border-stone text-xs flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sand-light text-golden-dark">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-txt-muted tracking-wider">
                  FASTag Status
                </p>
                <p className="font-bold text-txt-primary uppercase font-mono text-[11px]">
                  {vehicle.fastag_records?.[0]?.recorded_status || 'Unregistered'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-stone overflow-x-auto gap-2 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
        

  return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-golden text-graphite-dark text-white shadow-subtle'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-ivory'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Matrix */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Next Obligation Alert Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              vehicle.attention_status === 'CRITICAL'
                ? 'bg-racing-light/60 border-racing/30 text-racing-dark'
                : vehicle.attention_status === 'ATTENTION'
                ? 'bg-golden-light/60 border-golden/40 text-golden-dark'
                : 'bg-sand-light/60 border-sand/40 text-golden-dark'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl mt-0.5 ${
                  vehicle.attention_status === 'CRITICAL'
                    ? 'bg-racing text-white'
                    : vehicle.attention_status === 'ATTENTION'
                    ? 'bg-amber text-white'
                    : 'bg-golden text-graphite-dark text-white'
                }`}
              >
                {vehicle.attention_status === 'CRITICAL' ? (
                  <FileX2 className="w-5 h-5" />
                ) : vehicle.attention_status === 'ATTENTION' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  {vehicle.status_label}
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  {vehicle.next_obligation
                    ? `Next obligation: ${vehicle.next_obligation.category_name} due in ${vehicle.next_obligation.days_remaining} days (${vehicle.next_obligation.date}).`
                    : 'All statutory certificates and permits for this vehicle are currently valid.'}
                </p>
              </div>
            </div>

            {vehicle.next_obligation && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 bg-white"
                onClick={() =>
                  handleOpenUpload(
                    vehicle.next_obligation?.category_code,
                    vehicle.next_obligation?.category_name,
                    vehicle.next_obligation?.document_id
                  )
                }
              >
                Renew Obligation
              </Button>
            )}
          </div>

          {/* Technical Specifications Grid */}
          <div className="bg-white rounded-2xl border border-stone shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                Commercial Fleet Specifications
              </h3>
              <button
                onClick={() => setIsEditOpen(true)}
                className="text-xs font-bold text-golden-dark hover:underline"
              >
                Edit Specs →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Make / Brand</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block">{vehicle.make}</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Model & Variant</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block">{vehicle.model}</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Category</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block capitalize">
                  {vehicle.vehicle_category.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Commercial Use</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block capitalize">
                  {vehicle.vehicle_use.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Manufacturing Year</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block font-mono">
                  {vehicle.manufacturing_year || 'Unrecorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Fuel Type</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block">{vehicle.fuel_type || 'Diesel'}</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Seating / GVW</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block font-mono">
                  {vehicle.seating_capacity
                    ? `${vehicle.seating_capacity} Seats`
                    : vehicle.gross_vehicle_weight_kg
                    ? `${(vehicle.gross_vehicle_weight_kg / 1000).toFixed(1)}T GVW`
                    : 'Standard'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Permit Type</span>
                <span className="font-bold text-txt-primary text-sm mt-0.5 block truncate">
                  {vehicle.permit_type || 'State Contract Carriage'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Chassis / VIN</span>
                <span className="font-mono text-txt-primary font-bold text-xs mt-0.5 block truncate">
                  {vehicle.chassis_number || 'Not recorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Engine Number</span>
                <span className="font-mono text-txt-primary font-bold text-xs mt-0.5 block truncate">
                  {vehicle.engine_number || 'Not recorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory/60 border border-stone sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-txt-muted block">Operational Notes</span>
                <span className="text-txt-secondary text-xs mt-0.5 block">
                  {vehicle.notes || 'No special operational constraints noted for this vehicle.'}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Document Compliance Matrix */}
          <div className="bg-white rounded-2xl border border-stone shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                  Statutory Document Compliance Matrix
                </h3>
                <p className="text-xs text-txt-secondary">
                  Mandatory and applicable certificates for {vehicle.vehicle_category.replace(/_/g, ' ')} under Indian RTO regulations
                </p>
              </div>
              <span className="text-xs font-bold text-golden-dark bg-sand-light px-2.5 py-1 rounded-full border border-sand/40">
                {vehicle.valid_count} of {vehicle.document_summaries?.length || 0} In Compliance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehicle.document_summaries?.map((sum) => (
                <div
                  key={sum.category_code}
                  className={`p-4 rounded-xl border transition-all ${
                    sum.status === 'EXPIRED'
                      ? 'bg-racing-light/30 border-racing/30'
                      : sum.status === 'DUE_SOON'
                      ? 'bg-golden-light/30 border-golden/40'
                      : sum.status === 'MISSING'
                      ? 'bg-stone/40 border-stone'
                      : 'bg-ivory/50 border-stone'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-txt-primary">{sum.category_name}</p>
                      <p className="text-[10px] text-txt-secondary font-mono mt-0.5">
                        {sum.document?.document_number ||
                          (sum.status === 'MISSING' ? 'No certificate uploaded' : 'Number on file')}
                      </p>
                    </div>
                    <StatusPill status={sum.status} label={sum.status.replace(/_/g, ' ')} />
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone/60 flex items-center justify-between text-xs">
                    <span className="text-txt-secondary font-medium text-[11px]">
                      {sum.document?.expiry_date ? `Expires: ${sum.document.expiry_date}` : sum.label}
                    </span>

                    <button
                      onClick={() => handleOpenUpload(sum.category_code, sum.category_name, sum.document?.id)}
                      className="text-xs font-bold text-golden-dark hover:underline"
                    >
                      {sum.document ? 'Renew' : 'Upload'} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-stone shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-stone bg-ivory/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                Vehicle Document Registry
              </h3>
              <p className="text-xs text-txt-secondary">
                Valid certificates, expired policies, and historical renewal versions
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => handleOpenUpload()}
              icon={<Plus className="w-4 h-4" />}
            >
              Upload Document
            </Button>
          </div>

          {vehicle.documents?.length === 0 ? (
            <div className="p-12 text-center text-txt-secondary space-y-2">
              <FileText className="w-8 h-8 text-txt-muted mx-auto" />
              <p className="text-sm font-bold text-txt-primary">No Documents Recorded</p>
              <p className="text-xs">Upload RC, insurance, PUC, or fitness certificate to start tracking validity.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-stone">
              {vehicle.documents?.map((doc: any) => (
                <div key={doc.id} className="p-4 hover:bg-ivory/30 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sand-light text-golden-dark mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-txt-primary">
                          {doc.category_name || doc.category_code}
                        </span>
                        {doc.is_superseded && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone text-txt-secondary border border-stone">
                            HISTORICAL VERSION
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-txt-secondary font-mono mt-0.5">
                        #{doc.document_number || 'No number'} • Authority: {doc.issuing_authority || 'RTO / Issuer'}
                      </p>
                      <p className="text-[11px] text-txt-muted mt-0.5">
                        Validity: {doc.issue_date || 'N/A'} to {doc.expiry_date || 'Perpetual / Lifetime'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenUpload(doc.category_code, doc.category_name, doc.id)}
                      className="text-xs font-bold text-golden-dark hover:underline px-2 py-1"
                    >
                      Renew / Replace
                    </button>
                    {doc.file_path && (
                      <a
                        href={api.getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-ivory border border-stone hover:bg-stone text-txt-primary"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Renewals & Tasks */}
      {activeTab === 'renewals' && (
        <div className="bg-white rounded-2xl border border-stone shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                Renewal Tasks for {vehicle.registration_number}
              </h3>
              <p className="text-xs text-txt-secondary">
                Assigned compliance actions, due dates, and completion history
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsTaskModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Renewal Task
            </Button>
          </div>

          {vehicle.tasks?.length === 0 ? (
            <div className="p-8 text-center text-txt-secondary space-y-2">
              <CalendarClock className="w-8 h-8 text-txt-muted mx-auto" />
              <p className="text-sm font-semibold text-txt-primary">No Renewal Tasks Scheduled</p>
              <p className="text-xs">Schedule tasks to remind staff before document expiries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicle.tasks?.map((t: any) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-stone hover:border-golden/50 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-txt-primary">{t.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          t.priority === 'urgent'
                            ? 'bg-racing-light text-racing-dark border border-racing/30'
                            : t.priority === 'high'
                            ? 'bg-golden-light text-golden-dark border border-golden/40'
                            : 'bg-stone text-txt-secondary'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-xs text-txt-secondary mt-0.5">{t.description || 'No additional notes'}</p>
                    <p className="text-[11px] text-txt-muted mt-1">Due Date: {t.due_date}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.status === 'completed' ? (
                      <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-sand-light text-golden-dark border border-sand/40 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteTask(t.id)}
                        className="text-xs"
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Drivers */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-2xl border border-stone shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone">
            <div>
              <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                Driver Assignment & Licences
              </h3>
              <p className="text-xs text-txt-secondary">
                Manage commercial drivers assigned to this vehicle and monitor licence validity
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleOpenAssignDriver}
              icon={<UserCheck className="w-4 h-4" />}
            >
              {vehicle.assigned_driver_name ? 'Change Driver' : 'Assign Driver'}
            </Button>
          </div>

          {/* Current Active Driver Card */}
          {vehicle.assigned_driver_name ? (
            <div className="p-4 rounded-xl bg-sand-light/40 border border-sand/40 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-full bg-golden text-graphite-dark text-white font-bold text-sm">
                  {vehicle.assigned_driver_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-txt-primary">{vehicle.assigned_driver_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-golden text-graphite-dark text-white">
                      Active Primary Driver
                    </span>
                  </div>
                  <p className="text-xs text-txt-secondary mt-0.5">
                    Assigned to {vehicle.registration_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleUnassignDriver}>
                  Unassign
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-txt-secondary bg-ivory/50 rounded-xl border border-stone space-y-2">
              <Users className="w-8 h-8 text-txt-muted mx-auto" />
              <p className="text-sm font-bold text-txt-primary">No Driver Currently Assigned</p>
              <p className="text-xs">Assign a qualified commercial driver to monitor driving licence validity.</p>
              <Button size="sm" onClick={handleOpenAssignDriver} className="mt-2">
                Assign Driver Now
              </Button>
            </div>
          )}

          {/* Past Driver Assignments History */}
          <div className="pt-3 space-y-3">
            <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
              Driver Assignment Log
            </h4>
            {vehicle.driver_assignments && vehicle.driver_assignments.length > 0 ? (
              <div className="divide-y divide-surface-stone border border-stone rounded-xl">
                {vehicle.driver_assignments.map((a: any) => (
                  <div key={a.assignment_id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-txt-primary">{a.full_name}</span>
                      <p className="text-txt-secondary text-[11px] font-mono mt-0.5">
                        Licence: {a.licence_number} • Phone: {a.phone}
                      </p>
                    </div>
                    <div>
                      {a.is_primary && !a.unassigned_at ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sand-light text-golden-dark border border-sand/40">
                          Current Driver
                        </span>
                      ) : (
                        <span className="text-txt-muted text-[11px]">Past Assignment</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-txt-muted">No assignment logs recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Operations (FASTag & Maintenance) */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FASTag Card */}
          <div className="bg-white rounded-2xl border border-stone shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-golden-dark" />
                <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                  FASTag Identification
                </h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsFastagModalOpen(true)}>
                + Record FASTag
              </Button>
            </div>

            {vehicle.fastag_records?.length === 0 ? (
              <div className="p-8 text-center text-txt-secondary space-y-2">
                <CreditCard className="w-8 h-8 text-txt-muted mx-auto" />
                <p className="text-xs font-semibold text-txt-primary">No FASTag Registered</p>
                <p className="text-[11px]">Record your toll tag ID and issuer bank to keep records synchronized.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicle.fastag_records?.map((f: any) => (
                  <div key={f.id} className="p-4 rounded-xl bg-ivory border border-stone space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-txt-secondary">Issuer Bank</span>
                      <span className="text-xs font-bold text-txt-primary">{f.issuer_bank}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-txt-secondary">Tag ID / EPC</span>
                      <span className="text-xs font-mono font-bold text-txt-primary">{f.tag_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-txt-secondary">Recorded Status</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sand-light text-golden-dark uppercase">
                        {f.recorded_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Records */}
          <div className="bg-white rounded-2xl border border-stone shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-golden-dark" />
                <h3 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                  Maintenance History
                </h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsMaintenanceOpen(true)}>
                + Add Service Log
              </Button>
            </div>

            {vehicle.maintenance_records?.length === 0 ? (
              <div className="p-8 text-center text-txt-secondary space-y-2">
                <Wrench className="w-8 h-8 text-txt-muted mx-auto" />
                <p className="text-xs font-semibold text-txt-primary">No Service Logs</p>
                <p className="text-[11px]">Log periodic services, oil changes, and fitness repairs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicle.maintenance_records?.map((m: any) => (
                  <div key={m.id} className="p-3.5 rounded-xl border border-stone text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-txt-primary">{m.service_type}</span>
                      <span className="text-txt-muted font-mono">{m.service_date}</span>
                    </div>
                    <p className="text-txt-secondary">{m.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-txt-muted border-t border-stone/40">
                      <span>Odometer: {m.odometer_km ? `${m.odometer_km} km` : 'N/A'}</span>
                      {m.cost && <span className="font-bold text-golden-dark">₹{m.cost.toFixed(2)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {vehicle && (
        <EditVehicleModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          vehicle={vehicle}
          onSuccess={fetchVehicle}
        />
      )}

      {/* Upload/Renew Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultVehicleId={vehicle.id}
        defaultCategoryCode={uploadCategory}
        categoryName={uploadCategoryName}
        replacesDocumentId={replacesDocId}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchVehicle();
        }}
      />

      {/* Assign Driver Modal */}
      <Modal
        isOpen={isAssignDriverOpen}
        onClose={() => setIsAssignDriverOpen(false)}
        title="Assign Driver to Vehicle"
        subtitle={`Select a commercial driver for ${vehicle.registration_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveDriverAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Select Fleet Driver *
            </label>
            <select
              required
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="">-- Choose a driver --</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.licence_number} • {d.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-stone">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignDriverOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={assigningDriver}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record FASTag Modal */}
      <Modal
        isOpen={isFastagModalOpen}
        onClose={() => setIsFastagModalOpen(false)}
        title="Record FASTag Identification"
        subtitle={`Register toll RFID tag for ${vehicle.registration_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveFastag} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              FASTag Tag ID / EPC *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 34161FA820328900..."
              value={fastagId}
              onChange={(e) => setFastagId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono uppercase bg-ivory/50 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Issuer Bank *
            </label>
            <select
              value={fastagBank}
              onChange={(e) => setFastagBank(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="ICICI Bank FASTag">ICICI Bank FASTag</option>
              <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
              <option value="HDFC Bank FASTag">HDFC Bank FASTag</option>
              <option value="Axis Bank FASTag">Axis Bank FASTag</option>
              <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Tag Status
            </label>
            <select
              value={fastagStatus}
              onChange={(e) => setFastagStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="active">Active</option>
              <option value="low_balance">Low Balance</option>
              <option value="blacklisted">Blacklisted / Inactive</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-stone">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFastagModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={savingFastag}>
              Save FASTag Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        title="Add Vehicle Maintenance Log"
        subtitle={`Record service and repair history for ${vehicle.registration_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveMaintenance} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Service Type *
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="Scheduled Periodic Service">Scheduled Periodic Service</option>
              <option value="Oil & Filter Change">Oil & Filter Change</option>
              <option value="Brake & Clutch Overhaul">Brake & Clutch Overhaul</option>
              <option value="Tyre Rotation / Replacement">Tyre Rotation / Replacement</option>
              <option value="Fitness Pre-Inspection Repair">Fitness Pre-Inspection Repair</option>
              <option value="AC & Electrical Service">AC & Electrical Service</option>
              <option value="Emergency Breakdown Repair">Emergency Breakdown Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Service Description *
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Engine oil replaced, new air filter, brake liners adjusted..."
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Service Date *
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Odometer (KM)
              </label>
              <input
                type="number"
                placeholder="e.g. 45000"
                value={serviceKm}
                onChange={(e) => setServiceKm(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Cost (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 12500"
                value={serviceCost}
                onChange={(e) => setServiceCost(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Service Center / Workshop
              </label>
              <input
                type="text"
                placeholder="e.g. Authorised Service Center"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-stone">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsMaintenanceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={savingMaintenance}>
              Save Service Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Schedule Renewal Task"
        subtitle={`Create compliance action for ${vehicle.registration_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Submit Fitness Renewal to RTO"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Instructions / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Action instructions, agent contact, or fee details..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-stone">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={savingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
