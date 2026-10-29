import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { api } from '../../api/endpoints';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: any) => void;
  defaultVehicleId?: string;
  defaultDriverId?: string;
  defaultCategoryCode?: string;
  replacesDocumentId?: string;
  categoryName?: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultVehicleId,
  defaultDriverId,
  defaultCategoryCode,
  replacesDocumentId,
  categoryName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryCode, setCategoryCode] = useState(defaultCategoryCode || 'INSURANCE');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync category code when prop updates
  React.useEffect(() => {
    if (defaultCategoryCode) {
      setCategoryCode(defaultCategoryCode);
    }
  }, [defaultCategoryCode]);

  const categories = [
    { code: 'RC', name: 'Registration Certificate (RC)' },
    { code: 'INSURANCE', name: 'Commercial Motor Insurance Policy' },
    { code: 'PUC', name: 'Pollution Under Control (PUC)' },
    { code: 'FITNESS', name: 'Fitness Certificate (Form 38)' },
    { code: 'PERMIT', name: 'Contract Carriage / Tourist / Goods Permit' },
    { code: 'ROAD_TAX', name: 'Road Tax / MV Tax Token' },
    { code: 'SPEED_GOVERNOR', name: 'Speed Governor Calibration Certificate' },
    { code: 'GREEN_TAX', name: 'Green Tax / Environmental Cess' },
    { code: 'DRIVING_LICENCE', name: 'Commercial Driving Licence' },
    { code: 'BADGE', name: 'Public Service Vehicle (PSV) Badge' },
    { code: 'MEDICAL_CERT', name: 'Form 1-A Medical Fitness Certificate' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('category_code', categoryCode);
      if (defaultVehicleId) form.append('vehicle_id', defaultVehicleId);
      if (defaultDriverId) form.append('driver_id', defaultDriverId);
      if (documentNumber) form.append('document_number', documentNumber.trim());
      if (issuingAuthority) form.append('issuing_authority', issuingAuthority.trim());
      if (issueDate) form.append('issue_date', issueDate);
      if (expiryDate) form.append('expiry_date', expiryDate);
      if (notes) form.append('notes', notes);
      if (replacesDocumentId) form.append('replaces_document_id', replacesDocumentId);
      if (selectedFile) form.append('file', selectedFile);

      const res = await api.uploadDocument(form);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={replacesDocumentId ? `Renew / Replace ${categoryName || 'Document'}` : `Upload ${categoryName || 'Document'}`}
      subtitle="Save recorded validity dates and upload supporting evidence file (PDF, JPG, PNG)"
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
          {error}
        </div>
      )}

      {replacesDocumentId && (
        <div className="mb-4 p-3 rounded-lg bg-sand-light border border-sand/40 text-golden-dark text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-golden-dark shrink-0" />
          <span>This renewal will preserve the previous certificate in audit version history.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector if not fixed */}
        {!defaultCategoryCode && (
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Document Category *
            </label>
            <select
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Document Number & Issuing Authority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Document / Policy / Certificate #
            </label>
            <input
              type="text"
              placeholder="e.g. 3001/4582910/00/000"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Issuing Authority
            </label>
            <input
              type="text"
              placeholder="e.g. ICICI Lombard / RTO Pune"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>
        </div>

        {/* Issue Date & Expiry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
            <p className="text-[10px] text-txt-secondary mt-1">
              Leave blank if document has perpetual or lifetime validity.
            </p>
          </div>
        </div>

        {/* File Drag and Drop */}
        <div>
          <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
            Upload Document File (PDF, JPG, PNG)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone border-dashed rounded-lg bg-ivory/40 hover:bg-ivory/70 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="space-y-1 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-golden-dark font-semibold text-sm">
                  <FileText className="w-5 h-5 text-golden-dark" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-8 w-8 text-txt-secondary" />
                  <div className="flex text-xs text-txt-secondary justify-center">
                    <span className="font-semibold text-golden-dark">Click to browse</span>
                    <span className="pl-1">or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-txt-muted">PDF, PNG, JPG up to 15MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
            Operational Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Endorsement number, agent contact details, or policy terms"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Save Document Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
