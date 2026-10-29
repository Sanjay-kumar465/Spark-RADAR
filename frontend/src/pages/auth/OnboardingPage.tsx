import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/branding/Logo';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import {
  Building2,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { workspace, refreshWorkspace } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Workspace update
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '');
  const [businessType, setBusinessType] = useState(workspace?.business_type || 'travel_agency');
  const [stateJurisdiction, setStateJurisdiction] = useState(workspace?.state_jurisdiction || 'MH');

  // Step 2: First vehicle
  const [regNumber, setRegNumber] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('tempo_traveller');
  const [make, setMake] = useState('Force Motors');
  const [model, setModel] = useState('Traveller 3050');
  const [fuelType, setFuelType] = useState('Diesel');

  const states = [
    { code: 'MH', name: 'Maharashtra' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'DL', name: 'Delhi NCR' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'HR', name: 'Haryana' },
    { code: 'WB', name: 'West Bengal' },
    { code: 'TS', name: 'Telangana' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'KL', name: 'Kerala' },
    { code: 'GA', name: 'Goa' },
  ];

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.updateWorkspace({
        name: workspaceName,
        business_type: businessType,
        state_jurisdiction: stateJurisdiction,
      });
      await refreshWorkspace();
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to update workspace details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regNumber.trim()) {
      // Allow skipping vehicle creation
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      await api.createVehicle({
        registration_number: regNumber.trim().toUpperCase(),
        vehicle_category: vehicleCategory,
        vehicle_use: businessType === 'goods_transport' ? 'goods_carrier' : 'passenger_commercial',
        make: make.trim(),
        model: model.trim(),
        manufacturing_year: new Date().getFullYear(),
        fuel_type: fuelType,
        ownership_type: 'Owned',
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to register initial vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="inline-block mb-3">
          <Logo size="lg" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-txt-primary">
          Fleet Workspace Setup
        </h1>
        <p className="mt-1 text-sm text-txt-secondary">
          Configure your operational profile and add your first vehicle to start tracking compliance
        </p>

        {/* Stepper Progress */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              step >= 1 ? 'bg-golden text-graphite-dark text-white' : 'bg-stone text-txt-secondary'
            }`}
          >
            <span>1</span>
            <span>Business Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-txt-muted" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              step >= 2 ? 'bg-golden text-graphite-dark text-white' : 'bg-stone text-txt-secondary'
            }`}
          >
            <span>2</span>
            <span>First Vehicle</span>
          </div>
          <ChevronRight className="w-4 h-4 text-txt-muted" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              step === 3 ? 'bg-golden text-graphite-dark text-white' : 'bg-stone text-txt-secondary'
            }`}
          >
            <span>3</span>
            <span>Ready</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-elevated rounded-2xl border border-stone sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone">
                <Building2 className="w-5 h-5 text-golden-dark" />
                <h2 className="text-base font-bold text-txt-primary">
                  Step 1: Fleet Operation Details
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                  Fleet / Agency Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahyadri Tourist Transports"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                    Fleet Category *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
                  >
                    <option value="travel_agency">Travel Agency / Tourist Transport</option>
                    <option value="goods_transport">Goods Transport / Lorry Fleet</option>
                    <option value="mixed_fleet">Mixed Commercial Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                    Primary State Jurisdiction *
                  </label>
                  <select
                    value={stateJurisdiction}
                    onChange={(e) => setStateJurisdiction(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
                  >
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={loading} className="gap-2">
                  Continue to Add Vehicle <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-golden-dark" />
                  <h2 className="text-base font-bold text-txt-primary">
                    Step 2: Add Your First Vehicle
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-txt-secondary hover:text-golden-dark underline"
                >
                  Skip for now
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                  Registration Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 QW 9988"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white uppercase font-mono"
                />
                <p className="mt-1 text-[11px] text-txt-muted">
                  Indian RTO format. Will be automatically normalized for fast lookup.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
                  >
                    <option value="tempo_traveller">Tempo Traveller</option>
                    <option value="sedan_taxi">Sedan / Hatchback Taxi</option>
                    <option value="suv_commercial">Commercial SUV / MUV</option>
                    <option value="bus_coach">Bus / Luxury Coach</option>
                    <option value="goods_truck">Goods Truck / Lorry</option>
                    <option value="mini_truck">Mini Truck (Ace / Bolero)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                    Make / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Force Motors, Tata, Maruti"
                    className="w-full px-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Traveller 3050"
                    className="w-full px-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" isLoading={loading} className="gap-2">
                  Save Vehicle & Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-sand-light rounded-full flex items-center justify-center mx-auto text-golden-dark">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-txt-primary">
                  Workspace Ready!
                </h2>
                <p className="mt-1.5 text-xs text-txt-secondary max-w-md mx-auto">
                  Your fleet compliance radar is configured. You can now manage certificates, permits, PUC, FASTag, driver licences, and upcoming renewals.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-ivory border border-stone text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-golden-dark font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Compliance Engine Active</span>
                </div>
                <p className="text-txt-secondary text-[11px]">
                  Spark Radar will continuously evaluate expiry dates against the 30-day, 15-day, 7-day, and 1-day alert thresholds.
                </p>
              </div>

              <div className="pt-4">
                <Button variant="primary" onClick={finishOnboarding} className="px-8">
                  Open Fleet Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
