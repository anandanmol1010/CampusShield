import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, Phone, Calendar, Save, Download, Clock, CheckCircle, Edit3 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface ComplaintData {
  ticketId: string;
  category: string;
  description: string;
  dateSubmitted: string;
  status: 'pending' | 'in-review' | 'resolved' | 'Pending' | 'In-Review' | 'Resolved';
  adminNotes?: string;
  adminNotesHistory?: Array<{
    note: string;
    timestamp: string;
    adminId?: string;
  }>;
  hasAttachment?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  attachmentName?: string;
  fileURL?: string;
  timeline?: Array<{
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

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      if (!ticketId) {
        console.error('No ticketId provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching complaint details for ticketId:', ticketId);
        
        // Query by ticketId field instead of using it as document ID
        const q = query(
          collection(db, 'complaints'),
          where('ticketId', '==', ticketId)
        );
        
        // Also try with ticketID field as backup
        const q2 = query(
          collection(db, 'complaints'),
          where('ticketID', '==', ticketId)
        );
        
        let querySnapshot = await getDocs(q);
        
        // If no results with ticketId, try with ticketID
        if (querySnapshot.empty) {
          querySnapshot = await getDocs(q2);
        }
        
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          
          // Store the actual document ID for updates
          let complaintData = {
            ...data,
            ticketId: data.ticketID || data.ticketId || docSnap.id,
            docId: docSnap.id, // Store the actual Firestore document ID
            dateSubmitted: data.timestamp ? new Date(data.timestamp.seconds * 1000) : data.dateSubmitted
          } as ComplaintData & { docId: string };
          
          // Initialize timeline if it doesn't exist
          if (!complaintData.timeline || complaintData.timeline.length === 0) {
            const initialTimeline = [{
              date: data.timestamp ? new Date(data.timestamp.seconds * 1000).toISOString() : new Date().toISOString(),
              action: 'Case Created',
              notes: 'Complaint submitted and case opened',
              type: 'case_created'
            }];
            
            complaintData = {
              ...complaintData,
              timeline: initialTimeline
            };
            
            // Update Firestore with initial timeline
            try {
              await updateDoc(docSnap.ref, { timeline: initialTimeline });
            } catch (error) {
              console.log('Could not update timeline in Firestore:', error);
            }
          }
          
          console.log('Fetched data:', complaintData);
          setComplaint(complaintData);
          setStatus(complaintData.status.toLowerCase() as 'pending' | 'in-review' | 'resolved');
          setAdminNotes(complaintData.adminNotes || '');
        } else {
          console.error('No complaint found with ticketId:', ticketId);
          setComplaint(null);
        }
      } catch (error) {
        console.error('Error fetching complaint details:', error);
        navigate('/error');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchComplaintDetails();
  }, [ticketId, navigate]);

  
  const handleSave = async () => {
    if (!complaint || !ticketId) return;
    
    const complaintWithDocId = complaint as ComplaintData & { docId?: string };
    const documentId = complaintWithDocId.docId;
    
    if (!documentId) {
      alert('Error: Document ID not found. Please refresh and try again.');
      return;
    }
    
    try {
      console.log('Saving updates:', { ticketId, adminNotes, status, documentId });
      
      // Create timeline entries for changes
      const currentTimeline = complaint.timeline || [];
      const newTimelineEntries = [];
      
      // Check if status changed
      if (complaint.status.toLowerCase() !== status.toLowerCase()) {
        newTimelineEntries.push({
          date: new Date().toISOString(),
          action: `Status changed to ${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}`,
          notes: `Case status updated from ${complaint.status} to ${status}`,
          type: 'status_change'
        });
      }
      
      // Handle admin notes history
      const currentNotesHistory = complaint.adminNotesHistory || [];
      let updatedNotesHistory = currentNotesHistory;
      
      // Check if admin notes were added/changed
      if (adminNotes && adminNotes.trim() !== '' && adminNotes !== (complaint.adminNotes || '')) {
        // Add to notes history
        const newNoteEntry = {
          note: adminNotes,
          timestamp: new Date().toISOString(),
          adminId: 'admin' // You can replace this with actual admin ID if available
        };
        updatedNotesHistory = [...currentNotesHistory, newNoteEntry];
        
        // Add to timeline
        newTimelineEntries.push({
          date: new Date().toISOString(),
          action: 'Admin notes updated',
          notes: adminNotes,
          type: 'admin_note'
        });
      }
      
      const updatedTimeline = [...currentTimeline, ...newTimelineEntries];
      
      const docRef = doc(db, 'complaints', documentId);
      await updateDoc(docRef, {
        status: status,
        adminNotes: adminNotes,
        adminNotesHistory: updatedNotesHistory,
        timeline: updatedTimeline,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setComplaint(prev => prev ? {
        ...prev,
        status: status,
        adminNotes: adminNotes,
        adminNotesHistory: updatedNotesHistory,
        timeline: updatedTimeline
      } : null);
      
      alert('Case updated successfully!');
      
      // Redirect to admin dashboard after successful save
      navigate('/admin');
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Failed to update case. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      'in-review': 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[normalizedStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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

              {complaint.fileURL && complaint.fileURL.trim() !== '' && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Attachments</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <span className="text-slate-900">{complaint.attachmentName || 'Evidence File'}</span>
                      </div>
                      <a 
                        href={complaint.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>View/Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Case Timeline</h2>
              
              <div className="space-y-4">
                {/* Add initial case creation entry if timeline is empty */}
                {(!complaint.timeline || complaint.timeline.length === 0) && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-slate-900">Case Created</h3>
                        <span className="text-xs text-slate-500">{new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">Complaint submitted and case opened</p>
                    </div>
                  </div>
                )}
                
                {/* Show timeline events */}
                {(complaint.timeline && complaint.timeline.length > 0) ? (
                  complaint.timeline.map((event, index) => {
                    const getEventIcon = (type: string) => {
                      switch (type) {
                        case 'status_change':
                          return <CheckCircle className="h-4 w-4 text-green-600" />;
                        case 'admin_note':
                          return <Edit3 className="h-4 w-4 text-blue-600" />;
                        case 'case_created':
                          return <FileText className="h-4 w-4 text-blue-600" />;
                        default:
                          return <Clock className="h-4 w-4 text-slate-600" />;
                      }
                    };
                    
                    const getEventBgColor = (type: string) => {
                      switch (type) {
                        case 'status_change':
                          return 'bg-green-100';
                        case 'admin_note':
                          return 'bg-blue-100';
                        case 'case_created':
                          return 'bg-blue-100';
                        default:
                          return 'bg-slate-100';
                      }
                    };
                    
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 ${getEventBgColor((event as any).type)} rounded-full flex items-center justify-center`}>
                          {getEventIcon((event as any).type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-slate-900">{event.action}</h3>
                            <span className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm text-slate-600">{event.notes}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm">Timeline will show updates as the case progresses.</p>
                  </div>
                )}
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
                
                {/* Admin Notes History */}
                {complaint.adminNotesHistory && complaint.adminNotesHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Notes History</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {complaint.adminNotesHistory
                        .slice()
                        .reverse() // Show latest first
                        .map((noteEntry, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-600">
                              {noteEntry.adminId || 'Admin'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(noteEntry.timestamp).toLocaleDateString()} at {new Date(noteEntry.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-800 leading-relaxed">{noteEntry.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;