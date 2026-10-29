import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import type { RenewalTask } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';

export const RenewalsPage: React.FC = () => {
  const [tasks, setTasks] = useState<RenewalTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDesc, setNewDesc] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getRenewalTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion() || loading) return;
      gsap.fromTo(
        '.renewal-task-row',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out' }
      );
    },
    { scope: containerRef, dependencies: [loading, tasks.length] }
  );

  const handleCompleteTask = async (task: RenewalTask) => {
    const notes = prompt('Enter renewal completion notes / certificate reference:', 'Renewed and verified.');
    if (notes === null) return;
    try {
      await api.updateRenewalTask(task.id, {
        status: 'completed',
        completion_notes: notes,
      });
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRenewalTask({
        title: newTitle,
        due_date: newDueDate,
        priority: newPriority,
        description: newDesc,
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDueDate('');
      setNewDesc('');
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-txt-primary tracking-tight">
            Fleet Renewals & Obligations
          </h1>
          <p className="text-xs sm:text-sm text-txt-secondary mt-1">
            Aggregated fleet-wide renewal actions, statutory expiry deadlines, and staff accountability.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Create Renewal Task
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-stone shadow-subtle flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden text-txt-primary"
        >
          <option value="">All Statuses (Pending, In Progress, Completed)</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden text-txt-primary"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-stone shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-golden border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-txt-secondary space-y-2">
            <CheckCircle2 className="w-10 h-10 text-golden-dark mx-auto" />
            <p className="text-base font-bold text-txt-primary">No Outstanding Renewal Tasks</p>
            <p className="text-xs">All fleet documents are up to date and no open tasks match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-stone">
            {tasks.map((t) => (
              <div key={t.id} className="renewal-task-row p-4 sm:p-5 hover:bg-ivory/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    t.status === 'completed'
                      ? 'bg-sand-light text-golden-dark'
                      : t.priority === 'urgent' || t.is_overdue
                      ? 'bg-racing-light text-racing-dark'
                      : 'bg-golden-light text-golden-dark'
                  }`}>
                    {t.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : t.priority === 'urgent' || t.is_overdue ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <CalendarClock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-txt-primary">{t.title}</span>
                      {t.vehicle_registration && (
                        <Link
                          to={`/vehicles/${t.vehicle_id}`}
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-ivory border border-stone text-golden-dark hover:underline"
                        >
                          {t.vehicle_registration}
                        </Link>
                      )}
                    </div>

                    <p className="text-xs text-txt-secondary">{t.description || 'No additional notes'}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-txt-muted pt-0.5">
                      <span>Due: <strong className="text-txt-primary">{t.due_date}</strong></span>
                      {t.assigned_user_name && <span>Assigned to: {t.assigned_user_name}</span>}
                      {t.completion_notes && <span className="text-golden-dark font-medium">Notes: {t.completion_notes}</span>}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    t.status === 'completed'
                      ? 'bg-sand-light text-golden-dark border border-sand/40'
                      : t.is_overdue
                      ? 'bg-racing-light text-racing-dark border border-racing/30'
                      : 'bg-golden-light text-golden-dark border border-golden/40'
                  }`}>
                    {t.is_overdue ? 'OVERDUE' : t.status.replace('_', ' ')}
                  </span>

                  {t.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteTask(t)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Renewal Task"
        subtitle="Create an operational task with a deadline for your transport team"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Renew State Permit for MH 12 RN 4521"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
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
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Gather vehicle emission receipt, chassis pencil print, and submit Form 38"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
