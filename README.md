# CampusShield

CampusShield is a web application designed to facilitate anonymous student complaint reporting. It is built using Next.js 14, React, TypeScript, and Tailwind CSS, with Firebase services for backend integration.

## Features

- **Anonymous Complaint Submission**: Allows students to submit complaints anonymously.
- **Admin Dashboard**: Provides an interface for administrators to view and manage complaints.
- **Complaint Tracking**: Users can track the status of their submitted complaints.
- **Secure File Upload**: Supports file uploads via Cloudinary.
- **Firebase Integration**: Utilizes Firebase Firestore for data storage and Firebase Authentication for admin access.
- **Responsive Design**: Built with Tailwind CSS to ensure a responsive and modern UI.

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Authentication
- **File Uploads**: Cloudinary
- **Build Tool**: Vite

## Security Considerations

- **Anonymous Reporting**: Ensures that student identities remain confidential.
- **Admin Access**: Restricted to authenticated users via Firebase Authentication.
- **Secure Uploads**: Uses unsigned upload presets for Cloudinary to avoid exposing API secrets.

## Known Issues and Limitations

- Ensure environment variables are correctly configured to avoid runtime errors.
- The app is optimized for modern browsers; older browser versions may not be fully supported.

## Contribution Guidelines

Contributions are welcome! Please ensure that any code changes are accompanied by appropriate tests and documentation updates.

---

This README provides an overview of the CampusShield project, its features, technical stack, and important considerations. For further details, please refer to the source code and documentation within the project.
