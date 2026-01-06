"use client";

import React, { useState, useEffect } from "react";
import { Search, MessageSquare, ExternalLink } from "lucide-react";
import { adminService } from "@/lib/integrations";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { PageHeader, Table, Badge, getStatusVariant, Card } from "@/components/admin";
import toast from "react-hot-toast";

export default function SupportPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  const fetchTickets = async () => {
    try {
      const data = await adminService.getSupportRequestsClient();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase();
    return (
      (ticket.name?.toLowerCase() || "").includes(query) ||
      (ticket.subject?.toLowerCase() || "").includes(query) ||
      (ticket.email?.toLowerCase() || "").includes(query)
    );
  });

  const headers = ["User", "Role", "Subject", "Type", "Status", "Date", "Action"];

  if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-color)' }}>Loading support registry...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Support & Feedback"
        subtitle="Manage all user inquiries and platform feedback"
        icon={<MessageSquare className="text-blue-500" />}
      />

      <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
          />
      </div>

      {filteredTickets.length > 0 ? (
        <Table headers={headers} responsive>
          {filteredTickets.map((req, index) => (
            <tr
              key={req._id || index}
              className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="py-4 px-3 md:px-6 text-sm max-w-[140px]">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {req.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {req.email || 'No email'}
                </p>
              </td>
              <td className="py-4 px-3 md:px-6 text-sm capitalize font-medium text-gray-900 dark:text-white hidden md:table-cell">
                {req.role || 'User'}
              </td>
              <td className="py-4 px-3 md:px-6 text-sm font-medium text-gray-900 dark:text-white max-w-[120px] truncate">
                {req.subject || 'No Subject'}
              </td>
              <td className="py-4 px-3 md:px-6 text-sm hidden lg:table-cell">
                <Badge variant={req.type === "bug" ? "danger" : "info"}>
                  {(req.type || "OTHER").toUpperCase()}
                </Badge>
              </td>
              <td className="py-4 px-3 md:px-6 text-sm hidden sm:table-cell">
                <Badge variant={getStatusVariant(req.status || "open")}>
                  {(req.status || "OPEN").toUpperCase().replace("-", " ")}
                </Badge>
              </td>
              <td className="py-4 px-3 md:px-6 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                <div>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</div>
                <div className="text-xs opacity-75">
                  {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : ''}
                </div>
              </td>
              <td className="py-4 px-3 md:px-6 text-sm">
                <button
                  onClick={() => toast.success("Ticket details viewing is under deployment")}
                  className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 font-medium text-xs px-3 py-1.5 bg-blue-500/10 rounded-lg transition-all"
                >
                  <ExternalLink size={12} /> View
                </button>
              </td>
            </tr>
          ))}
        </Table>
      ) : tickets.length > 0 ? (
        <Card className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-6">
            <Search size={40} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Matching Tickets</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Try adjusting your search query to find the ticket you're looking for.
          </p>
        </Card>
      ) : (
        <Card className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 mb-6">
            <MessageSquare size={48} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Support Requests</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            User inquiries and platform feedback will appear here for administrative oversight.
          </p>
        </Card>
      )}
    </div>
  );
}
