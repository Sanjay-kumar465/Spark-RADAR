import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Truck,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { Driver } from '../../types';
import { StatusPill } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';

export const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceCategory, setLicenceCategory] = useState('LMV-TR');
  const [expiryDate, setExpiryDate] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.getDrivers({ search });
      setDrivers(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers();
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || loading) return;
      gsap.fromTo(
        '.driver-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out' }
      );
    },
    { scope: containerRef, dependencies: [loading, drivers.length] }
  );

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDriver({
        full_name: fullName,
        phone,
        licence_number: licenceNumber.toUpperCase().trim(),
        licence_category: licenceCategory,
        licence_expiry_date: expiryDate || undefined,
        badge_number: badgeNumber || undefined,
      });
      setIsAddModalOpen(false);
      setFullName('');
      setPhone('');
      setLicenceNumber('');
      setExpiryDate('');
      setBadgeNumber('');
      fetchDrivers();
    } catch (err: any) {
      alert(err.message || 'Failed to add driver');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-txt-primary tracking-tight">
            Driver & Operator Directory
          </h1>
          <p className="text-xs sm:text-sm text-txt-secondary mt-1">
            Track commercial driving licences, transport badges, and vehicle pilot assignments independently.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Driver Profile
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-stone shadow-subtle flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-txt-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search driver name, licence #, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-ivory/40 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
          />
        </form>

        <span className="text-xs font-semibold text-txt-secondary">
          {drivers.length} Driver{drivers.length !== 1 ? 's' : ''} tracked
        </span>
      </div>

      {/* Driver Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-golden border-t-transparent rounded-full animate-spin" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-stone space-y-2">
          <Users className="w-10 h-10 text-txt-muted mx-auto" />
          <p className="text-base font-bold text-txt-primary">No Drivers Registered</p>
          <p className="text-xs text-txt-secondary">
            Register your drivers to track licence expiration and vehicle assignments.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm">
            Add First Driver
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div
              key={d.id}
              className="driver-card p-5 rounded-2xl bg-white border border-stone shadow-card space-y-4 hover:border-golden/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-golden text-graphite-dark text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {d.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-txt-primary">{d.full_name}</h3>
                    <p className="text-xs text-txt-secondary flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-txt-muted" /> {d.phone}
                    </p>
                  </div>
                </div>

                <StatusPill status={d.licence_status} label={d.licence_status_label} />
              </div>

              {/* Licence Info */}
              <div className="p-3 rounded-xl bg-ivory border border-stone text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-txt-secondary font-sans">Licence #</span>
                  <span className="font-bold text-txt-primary">{d.licence_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary font-sans">Category</span>
                  <span className="font-bold text-golden-dark">{d.licence_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary font-sans">Expiry</span>
                  <span className="font-bold text-txt-primary">{d.licence_expiry_date || 'Unrecorded'}</span>
                </div>
                {d.badge_number && (
                  <div className="flex justify-between">
                    <span className="text-txt-secondary font-sans">PSV Badge</span>
                    <span className="font-bold text-txt-primary">{d.badge_number}</span>
                  </div>
                )}
              </div>

              {/* Assigned Vehicle */}
              <div className="flex items-center justify-between text-xs text-txt-secondary pt-1 border-t border-stone">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-txt-muted" /> Assigned Vehicle:
                </span>
                <span className="font-bold font-mono text-txt-primary">
                  {d.assigned_vehicle_reg || 'None'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Commercial Driver Profile"
        subtitle="Record driver details, transport licence number, and validity dates"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDriver} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Santosh Shinde"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98220 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Licence Number *
              </label>
              <input
                type="text"
                required
                placeholder="MH12 20120034891"
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Licence Category
              </label>
              <select
                value={licenceCategory}
                onChange={(e) => setLicenceCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              >
                <option value="LMV-TR">LMV-TR (Commercial Cab / Taxi)</option>
                <option value="TRANS">TRANS / Heavy Goods Lorry</option>
                <option value="HMV">HMV / Heavy Passenger Bus</option>
                <option value="PSV">PSV Badge Holder</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Licence Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                PSV Badge # (Optional)
              </label>
              <input
                type="text"
                placeholder="PSV-MH12-8821"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Driver
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
