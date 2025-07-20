export interface Complaint {
  category: string;
  description: string;
  optionalContact?: string;
  timestamp: Date;
  fileURL?: string;
  ticketID: string;
  status: 'Pending' | 'In Review' | 'Resolved';
  adminNotes?: string;
}
