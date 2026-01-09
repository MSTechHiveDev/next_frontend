"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations/services/hospitalAdmin.service";
import { adminService } from "@/lib/integrations";
import type { CreateHospitalHelpdeskRequest } from "@/lib/integrations";
import {
  Headphones,
  Plus,
  Edit3,
  Trash2,
  User,
  Phone,
  Mail,
  Key,
  Building2,
  AlertCircle,
  CheckCircle,
  Copy
} from "lucide-react";
import { PageHeader, Card, Button, Badge, Modal, ConfirmModal, FormInput, FormSelect, FormTextarea } from "@/components/admin";

export default function HospitalAdminHelpdesks() {
  const [helpdesk, setHelpdesk] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    staffId: "",
    additionalNotes: ""
  });

  const [newCredentials, setNewCredentials] = useState<{loginId: string; password: string} | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    additionalNotes: ""
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    cancelText: "Cancel",
    type: "danger" as "danger" | "warning" | "info",
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch helpdesk (should only be one)
      const helpdeskData = await hospitalAdminService.getHelpdesks();
      if (helpdeskData.helpdesks && helpdeskData.helpdesks.length > 0) {
        setHelpdesk(helpdeskData.helpdesks[0]);
      }

      // Fetch available staff for assignment
      const staffData = await hospitalAdminService.getStaff();
      setStaff(staffData.staff || []);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateCredentials = (mobile: string) => {
    // Generate 8-character alphanumeric password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars like I, l, 1, O, 0
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Generate HELP-XXXX login ID
    const randomId = Math.floor(1000 + Math.random() * 9000);
    
    return {
      loginId: `HELP-${randomId}`,
      password: password
    };
  };

  const handleCreateHelpdesk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.staffId) {
      toast.error("Please select a staff member");
      return;
    }

    const selectedStaff = staff.find(s => (s.staffProfileId || s._id) === createFormData.staffId);
    if (!selectedStaff) {
      toast.error("Selected staff not found");
      return;
    }

    if (!selectedStaff.mobile) {
      toast.error("Selected staff must have a mobile number");
      return;
    }

    setCreating(true);

    try {
      const credentials = generateCredentials(selectedStaff.mobile);

      const payload: CreateHospitalHelpdeskRequest = {
        staffId: createFormData.staffId,
        loginId: credentials.loginId,
        password: credentials.password,
        additionalNotes: createFormData.additionalNotes
      };

      await hospitalAdminService.createHelpdesk(payload);

      // Save credentials to show in alert
      setNewCredentials(credentials);

      toast.success("Help desk created successfully! Please copy the credentials.");
      setShowCreateModal(false);
      setCreateFormData({ staffId: "", additionalNotes: "" });

      // Refresh data
      await fetchData();

    } catch (error: any) {
      console.error("Failed to create helpdesk:", error);
      toast.error(error.message || "Failed to create help desk");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateHelpdesk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!helpdesk) return;

    setUpdating(true);

    try {
      await hospitalAdminService.updateHelpdesk(helpdesk._id, {
        name: editFormData.name,
        email: editFormData.email,
        mobile: editFormData.mobile,
        additionalNotes: editFormData.additionalNotes
      });

      toast.success("Help desk updated successfully!");
      setShowEditModal(false);

      // Refresh data
      await fetchData();

    } catch (error: any) {
      console.error("Failed to update helpdesk:", error);
      toast.error(error.message || "Failed to update help desk");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteHelpdesk = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Help Desk",
      message: "Are you sure you want to delete the help desk? This will remove the assigned staff member from help desk duties.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        try {
          await hospitalAdminService.deleteHelpdesk(helpdesk._id);
          toast.success("Help desk deleted successfully!");
          setHelpdesk(null);

          // Refresh data
          await fetchData();

        } catch (error: any) {
          console.error("Failed to delete helpdesk:", error);
          toast.error(error.message || "Failed to delete help desk");
        }
      }
    });
  };

  const openEditModal = () => {
    if (!helpdesk) return;

    setEditFormData({
      name: helpdesk.name || "",
      email: helpdesk.email || "",
      mobile: helpdesk.mobile || "",
      additionalNotes: helpdesk.additionalNotes || ""
    });
    setShowEditModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--secondary-color)' }}>Loading help desk information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <PageHeader
        icon={<Headphones className="text-blue-500" />}
        title="Help Desk Management"
        subtitle="Manage the hospital help desk and assigned staff"
      />

      {!helpdesk ? (
        // No help desk exists - show create option
        <Card padding="p-12">
          <div className="text-center">
            <Headphones className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
              No Help Desk Configured
            </h3>
            <p className="mb-6" style={{ color: 'var(--secondary-color)' }}>
              Create a help desk by assigning a staff member to handle patient inquiries and support.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Create Help Desk
            </Button>
          </div>
        </Card>
      ) : (
        // Help desk exists - show details and management options
        <div className="space-y-6">
          {/* Help Desk Overview */}
          <Card padding="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Headphones size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                    Hospital Help Desk
                  </h2>
                  <p style={{ color: 'var(--secondary-color)' }}>
                    Managed by {helpdesk.assignedStaff?.user?.name || 'Unknown Staff'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={openEditModal}
                  className="flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteHelpdesk}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>

            {/* Help Desk Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>
                    Assigned Staff
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <User size={16} style={{ color: 'var(--secondary-color)' }} />
                    <span style={{ color: 'var(--text-color)' }}>
                      {helpdesk.assignedStaff?.user?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>
                    Login ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Key size={16} style={{ color: 'var(--secondary-color)' }} />
                    <span style={{ color: 'var(--text-color)' }}>{helpdesk.loginId}</span>
                    <button
                      onClick={() => copyToClipboard(helpdesk.loginId)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy Login ID"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>
                    Contact Information
                  </label>
                  <div className="space-y-2 mt-1">
                    {helpdesk.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} style={{ color: 'var(--secondary-color)' }} />
                        <span style={{ color: 'var(--text-color)' }}>{helpdesk.mobile}</span>
                      </div>
                    )}
                    {helpdesk.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} style={{ color: 'var(--secondary-color)' }} />
                        <span style={{ color: 'var(--text-color)' }}>{helpdesk.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={helpdesk.status === 'active' ? 'success' : 'danger'}>
                      {helpdesk.status?.toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>

                {helpdesk.additionalNotes && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>
                      Additional Notes
                    </label>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-color)' }}>
                      {helpdesk.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Credentials Card */}
          <Card padding="p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
              Login Credentials
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    Important: Save these credentials securely
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Login ID
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-yellow-100 dark:bg-yellow-800 px-3 py-1 rounded text-sm font-mono">
                          {helpdesk.loginId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(helpdesk.loginId)}
                          className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-700 rounded"
                          title="Copy Login ID"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Password (8-Character Code)
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-yellow-100 dark:bg-yellow-800 px-3 py-1 rounded text-sm font-mono">
                          ••••••••
                        </code>
                        <span className="text-xs text-yellow-700 dark:text-yellow-300">
                          (Hidden for security - was shown once at creation)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Share these credentials with the assigned staff member. They can change the password after first login.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Help Desk Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Help Desk"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateHelpdesk} className="space-y-6">
          <div className="space-y-4">
             <FormSelect
              label="Assign Staff Member"
              name="staffId"
              value={createFormData.staffId}
              onChange={(e) => setCreateFormData({ ...createFormData, staffId: e.target.value })}
              options={[
                { label: "Select Staff Member", value: "" },
                ...staff
                  .filter(s => s.mobile) // Only staff with mobile numbers
                  .map(s => ({
                    label: `${s.name} (${s.mobile})`,
                    value: s.staffProfileId || s._id // Use staffProfileId if available
                  }))
              ]}
              required
            />

            <FormTextarea
              label="Additional Notes"
              name="additionalNotes"
              value={createFormData.additionalNotes}
              onChange={(e) => setCreateFormData({ ...createFormData, additionalNotes: e.target.value })}
              placeholder="Any special instructions or notes for the help desk staff..."
              rows={3}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-500 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Auto-Generated Credentials
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Login ID will be in format HELP-XXXX, and password will be a unique 8-character code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={creating}
            >
              Create Help Desk
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Help Desk Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Help Desk"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateHelpdesk} className="space-y-6">
          <div className="space-y-4">
            <FormInput
              label="Staff Name"
              name="name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />

            <FormInput
              label="Mobile Number"
              name="mobile"
              value={editFormData.mobile}
              onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
            />

            <FormTextarea
              label="Additional Notes"
              name="additionalNotes"
              value={editFormData.additionalNotes}
              onChange={(e) => setEditFormData({ ...editFormData, additionalNotes: e.target.value })}
              placeholder="Any special instructions or notes for the help desk staff..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updating}
            >
              Update Help Desk
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />

      {/* New Credentials Modal */}
      {newCredentials && (
        <Modal
          isOpen={true}
          onClose={() => setNewCredentials(null)}
          title="🎉 Helpdesk Created Successfully!"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-0.5" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">
                    Important: Save These Credentials!
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                    This is the ONLY time you'll see the plain password. Copy it now and share with the staff member.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-green-900 dark:text-green-100 uppercase">
                        Login ID
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg text-lg font-mono font-bold border-2 border-green-300">
                          {newCredentials.loginId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(newCredentials.loginId)}
                          className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="Copy Login ID"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-green-900 dark:text-green-100 uppercase">
                        Password (8-Character Code)
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg text-lg font-mono font-bold border-2 border-green-300 tracking-wider">
                          {newCredentials.password}
                        </code>
                        <button
                          onClick={() => copyToClipboard(newCredentials.password)}
                          className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="Copy Password"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button
                onClick={async () => {
                  if (!helpdesk?._id) {
                    toast.error("Helpdesk ID not found");
                    return;
                  }
                  
                  try {
                    const response = await hospitalAdminService.sendHelpdeskCredentials({
                      helpdeskId: helpdesk._id,
                      loginId: newCredentials.loginId,
                      password: newCredentials.password
                    });
                    toast.success(response.message || "Credentials sent via email!");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to send credentials");
                  }
                }}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Mail size={18} />
                Send via Email
              </Button>
              
              <Button
                onClick={() => setNewCredentials(null)}
                variant="primary"
              >
                I've Saved the Credentials
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

