import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Filter, Download, Eye, FileText, Mail, Phone, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface ComplaintData {
  ticketId: string;
  category: string;
  description: string;
  dateSubmitted: string | Date;
  status: 'pending' | 'in-review' | 'resolved';
  adminNotes: string;
  hasAttachment: boolean;
  contactEmail?: string;
  contactPhone?: string;
  fileURL?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState(complaints);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'complaints'), (snapshot) => {
      const complaintsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Complaint Data:', data); // Debugging log for each complaint
        const dateSubmitted = data.timestamp ? new Date(data.timestamp.seconds * 1000) : 'N/A';

        return {
          ...data,
          ticketId: data.ticketID || data.ticketId || doc.id,
          dateSubmitted,
          contactEmail: data.contactEmail, // Ensure correct retrieval
          contactPhone: data.contactPhone, // Ensure correct retrieval
        } as ComplaintData;
      });
      console.log('Complaints Data:', complaintsData); // Debugging log
      setComplaints(complaintsData);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin-login');
  };

  React.useEffect(() => {
    let filtered = complaints;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    setFilteredComplaints(filtered);
  }, [categoryFilter, statusFilter, complaints]);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      'in-review': 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const getCategoryDisplayName = (category: string) => {
    const categories = {
      'ragging': 'Ragging',
      'harassment': 'Harassment',
      'mental-health': 'Mental Health',
      'faculty-misconduct': 'Faculty Misconduct',
      'others': 'Others'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleRowClick = (complaint: ComplaintData) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  const handleExport = () => {
    const headers = ["Ticket ID", "Category", "Status", "Description", "Contact Email", "Contact Phone", "Date Submitted", "Time Submitted", "Image URL", "Admin Notes"];
    const data = complaints.map(c => {
      const date = typeof c.dateSubmitted === 'string' ? new Date(c.dateSubmitted) : c.dateSubmitted;
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString();
      const imageUrl = c.fileURL ? c.fileURL : 'Not Available';
      const adminNotes = c.adminNotes ? c.adminNotes : 'Not Available';
      return [c.ticketId, c.category, c.status, c.description, c.contactEmail || '', c.contactPhone || '', dateString, timeString, imageUrl, adminNotes];
    });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints');
    XLSX.writeFile(workbook, 'complaints.xlsx');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Settings className="h-8 w-8 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CampusShield Admin Panel</h1>
                <p className="text-slate-600">Manage and review submitted complaints</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-slate-600" />
              <div className="flex items-center space-x-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="ragging">Ragging</option>
                  <option value="harassment">Harassment</option>
                  <option value="mental-health">Mental Health</option>
                  <option value="faculty-misconduct">Faculty Misconduct</option>
                  <option value="others">Others</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span className="text-slate-600">
                    {complaints.filter(c => c.status === 'pending').length} Pending
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-600">
                    {complaints.filter(c => c.status === 'in-review').length} In Review
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-600">
                    {complaints.filter(c => c.status === 'resolved').length} Resolved
                  </span>
                </div>
              </div>
              <button 
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredComplaints.map((complaint) => (
                  <tr 
                    key={complaint.ticketId} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(complaint)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium text-slate-900">
                          {complaint.ticketId}
                        </span>
                        {complaint.hasAttachment && (
                          <FileText className="h-4 w-4 text-blue-600" title="Has attachment" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">
                        {getCategoryDisplayName(complaint.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {typeof complaint.dateSubmitted === 'string' ? complaint.dateSubmitted : complaint.dateSubmitted.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {complaint.contactEmail && (
                          <Mail className="h-4 w-4 text-slate-600" title={complaint.contactEmail} />
                        )}
                        {complaint.contactPhone && (
                          <Phone className="h-4 w-4 text-slate-600" title={complaint.contactPhone} />
                        )}
                        {!(complaint.contactEmail || complaint.contactPhone) && (
                          <span className="text-xs text-slate-400">Anonymous</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/admin/case/${complaint.ticketId}`}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      {complaint.fileURL && (
                        <a 
                          href={complaint.fileURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span>View File</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Complaint Details */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Complaint Details
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Ticket ID</p>
                      <p className="font-mono font-medium text-slate-900">{selectedComplaint.ticketId}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Category</p>
                      <p className="text-slate-900">{getCategoryDisplayName(selectedComplaint.category)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date Submitted</p>
                      <p className="text-slate-900">{typeof selectedComplaint.dateSubmitted === 'string' ? selectedComplaint.dateSubmitted : selectedComplaint.dateSubmitted.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-2">Description</p>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-900 leading-relaxed">{selectedComplaint.description}</p>
                    </div>
                  </div>

                  {selectedComplaint.hasAttachment && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Attachments</p>
                      <div className="bg-slate-50 p-3 rounded-lg flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Evidence file attached</span>
                      </div>
                    </div>
                  )}

                  {(selectedComplaint.contactEmail || selectedComplaint.contactPhone) && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Contact Information</p>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        {selectedComplaint.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-700">{selectedComplaint.contactEmail}</span>
                          </div>
                        )}
                        {selectedComplaint.contactPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-700">{selectedComplaint.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedComplaint.adminNotes && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Admin Notes</p>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-800 text-sm">{selectedComplaint.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {selectedComplaint.fileURL && (
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <a 
                        href={selectedComplaint.fileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>View File</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;