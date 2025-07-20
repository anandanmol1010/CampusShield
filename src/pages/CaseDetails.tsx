import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, Phone, Calendar, User, MessageSquare, Save, Download } from 'lucide-react';

interface ComplaintData {
  ticketId: string;
  category: string;
  description: string;
  dateSubmitted: string;
  status: 'pending' | 'in-review' | 'resolved';
  adminNotes: string;
  hasAttachment: boolean;
  contactEmail?: string;
  contactPhone?: string;
  attachmentName?: string;
  timeline: Array<{
    date: string;
    action: string;
    notes: string;
  }>;
}

const CaseDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-review' | 'resolved'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockComplaints: ComplaintData[] = [
    {
      ticketId: 'CS12345678',
      category: 'harassment',
      description: 'Inappropriate behavior from a senior student in the library during study hours. The student has been making uncomfortable comments and gestures repeatedly over the past week. This is affecting my ability to study and I feel unsafe in the library environment. The incidents usually occur during evening hours between 6-8 PM when there are fewer people around.',
      dateSubmitted: '2025-01-15',
      status: 'in-review',
      adminNotes: 'Investigation initiated. Security footage being reviewed. Contacted library security team.',
      hasAttachment: true,
      contactEmail: 'student@university.edu',
      attachmentName: 'evidence_screenshot.jpg',
      timeline: [
        {
          date: '2025-01-15',
          action: 'Complaint Submitted',
          notes: 'Initial complaint received and assigned ticket ID'
        },
        {
          date: '2025-01-16',
          action: 'Under Review',
          notes: 'Case assigned to investigation team'
        },
        {
          date: '2025-01-17',
          action: 'Evidence Reviewed',
          notes: 'Security footage and attachment reviewed'
        }
      ]
    },
    {
      ticketId: 'CS87654321',
      category: 'ragging',
      description: 'Being forced to do inappropriate tasks by senior students in the hostel. They are making me clean their rooms, do their laundry, and perform embarrassing acts in front of other students. This has been going on for two weeks and is causing me significant mental distress. I am afraid to report this directly as they have threatened consequences.',
      dateSubmitted: '2025-01-14',
      status: 'resolved',
      adminNotes: 'Case resolved. Disciplinary action taken against the involved students. Counseling support provided to the complainant.',
      hasAttachment: false,
      contactPhone: '+1 (555) 123-4567',
      timeline: [
        {
          date: '2025-01-14',
          action: 'Complaint Submitted',
          notes: 'Ragging complaint received'
        },
        {
          date: '2025-01-15',
          action: 'Investigation Started',
          notes: 'Hostel warden and anti-ragging committee notified'
        },
        {
          date: '2025-01-18',
          action: 'Action Taken',
          notes: 'Disciplinary action against perpetrators'
        },
        {
          date: '2025-01-20',
          action: 'Case Resolved',
          notes: 'Follow-up completed, support provided'
        }
      ]
    }
  ];

  useEffect(() => {
    // Check admin authentication
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin-login');
      return;
    }

    // Simulate loading
    setTimeout(() => {
      const found = mockComplaints.find(c => c.ticketId === ticketId);
      if (found) {
        setComplaint(found);
        setAdminNotes(found.adminNotes);
        setStatus(found.status);
      }
      setIsLoading(false);
    }, 500);
  }, [ticketId, navigate]);

  const handleSave = () => {
    if (complaint) {
      // In a real app, this would update the database
      console.log('Saving updates:', { ticketId, adminNotes, status });
      // Show success message or update UI
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      'in-review': 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status as keyof typeof colors]}`}>
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

  if (isLoading) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Case Not Found</h2>
            <p className="text-slate-600 mb-6">The requested case could not be found.</p>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/admin"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Case Details</h1>
              <p className="text-slate-600">Ticket ID: <span className="font-mono font-medium">{complaint.ticketId}</span></p>
            </div>
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Case Information */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Case Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Category</h3>
                  <p className="text-slate-900">{getCategoryDisplayName(complaint.category)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Date Submitted</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-900">{new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-900 leading-relaxed">{complaint.description}</p>
                </div>
              </div>

              {complaint.hasAttachment && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Attachments</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <span className="text-slate-900">{complaint.attachmentName || 'evidence_file.jpg'}</span>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Case Timeline</h2>
              
              <div className="space-y-4">
                {complaint.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-slate-900">{event.action}</h3>
                        <span className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">{event.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            {(complaint.contactEmail || complaint.contactPhone) && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {complaint.contactEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-900">{complaint.contactEmail}</span>
                    </div>
                  )}
                  {complaint.contactPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-900">{complaint.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Management */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Status Management</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                    Current Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'pending' | 'in-review' | 'resolved')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Notes</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-medium text-slate-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={6}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about the case progress, actions taken, or next steps..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;