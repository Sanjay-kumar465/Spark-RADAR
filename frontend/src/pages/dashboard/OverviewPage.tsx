import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  AlertTriangle,
  CalendarClock,
  FileX2,
  FileWarning,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { DashboardSummary, Vehicle } from '../../types';
import { ComplianceRadar } from '../../components/dashboard/ComplianceRadar';
import { Button } from '../../components/common/Button';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, vehiclesRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getVehicles(),
      ]);
      setData(summaryRes);
      setVehicles(vehiclesRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useGSAP(
    () => {
      if (isReducedMotion() || loading) return;

      gsap.fromTo(
        '.dashboard-metric-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.45, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.dashboard-section',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: 'power3.out' }
      );
    },
    { scope: containerRef, dependencies: [loading] }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-golden border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-txt-secondary font-medium font-mono">
            Calibrating Live Compliance Radar & obligations...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-racing-light border border-racing/30 text-racing-dark text-sm max-w-2xl mx-auto my-12">
        <p className="font-bold text-base">Failed to load Dashboard data</p>
        <p className="text-xs mt-1 text-racing">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} className="mt-4">
          Retry Aggregation
        </Button>
      </div>
    );
  }

  // 4 Essential Metrics specified:
  // 1. Total active vehicles
  // 2. Overdue obligations
  // 3. Renewals due soon
  // 4. Missing or verification-required documents
  const missingDocsCount = data.attention_breakdown.INCOMPLETE || 0;

  return (
    <div ref={containerRef} className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-graphite border border-golden/30 text-golden text-[11px] font-semibold mb-1">
            <span>Fleet Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-txt-primary tracking-tight font-heading">
            Fleet Compliance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-txt-secondary mt-0.5">
            Real-time compliance radar, expiring certificates, and critical fleet renewal actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/renewals">
            <Button variant="outline" size="sm" icon={<CalendarClock className="w-4 h-4" />}>
              Renewals
            </Button>
          </Link>
          <Link to="/vehicles">
            <Button size="sm" icon={<Truck className="w-4 h-4" />}>
              Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Essential Metrics Specified by Architecture Prompt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Active Vehicles */}
        <div
          onClick={() => navigate('/vehicles')}
          className="dashboard-metric-card p-5 rounded-2xl bg-white border border-stone shadow-card hover:border-golden cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-txt-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-txt-secondary">
              Total Active Vehicles
            </span>
            <div className="p-2 rounded-xl bg-ivory group-hover:bg-golden/20 group-hover:text-golden-dark transition-colors">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-txt-primary font-mono">{data.total_vehicles}</p>
          <p className="text-[11px] text-txt-secondary flex items-center justify-between">
            <span>Registered commercial units</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Metric 2: Overdue Obligations */}
        <div
          onClick={() => navigate('/vehicles?status_filter=CRITICAL')}
          className="dashboard-metric-card p-5 rounded-2xl bg-white border border-stone shadow-card hover:border-racing cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-txt-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-racing font-semibold">
              Overdue Obligations
            </span>
            <div className="p-2 rounded-xl bg-racing-light text-racing">
              <FileX2 className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-3xl font-black font-mono ${
              data.overdue_documents > 0 ? 'text-racing' : 'text-charcoal'
            }`}
          >
            {data.overdue_documents}
          </p>
          <p className="text-[11px] text-txt-secondary flex items-center justify-between">
            <span>Expired certificates</span>
            <ArrowRight className="w-3.5 h-3.5 text-racing opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Metric 3: Renewals Due Soon */}
        <div
          onClick={() => navigate('/renewals?status=pending')}
          className="dashboard-metric-card p-5 rounded-2xl bg-white border border-stone shadow-card hover:border-golden cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-txt-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-golden-dark font-semibold">
              Renewals Due Soon
            </span>
            <div className="p-2 rounded-xl bg-golden-light text-golden-dark">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-golden-dark font-mono">{data.upcoming_renewals}</p>
          <p className="text-[11px] text-txt-secondary flex items-center justify-between">
            <span>Within 30-day threshold</span>
            <ArrowRight className="w-3.5 h-3.5 text-golden-dark opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Metric 4: Missing or Verification-Required Documents */}
        <div
          onClick={() => navigate('/vehicles?status_filter=INCOMPLETE')}
          className="dashboard-metric-card p-5 rounded-2xl bg-white border border-stone shadow-card hover:border-black/50 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-txt-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-txt-primary">
              Missing Documents
            </span>
            <div className="p-2 rounded-xl bg-stone text-txt-primary">
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-txt-primary font-mono">{missingDocsCount}</p>
          <p className="text-[11px] text-txt-secondary flex items-center justify-between">
            <span>Incomplete evidence</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>

      {/* Main Compliance Radar Section */}
      <div className="dashboard-section">
        <ComplianceRadar vehicles={vehicles} loading={loading} />
      </div>

      {/* Two Column Layout: Urgent Upcoming Renewals & Obligations by Status */}
      <div className="dashboard-section grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (lg:col-span-7): Compact Urgency-Ordered Upcoming Renewals */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-stone bg-ivory/40 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-txt-primary font-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-golden-dark" />
                <span>Urgent Upcoming Renewals</span>
              </h2>
              <p className="text-xs text-txt-secondary">
                Prioritized compliance deadlines requiring operator follow-up
              </p>
            </div>
            <Link
              to="/renewals"
              className="text-xs font-bold text-golden-dark hover:underline flex items-center gap-1 font-mono"
            >
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone max-h-[460px] overflow-y-auto">
            {data.urgent_actions.length === 0 ? (
              <div className="p-8 text-center text-txt-secondary space-y-2">
                <CheckCircle2 className="w-8 h-8 text-golden mx-auto" />
                <p className="text-sm font-bold text-txt-primary">No Urgent Expiries Pending</p>
                <p className="text-xs text-txt-secondary">
                  All vehicle certificates and tasks are within compliant parameters.
                </p>
              </div>
            ) : (
              data.urgent_actions.map((act) => (
                <div
                  key={act.id}
                  onClick={() =>
                    act.vehicle_id ? navigate(`/vehicles/${act.vehicle_id}`) : navigate('/renewals')
                  }
                  className="p-4 hover:bg-ivory/50 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        act.urgency === 'critical'
                          ? 'bg-racing-light text-racing'
                          : 'bg-golden-light text-golden-dark'
                      }`}
                    >
                      {act.urgency === 'critical' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CalendarClock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-txt-primary truncate group-hover:text-golden-dark transition-colors">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-txt-secondary truncate mt-0.5">
                        {act.vehicle_registration ? (
                          <span className="font-mono font-bold text-txt-primary mr-1">
                            {act.vehicle_registration}
                          </span>
                        ) : null}
                        {act.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-mono font-bold block ${
                        act.urgency === 'critical' ? 'text-racing' : 'text-golden-dark'
                      }`}
                    >
                      {act.days_remaining !== null && act.days_remaining !== undefined
                        ? act.days_remaining < 0
                          ? `${Math.abs(act.days_remaining)}d Overdue`
                          : act.days_remaining === 0
                          ? 'Due Today'
                          : `${act.days_remaining}d Left`
                        : 'Action Due'}
                    </span>
                    {act.due_date && (
                      <span className="text-[10px] text-txt-secondary font-mono">
                        {act.due_date}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Obligations by Status Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone shadow-card p-6 space-y-6">
          <div className="border-b border-stone pb-3">
            <h2 className="text-base font-bold text-txt-primary font-heading">
              Obligations by Compliance Status
            </h2>
            <p className="text-xs text-txt-secondary mt-0.5">
              Breakdown based on Tamil Nadu commercial compliance rules
            </p>
          </div>

          <div className="space-y-4">
            {/* Status 1: Fully Compliant */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-txt-primary flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sand" /> Fully Compliant
                </span>
                <span className="font-mono">
                  {data.attention_breakdown.COMPLIANT || 0} (
                  {data.total_vehicles > 0
                    ? Math.round(((data.attention_breakdown.COMPLIANT || 0) / data.total_vehicles) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-stone">
                <div
                  className="h-full bg-sand transition-all duration-500"
                  style={{
                    width: `${
                      data.total_vehicles > 0
                        ? ((data.attention_breakdown.COMPLIANT || 0) / data.total_vehicles) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Status 2: Attention / Due Soon */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-golden-dark flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-golden" /> Attention Due Soon
                </span>
                <span className="font-mono text-golden-dark">
                  {data.attention_breakdown.ATTENTION || 0} (
                  {data.total_vehicles > 0
                    ? Math.round(((data.attention_breakdown.ATTENTION || 0) / data.total_vehicles) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-stone">
                <div
                  className="h-full bg-golden transition-all duration-500"
                  style={{
                    width: `${
                      data.total_vehicles > 0
                        ? ((data.attention_breakdown.ATTENTION || 0) / data.total_vehicles) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Status 3: Incomplete Evidence */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-txt-secondary flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone" /> Missing / Incomplete
                </span>
                <span className="font-mono">
                  {data.attention_breakdown.INCOMPLETE || 0} (
                  {data.total_vehicles > 0
                    ? Math.round(((data.attention_breakdown.INCOMPLETE || 0) / data.total_vehicles) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-stone">
                <div
                  className="h-full bg-stone transition-all duration-500"
                  style={{
                    width: `${
                      data.total_vehicles > 0
                        ? ((data.attention_breakdown.INCOMPLETE || 0) / data.total_vehicles) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Status 4: Critical Overdue */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-racing flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-racing" /> Critical Overdue
                </span>
                <span className="font-mono text-racing">
                  {data.attention_breakdown.CRITICAL || 0} (
                  {data.total_vehicles > 0
                    ? Math.round(((data.attention_breakdown.CRITICAL || 0) / data.total_vehicles) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-stone">
                <div
                  className="h-full bg-racing transition-all duration-500"
                  style={{
                    width: `${
                      data.total_vehicles > 0
                        ? ((data.attention_breakdown.CRITICAL || 0) / data.total_vehicles) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone flex items-center justify-between">
            <span className="text-xs text-txt-secondary">Detailed fleet records:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/vehicles')}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Browse All Vehicles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
