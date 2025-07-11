# PYQ Hub - Previous Year Papers Repository System

## Overview

PYQ Hub is a full-stack web application designed for sharing and accessing previous year exam papers from various universities. The system allows users to upload, search, filter, and download academic papers in a user-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Theme Support**: Built-in dark/light theme switching

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **File Handling**: Multer for file uploads with local storage
- **Session Management**: Express sessions with PostgreSQL storage

### Design System
- **Component Library**: Radix UI primitives with custom styling
- **CSS Framework**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React icon library
- **Form Handling**: React Hook Form with Zod validation

## Key Components

### Database Schema
The application uses three main entities:
- **Users**: Authentication and user management
- **Universities**: Educational institutions with location data
- **Papers**: Academic papers with metadata (subject, year, exam type, file info)

### File Upload System
- Supports PDF and DOC file formats
- Organizes files by university in structured directories
- Implements file size limits (10MB) and type validation
- Generates unique filenames to prevent conflicts

### Search and Filter System
- Full-text search across papers by title, subject, and university
- Multi-dimensional filtering by university, year, and subject
- Real-time search with query debouncing
- Advanced filtering sidebar with checkbox-based selection

### UI Components
- Responsive design with mobile-first approach
- Modal-based file preview and upload workflows
- Grid and list view modes for paper browsing
- Toast notifications for user feedback
- Loading states and error handling


### Paper Upload Flow
1. User selects university and fills metadata form
2. File validation occurs client-side
3. FormData sent to server with multipart encoding
4. Server validates file type and creates directory structure
5. File saved to organized folder system
6. Database record created with file metadata
7. UI updates with success notification

