import React, { useState } from 'react';
import { Search, AlertCircle, Clock, Eye, CheckCircle, FileText, Calendar, Edit3 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
  timestamp?: any;
  fileURL?: string;
  timeline?: Array<{
    date: string;
    action: string;
    notes: string;
    type?: string;
  }>;
  lastUpdated?: string;
}

const TrackComplaint: React.FC = () => {
  const [ticketId, setTicketId] = useState('');
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotFound(false);
    setComplaintData(null);
    setError('');

    try {
      // Try searching with ticketId field first
      const q1 = query(collection(db, 'complaints'), where('ticketId', '==', ticketId));
      let querySnapshot = await getDocs(q1);
      
      // If no results, try with ticketID field (capital ID)
      if (querySnapshot.empty) {
        const q2 = query(collection(db, 'complaints'), where('ticketID', '==', ticketId));
        querySnapshot = await getDocs(q2);
      }

      if (querySnapshot.empty) {
        setNotFound(true);
        setComplaintData(null);
      } else {
        const docData = querySnapshot.docs[0].data();
        // Normalize the data structure
        const normalizedData = {
          ...docData,
          ticketId: docData.ticketID || docData.ticketId,
          dateSubmitted: docData.timestamp ? new Date(docData.timestamp.seconds * 1000).toLocaleDateString() : docData.dateSubmitted,
          status: docData.status.toLowerCase()
        } as ComplaintData;
        
        setComplaintData(normalizedData);
        setNotFound(false);
      }
    } catch (err) {
      console.error('Error fetching complaint:', err);
      setError('Error fetching complaint');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, text: 'Pending' },
      'in-review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye, text: 'In Review' },
      resolved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Resolved' }
    };

    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span>{config.text}</span>
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

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-6">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Track Your Complaint
          </h1>
          <p className="text-lg text-slate-600">
            Enter your ticket ID to check the status of your complaint and see any updates from our team.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="ticketId" className="block text-sm font-semibold text-slate-900 mb-2">
                Ticket ID
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  id="ticketId"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter your ticket ID (e.g., CS12345678)"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Check Status</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {complaintData && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Case Details</h1>
                  <p className="text-slate-600">Ticket ID: <span className="font-mono font-medium">{complaintData.ticketId}</span></p>
                </div>
                {getStatusBadge(complaintData.status)}
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
                      <p className="text-slate-900">{getCategoryDisplayName(complaintData.category)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Date Submitted</h3>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900">{new Date(complaintData.dateSubmitted).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-900 leading-relaxed">{complaintData.description}</p>
                    </div>
                  </div>

                  {complaintData.fileURL && complaintData.fileURL.trim() !== '' && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Attachments</h3>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <span className="text-slate-900">Evidence File</span>
                          <span className="text-xs text-slate-500">(Viewable by administrators only)</span>
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
                    {(!complaintData.timeline || complaintData.timeline.length === 0) && (
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-slate-900">Case Created</h3>
                            <span className="text-xs text-slate-500">{new Date(complaintData.dateSubmitted).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-600">Complaint submitted and case opened</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show timeline events */}
                    {(complaintData.timeline && complaintData.timeline.length > 0) ? (
                      complaintData.timeline.map((event, index) => {
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
                            <div className={`flex-shrink-0 w-8 h-8 ${getEventBgColor(event.type || '')} rounded-full flex items-center justify-center`}>
                              {getEventIcon(event.type || '')}
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
                {/* Current Status */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Status</h2>
                  <div className="text-center">
                    {getStatusBadge(complaintData.status)}
                    <p className="text-sm text-slate-600 mt-3">
                      {complaintData.lastUpdated && (
                        <>Last updated: {new Date(complaintData.lastUpdated).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Admin Updates */}
                {complaintData.adminNotes && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Latest Admin Update</h2>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm leading-relaxed">{complaintData.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Admin Notes History */}
                {complaintData.adminNotesHistory && complaintData.adminNotesHistory.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Updates History</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {complaintData.adminNotesHistory
                        .slice()
                        .reverse() // Show latest first
                        .map((noteEntry, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-600">
                              Admin Update
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(noteEntry.timestamp).toLocaleDateString()}
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
        )}

        {notFound && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
            <div className="p-3 bg-red-100 rounded-xl w-fit mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Complaint Not Found</h2>
            <p className="text-slate-600 mb-6">
              We couldn't find a complaint with the ticket ID "{ticketId}". Please check your ID and try again.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg text-left">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Tips:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Make sure you entered the complete ticket ID</li>
                <li>• Ticket IDs are case-sensitive</li>
                <li>• Check for any extra spaces</li>
                <li>• It may take a few minutes for new complaints to appear in the system</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
            <div className="p-3 bg-red-100 rounded-xl w-fit mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
          </div>
        )}

        {/* Tracking Status Guide */}
        <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Complaint Status Guide</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Pending</span>
              </div>
              <p className="text-sm text-slate-600">
                Your complaint has been received and is waiting for initial review.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">In Review</span>
              </div>
              <p className="text-sm text-slate-600">
                Our team is actively investigating your complaint and gathering information.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Resolved</span>
              </div>
              <p className="text-sm text-slate-600">
                The issue has been addressed and appropriate action has been taken.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackComplaint;