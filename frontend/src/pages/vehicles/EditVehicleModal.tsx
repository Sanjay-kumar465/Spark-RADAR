import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { api } from '../../api/endpoints';
import type { Vehicle } from '../../types';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess: () => void;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    registration_number: vehicle.registration_number,
    vehicle_category: vehicle.vehicle_category,
    vehicle_use: vehicle.vehicle_use,
    make: vehicle.make,
    model: vehicle.model,
    manufacturing_year: vehicle.manufacturing_year || new Date().getFullYear(),
    fuel_type: vehicle.fuel_type || 'Diesel',
    ownership_type: vehicle.ownership_type || 'Owned',
    seating_capacity: vehicle.seating_capacity || '',
    gross_vehicle_weight_kg: vehicle.gross_vehicle_weight_kg || '',
    permit_type: vehicle.permit_type || '',
    chassis_number: vehicle.chassis_number || '',
    engine_number: vehicle.engine_number || '',
    notes: vehicle.notes || '',
  });

  const categories = [
    { code: 'sedan_taxi', name: 'Sedan / Hatchback Taxi (Tour Dzire, Aura, Tigor)' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.updateVehicle(vehicle.id, {
        ...formData,
        registration_number: formData.registration_number.toUpperCase().trim(),
        manufacturing_year: formData.manufacturing_year ? Number(formData.manufacturing_year) : undefined,
        seating_capacity: formData.seating_capacity ? Number(formData.seating_capacity) : undefined,
        gross_vehicle_weight_kg: formData.gross_vehicle_weight_kg ? Number(formData.gross_vehicle_weight_kg) : undefined,
        permit_type: formData.permit_type.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Vehicle Specifications"
      subtitle={`Update details for ${vehicle.registration_number}`}
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
            value={formData.registration_number}
            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            className="w-full px-3.5 py-2 text-sm uppercase font-mono tracking-wider bg-ivory/50 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
          />
        </div>

        {/* Category & Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Vehicle Category *
            </label>
            <select
              value={formData.vehicle_category}
              onChange={(e) => setFormData({ ...formData, vehicle_category: e.target.value as any })}
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
              <option value="staff_shuttle">Corporate / Staff Transit</option>
              <option value="rental">Self-Drive / Long Term Rental</option>
            </select>
          </div>
        </div>

        {/* Make & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Make / Manufacturer *
            </label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Model & Variant *
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>
        </div>

        {/* Technical Commercial Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Seating Capacity
            </label>
            <input
              type="number"
              placeholder="e.g. 17"
              value={formData.seating_capacity}
              onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value ? Number(e.target.value) : '' })}
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
              onChange={(e) => setFormData({ ...formData, gross_vehicle_weight_kg: e.target.value ? Number(e.target.value) : '' })}
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

        {/* Manufacturing Year & Fuel Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Manufacturing Year
            </label>
            <input
              type="number"
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
              <option value="Leased">Leased / Financed</option>
              <option value="Attached">Attached Owner-Driver</option>
            </select>
          </div>
        </div>

        {/* Chassis & Engine Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Chassis / VIN Number
            </label>
            <input
              type="text"
              placeholder="e.g. MAT4521..."
              value={formData.chassis_number}
              onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono uppercase bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Engine Number
            </label>
            <input
              type="text"
              placeholder="e.g. 4D34CR..."
              value={formData.engine_number}
              onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono uppercase bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>
        </div>

        {/* Operational Notes */}
        <div>
          <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
            Operational Notes
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special equipment, permit notes, contract details..."
            className="w-full px-3 py-2 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

