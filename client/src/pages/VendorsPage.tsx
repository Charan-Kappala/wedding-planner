import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useWeddingStore } from '../store/weddingStore';
import type { Vendor, VendorStatus, VendorCategory } from '@shared/types';
import { VENDOR_STATUS, VENDOR_CATEGORY } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Badge } from '../components/ui/Badge';
import { apiUploadVendorFile } from '../api/wedding';
import { Plus, Edit2, Trash2, Store, Phone, DollarSign, UploadCloud, FileText, Download } from 'lucide-react';

const STATUS_COLORS: Record<VendorStatus, string> = {
  INQUIRY: 'bg-gray-100 text-gray-800',
  BOOKED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function VendorsPage() {
  const { vendors, fetchVendors, createVendor, updateVendor, deleteVendor } = useWeddingStore();

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const [filterStatus, setFilterStatus] = useState<VendorStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<VendorCategory | 'ALL'>('ALL');

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchStatus = filterStatus === 'ALL' || v.status === filterStatus;
      const matchCategory = filterCategory === 'ALL' || v.category === filterCategory;
      return matchStatus && matchCategory;
    });
  }, [vendors, filterStatus, filterCategory]);

  const openNewModal = () => {
    setEditingVendor(null);
    setVendorForm({ status: 'INQUIRY', category: 'VENUE' });
    setIsVendorModalOpen(true);
  };

  const openEditModal = (v: Vendor) => {
    setEditingVendor(v);
    setVendorForm(v);
    setIsVendorModalOpen(true);
  };

  const openDeleteModal = (v: Vendor) => {
    setVendorToDelete(v);
    setIsDeleteModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, vendorForm as Partial<Vendor>);
        toast.success('Vendor updated');
      } else {
        await createVendor(vendorForm as Partial<Vendor>);
        toast.success('Vendor added');
      }
      setIsVendorModalOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to save vendor');
    }
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await deleteVendor(vendorToDelete.id);
      toast.success('Vendor deleted');
      setIsDeleteModalOpen(false);
      setVendorToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to delete vendor');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, vendorId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFor(vendorId);
    try {
      await apiUploadVendorFile(vendorId, file);
      toast.success('File uploaded');
      await fetchVendors(); // Refresh files
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploadingFor(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Vendors</h1>
        <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>
          Add Vendor
        </Button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-blush-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex flex-wrap gap-4 w-full">
            <select
              className="input bg-white w-full sm:w-auto"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as VendorCategory | 'ALL')}
            >
              <option value="ALL">All Categories</option>
              {Object.values(VENDOR_CATEGORY).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="input bg-white w-full sm:w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as VendorStatus | 'ALL')}
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(VENDOR_STATUS).map(([key, val]) => (
                <option key={key} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredVendors.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-blush-50 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-blush-400" />
          </div>
          <h3 className="text-lg font-medium text-charcoal">No vendors found</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Try adjusting your filters or add a new vendor.</p>
          <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />} variant="secondary">
            Add your first vendor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((v) => (
            <div key={v.id} className="card group relative overflow-hidden flex flex-col h-full hover:shadow-warm-lg transition-shadow">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(v)}
                  className="p-1.5 text-gray-400 hover:text-charcoal bg-white rounded-md shadow-sm border border-gray-100"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => openDeleteModal(v)}
                  className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-2 items-center mb-2">
                  <Badge variant="gray" className="text-xs">{v.category}</Badge>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[v.status]}`}>
                    {v.status}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-charcoal pr-16">{v.name}</h3>
              </div>

              <div className="space-y-3 flex-grow">
                {v.contact && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                    <span>{v.contact}</span>
                  </div>
                )}
                {v.price !== null && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                    <span>${v.price.toLocaleString()}</span>
                  </div>
                )}
                {v.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    <p className="line-clamp-3 leading-relaxed">{v.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-blush-50 w-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Contracts</p>
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.dataset.vendorId = v.id;
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={uploadingFor === v.id}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                  >
                    <UploadCloud className="h-3 w-3" />
                    {uploadingFor === v.id ? 'Uploading...' : 'Upload PDF'}
                  </button>
                </div>
                {v.files && v.files.length > 0 ? (
                  <ul className="space-y-2">
                    {v.files.map((f) => (
                      <li key={f.id} className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded-md">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-3 w-3 text-red-400 shrink-0" />
                          <span className="text-xs text-gray-600 truncate">{f.filename}</span>
                        </div>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-gray-400 hover:text-charcoal"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">No files attached</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          const vId = e.target.dataset.vendorId;
          if (vId) handleFileUpload(e, vId);
        }}
      />

      {/* Vendor Form Modal */}
      <Modal open={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}>
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <Input
            label="Vendor Name"
            required
            value={vendorForm.name || ''}
            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
            placeholder="e.g. Dream Photography"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input bg-white"
                value={vendorForm.category || 'VENUE'}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value as VendorCategory })}
              >
                {Object.values(VENDOR_CATEGORY).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input bg-white"
                value={vendorForm.status || 'INQUIRY'}
                onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as VendorStatus })}
              >
                {Object.entries(VENDOR_STATUS).map(([key, val]) => (
                  <option key={key} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Info"
              value={vendorForm.contact || ''}
              onChange={(e) => setVendorForm({ ...vendorForm, contact: e.target.value })}
              placeholder="Email or phone"
            />
            <Input
              label="Price"
              type="number"
              min={0}
              step="0.01"
              value={vendorForm.price ?? ''}
              onChange={(e) => setVendorForm({ ...vendorForm, price: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input bg-white w-full h-24 resize-none py-2"
              value={vendorForm.notes || ''}
              onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
              placeholder="Any details, meeting notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsVendorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingVendor ? 'Save Changes' : 'Add Vendor'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${vendorToDelete?.name}?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
