import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { api } from '../../api/endpoints';
import type { Vehicle, Driver } from '../../types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_category: 'tempo_traveller',
    vehicle_use: 'passenger_commercial',
    make: 'Force Motors',
    model: 'Traveller 3050',
    manufacturing_year: new Date().getFullYear(),
    fuel_type: 'Diesel',
    ownership_type: 'Owned',
    seating_capacity: '',
    gross_vehicle_weight_kg: '',
    permit_type: '',
    chassis_number: '',
    engine_number: '',
    assigned_driver_id: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      api.getDrivers().then(setDrivers).catch(console.error);
    }
  }, [isOpen]);

  const categories = [
    { code: 'sedan_taxi', name: 'Sedan / Hatchback Taxi (Dzire Tour, Aura, Tigor)' },
    { code: 'suv_commercial', name: 'Commercial SUV / MUV (Innova, Ertiga, Carens)' },
    { code: 'tempo_traveller', name: 'Tempo Traveller / Maxi Cab (9–26 Seater)' },
    { code: 'bus', name: 'Bus / Luxury Tourist Coach (32+ Seater)' },
    { code: 'mini_truck', name: 'Mini Truck / LCV (Tata Ace, Bolero Maxi, Dost)' },
    { code: 'goods_truck', name: 'Heavy Goods Lorry / Truck (6–10 Wheeler)' },
    { code: 'multi_axle_trailer', name: 'Multi-Axle Trailer (14–22 Wheeler)' },
    { code: 'tanker', name: 'Hazardous / Liquid Tanker' },
    { code: 'tipper', name: 'Tipper / Construction Dumper' },
    { code: 'container', name: 'Container Freight Carrier' },
  ];

  const makes = [
    'Force Motors',
    'Tata Motors',
    'Ashok Leyland',
    'Toyota',
    'Maruti Suzuki',
    'Mahindra',
    'BharatBenz',
    'Eicher',
  ];

  const handleCategoryChange = (cat: string) => {
    let defaultUse = 'passenger_commercial';
    let defaultMake = formData.make;
    let defaultModel = formData.model;

    if (['goods_truck', 'mini_truck', 'multi_axle_trailer', 'tanker', 'tipper', 'container'].includes(cat)) {
      defaultUse = 'goods_carrier';
      if (cat === 'goods_truck') {
        defaultMake = 'Tata Motors';
        defaultModel = 'Signa 4825.TK';
      } else if (cat === 'mini_truck') {
        defaultMake = 'Tata Motors';
        defaultModel = 'Ace Gold';
      }
    } else if (cat === 'sedan_taxi') {
      defaultMake = 'Maruti Suzuki';
      defaultModel = 'Dzire Tour';
    } else if (cat === 'suv_commercial') {
      defaultMake = 'Toyota';
      defaultModel = 'Innova Crysta';
    } else if (cat === 'bus') {
      defaultMake = 'Ashok Leyland';
      defaultModel = 'Oyster Tourist Bus';
    }

    setFormData({
      ...formData,
      vehicle_category: cat,
      vehicle_use: defaultUse,
      make: defaultMake,
      model: defaultModel,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const created = await api.createVehicle({
        ...formData,
        registration_number: formData.registration_number.toUpperCase().trim(),
        manufacturing_year: formData.manufacturing_year ? Number(formData.manufacturing_year) : undefined,
        seating_capacity: formData.seating_capacity ? Number(formData.seating_capacity) : undefined,
        gross_vehicle_weight_kg: formData.gross_vehicle_weight_kg ? Number(formData.gross_vehicle_weight_kg) : undefined,
        permit_type: formData.permit_type.trim() || undefined,
        assigned_driver_id: formData.assigned_driver_id || undefined,
        notes: formData.notes.trim() || undefined,
      });
      onSuccess(created);
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle. Please verify registration and fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Vehicle to Fleet"
      subtitle="Register a commercial passenger or goods vehicle to track compliance obligations"
      maxWidth="xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Registration Number */}
        <div>
          <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
            Registration Number *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. MH 12 RN 4521"
            value={formData.registration_number}
            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            className="w-full px-3.5 py-2 text-sm uppercase font-mono tracking-wider bg-ivory/50 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white transition-all"
          />
          <p className="text-[11px] text-txt-secondary mt-1">
            Indian RTO format. Normalized automatically for duplicate prevention within your workspace.
          </p>
        </div>

        {/* Category & Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Vehicle Category *
            </label>
            <select
              value={formData.vehicle_category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Operational Use
            </label>
            <select
              value={formData.vehicle_use}
              onChange={(e) => setFormData({ ...formData, vehicle_use: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="passenger_commercial">Passenger Commercial / Tourist</option>
              <option value="goods_carrier">Goods Carriage / Freight</option>
              <option value="staff_shuttle">Corporate / Staff Shuttle</option>
              <option value="rental">Self-Drive / Long Term Rental</option>
            </select>
          </div>
        </div>

        {/* Make & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Manufacturer Make *
            </label>
            <input
              type="text"
              required
              list="make-list"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
            <datalist id="make-list">
              {makes.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Model & Variant *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Traveller 3050 (17 Seater)"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>
        </div>

        {/* Commercial Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Seating Capacity
            </label>
            <input
              type="number"
              placeholder="e.g. 17"
              value={formData.seating_capacity}
              onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Gross Weight (GVW in kg)
            </label>
            <input
              type="number"
              placeholder="e.g. 47500"
              value={formData.gross_vehicle_weight_kg}
              onChange={(e) => setFormData({ ...formData, gross_vehicle_weight_kg: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Permit Classification
            </label>
            <input
              type="text"
              placeholder="e.g. AITP / National Permit"
              value={formData.permit_type}
              onChange={(e) => setFormData({ ...formData, permit_type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>
        </div>

        {/* Manufacturing Year, Fuel, Ownership */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Manufacturing Year
            </label>
            <input
              type="number"
              min={1990}
              max={new Date().getFullYear() + 1}
              value={formData.manufacturing_year}
              onChange={(e) => setFormData({ ...formData, manufacturing_year: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Fuel Type
            </label>
            <select
              value={formData.fuel_type}
              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Petrol">Petrol</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Ownership Type
            </label>
            <select
              value={formData.ownership_type}
              onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="Owned">Company Owned</option>
              <option value="Leased">Leased / Hypothecated</option>
              <option value="Attached">Attached Owner-Driver</option>
            </select>
          </div>
        </div>

        {/* Initial Assigned Driver */}
        <div>
          <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
            Initial Assigned Driver (Optional)
          </label>
          <select
            value={formData.assigned_driver_id}
            onChange={(e) => setFormData({ ...formData, assigned_driver_id: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
          >
            <option value="">No Driver Assigned Initially</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name} ({d.licence_number} • {d.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            Create Vehicle
          </Button>
        </div>
      </form>
    </Modal>
  );
};
