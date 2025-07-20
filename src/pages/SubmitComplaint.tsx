import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { uploadFile } from '../../lib/cloudinary';
import { generateTicketID } from '../../lib/ticketID';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const SubmitComplaint: React.FC = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    email: '',
    phone: '',
    file: null as File | null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    const newTicketId = generateTicketID();
    let fileURL = '';

    if (formData.file) {
      fileURL = await uploadFile(formData.file);
    }

    // Store contact email and phone separately
    const complaintData = {
      category: formData.category,
      description: formData.description,
      contactEmail: formData.email, // Store email separately
      contactPhone: formData.phone, // Store phone separately
      timestamp: Timestamp.now(),
      fileURL,
      ticketID: newTicketId,
      status: 'Pending',
    };

    try {
      await addDoc(collection(db, 'complaints'), complaintData);
      setTicketId(newTicketId);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, file });
  };

  if (isSubmitted) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Complaint Submitted Successfully</h2>
            <p className="text-slate-600 mb-6">
              Your complaint has been received and is now being reviewed by our team.
            </p>
            <div className="bg-slate-50 p-6 rounded-xl mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Ticket ID</h3>
              <div className="text-2xl font-mono font-bold text-blue-600 bg-white p-3 rounded-lg border-2 border-blue-200">
                {ticketId}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Save this ID to track your complaint status
              </p>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  category: '',
                  description: '',
                  email: '',
                  phone: '',
                  file: null
                });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Submit Anonymous Complaint
          </h1>
          <p className="text-lg text-slate-600">
            Your identity will remain completely anonymous. Provide as much detail as possible to help us address your concern.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-900 mb-2">
                Complaint Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select a category</option>
                <option value="ragging">Ragging</option>
                <option value="harassment">Harassment</option>
                <option value="mental-health">Mental Health</option>
                <option value="faculty-misconduct">Faculty Misconduct</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                Complaint Description *
              </label>
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide detailed information about the incident, including when and where it occurred, who was involved (if known), and any other relevant details..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Optional Contact Info */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">Optional Contact Information</h3>
                  <p className="text-sm text-amber-700">
                    Providing contact information is completely optional. If provided, it will only be used for follow-up if absolutely necessary.
                  </p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file" className="block text-sm font-semibold text-slate-900 mb-2">
                Attach Evidence (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">
                      {formData.file ? formData.file.name : 'Click to upload screenshot, document, or PDF'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Max file size: 10MB. Formats: JPG, PNG, PDF, DOC
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </button>
              <p className="text-sm text-slate-500 text-center mt-3">
                You'll receive a ticket ID to track your complaint status
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;