import React, { useState, useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Mail,
  Users,
} from 'lucide-react';
import { useWeddingStore } from '../store/weddingStore';
import type { Guest, RsvpStatus } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const RSVP_COLORS: Record<RsvpStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-800',
};

export default function GuestsPage() {
  const {
    guests,
    tables,
    loading,
    fetchGuests,
    fetchTables,
    createGuest,
    updateGuest,
    deleteGuest,
    importGuests,
    remindGuest,
  } = useWeddingStore();

  useEffect(() => {
    fetchGuests();
    fetchTables();
  }, [fetchGuests, fetchTables]);

  const [search, setSearch] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<RsvpStatus | 'ALL'>('ALL');

  // Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (g.email && g.email.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterRsvp === 'ALL' || g.rsvpStatus === filterRsvp;
      return matchSearch && matchStatus;
    });
  }, [guests, search, filterRsvp]);

  // Form state
  const [formData, setFormData] = useState<Partial<Guest>>({});

  const openNewModal = () => {
    setEditingGuest(null);
    setFormData({ rsvpStatus: 'PENDING', plusOne: false });
    setIsGuestModalOpen(true);
  };

  const openEditModal = (g: Guest) => {
    setEditingGuest(g);
    setFormData(g);
    setIsGuestModalOpen(true);
  };

  const openDeleteModal = (g: Guest) => {
    setGuestToDelete(g);
    setIsDeleteModalOpen(true);
  };

  const handeSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, formData);
        toast.success('Guest updated');
      } else {
        await createGuest(formData as Parameters<typeof createGuest>[0]);
        toast.success('Guest added');
      }
      setIsGuestModalOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to save guest');
    }
  };

  const confirmDelete = async () => {
    if (!guestToDelete) return;
    try {
      await deleteGuest(guestToDelete.id);
      toast.success('Guest deleted');
      setIsDeleteModalOpen(false);
      setGuestToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to delete guest');
    }
  };

  const handleRemind = async (g: Guest) => {
    try {
      await remindGuest(g.id);
      toast.success(`Reminder sent to ${g.firstName}`);
    } catch (err: unknown) {
      toast.error('Failed to send reminder');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imported = results.data.map((row: any) => ({
            firstName: row.firstName || row['First Name'] || 'Unknown',
            lastName: row.lastName || row['Last Name'] || 'Unknown',
            email: row.email || row['Email'],
            phone: row.phone || row['Phone'],
            rsvpStatus: (row.rsvpStatus || row['RSVP'] || 'PENDING').toUpperCase(),
            dietaryNeeds: row.dietaryNeeds || row['Dietary Needs'],
            plusOne: String(row.plusOne || row['Plus One']).toLowerCase() === 'true',
          }));
          await importGuests(imported);
          toast.success(`Imported ${imported.length} guests`);
        } catch (err) {
          toast.error('Failed to import guests');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const totalGuests = guests.length;
  const accepted = guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length;
  const pending = guests.filter((g) => g.rsvpStatus === 'PENDING').length;
  const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Guest List</h1>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="h-4 w-4" />}
          >
            Import CSV
          </Button>
          <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>
            Add Guest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold mt-1 text-charcoal">{totalGuests}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Accepted</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{accepted}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{pending}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Declined</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{declined}</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-blush-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guests..."
              className="input pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200">
            {['ALL', 'PENDING', 'ACCEPTED', 'DECLINED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterRsvp(status as RsvpStatus | 'ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterRsvp === status
                    ? 'bg-charcoal text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {guests.length === 0 && !loading.guests ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 bg-blush-50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blush-400" />
            </div>
            <h3 className="text-lg font-medium text-charcoal">No guests yet</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Start building your guest list or import from CSV
            </p>
            <Button onClick={openNewModal} icon={<Plus className="h-4 w-4" />}>
              Add your first guest
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 w-32">RSVP</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-charcoal">
                        {g.firstName} {g.lastName}
                      </p>
                      {g.plusOne && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">
                          +1
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{g.email || '-'}</div>
                      <div className="text-xs text-gray-400">{g.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RSVP_COLORS[g.rsvpStatus]}`}>
                        {g.rsvpStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate space-y-1">
                      {g.dietaryNeeds ? (
                        <div className="flex items-center gap-1.5" title={g.dietaryNeeds}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span className="truncate text-xs">{g.dietaryNeeds}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">-</div>
                      )}
                      
                      {g.tableId && (
                        <div className="text-xs text-indigo-500 font-medium">
                          Table: {tables.find(t => t.id === g.tableId)?.name || 'Unknown'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Send RSVP Reminder"
                          onClick={() => handleRemind(g)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEditModal(g)}
                          className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => openDeleteModal(g)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredGuests.length === 0 && guests.length > 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No guests match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        open={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title={editingGuest ? 'Edit Guest' : 'Add Guest'}
      >
        <form onSubmit={handeSaveGuest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">RSVP Status</label>
            <select
              className="input bg-white"
              value={formData.rsvpStatus || 'PENDING'}
              onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value as RsvpStatus })}
            >
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>

          <Input
            label="Dietary Needs / Notes"
            value={formData.dietaryNeeds || ''}
            onChange={(e) => setFormData({ ...formData, dietaryNeeds: e.target.value })}
          />

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blush-400 focus:ring-blush-400 h-4 w-4"
              checked={formData.plusOne || false}
              onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })}
            />
            <span className="text-sm font-medium text-charcoal">Include +1</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsGuestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingGuest ? 'Save Changes' : 'Add Guest'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Guest"
        message={`Are you sure you want to delete ${guestToDelete?.firstName} ${guestToDelete?.lastName}? This cannot be undone.`}
        confirmLabel="Delete Guest"
      />
    </div>
  );
}
