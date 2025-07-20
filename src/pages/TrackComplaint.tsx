import React, { useState } from 'react';
import { Search, AlertCircle, Clock, Eye, CheckCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ComplaintData {
  ticketId: string;
  category: string;
  description: string;
  dateSubmitted: string;
  status: 'pending' | 'in-review' | 'resolved';
  adminNotes: string;
  hasAttachment: boolean;
  timestamp: any;
  fileURL: string;
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
      const q = query(collection(db, 'complaints'), where('ticketId', '==', ticketId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setNotFound(true);
        setComplaintData(null);
      } else {
        querySnapshot.forEach((doc) => {
          setComplaintData(doc.data() as ComplaintData);
        });
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
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, text: 'Pending' },
      'in-review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye, text: 'In Review' },
      resolved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Resolved' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
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
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Complaint Details</h2>
                {getStatusBadge(complaintData.status)}
              </div>
              <div className="text-sm text-slate-500 mb-4">
                Ticket ID: <span className="font-mono font-medium text-slate-700">{complaintData.ticketId}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Category</h3>
                  <p className="text-slate-700">{getCategoryDisplayName(complaintData.category)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Date Submitted</h3>
                  <p className="text-slate-700">{new Date(complaintData.dateSubmitted).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-lg leading-relaxed">
                  {complaintData.description}
                </p>
              </div>

              {complaintData.hasAttachment && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Attachments</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-600 text-sm">
                      📎 Evidence file attached (viewable by administrators only)
                    </p>
                  </div>
                </div>
              )}

              {complaintData.adminNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Admin Notes</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-800">{complaintData.adminNotes}</p>
                  </div>
                </div>
              )}
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