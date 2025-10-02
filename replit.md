# Tuition Management System

## Overview

A multi-tenant tuition management system designed for teachers to manage batches, students, and fee payments. The system supports two user roles: teachers who manage their own batches and students, and super administrators who have oversight over all teachers in the system. Students can self-register through unique QR codes or registration links, making onboarding seamless.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Design System**: Material Design principles implemented through shadcn/ui components (Radix UI primitives)
- Rationale: Provides excellent patterns for data-dense dashboard applications with clear information hierarchy
- Color scheme supports both light and dark modes with professional blue primary colors
- Responsive design with mobile-first approach using Tailwind CSS

**State Management**: TanStack Query (React Query) for server state management
- Handles data fetching, caching, and synchronization
- Optimistic updates for better user experience
- Custom query client with configured refetch behavior

**Routing**: Wouter for lightweight client-side routing
- Role-based route protection (teacher vs super admin dashboards)
- Public routes for student self-registration

**Key UI Patterns**:
- Dashboard widgets with statistics cards
- Data tables for student and batch management
- Modal dialogs for CRUD operations
- QR code generation for student registration links
- Toast notifications for user feedback

### Backend Architecture

**Framework**: Express.js with TypeScript
- RESTful API design
- Session-based authentication using express-session
- Role-based access control middleware

**Authentication & Authorization**:
- Password hashing using bcrypt (10 salt rounds)
- Session storage with configurable session secret
- Role-based middleware (`requireAuth`, `requireRole`)
- Two roles: "teacher" and "superadmin"

**API Structure**:
- `/api/auth/*` - Authentication endpoints (login, logout, session check)
- `/api/batches/*` - Batch management (CRUD operations)
- `/api/students/*` - Student management and self-registration
- `/api/teachers/*` - Teacher management (super admin only)
- `/api/payments/*` - Payment tracking
- `/api/stats/*` - Dashboard statistics

**Development Setup**: 
- Vite middleware integration for HMR in development
- Static file serving in production
- Development-only plugins (runtime error overlay, cartographer, dev banner)

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect
- Type-safe database queries
- Schema-first approach with automatic TypeScript types
- Migration support via drizzle-kit

**Database Schema**:

1. **Users Table**: Stores both teachers and super admins
   - UUID primary keys
   - Username/password authentication
   - Role field for access control
   - Active/inactive status flag
   - Contact information (email, phone)

2. **Batches Table**: Class/course groupings managed by teachers
   - References users table (teacher_id)
   - Fee structure (amount and period: month/year)
   - Unique registration token for student self-registration
   - Cascade delete when teacher is removed

3. **Students Table**: Student records
   - References batches table (batch_id)
   - Contact details and standard/class information
   - Join date tracking
   - Cascade delete when batch is removed

4. **Payments Table**: Fee payment tracking
   - References students table (student_id)
   - Amount and timestamp
   - Cascade delete when student is removed

**Data Relationships**:
- One teacher → Many batches
- One batch → Many students
- One student → Many payments

### External Dependencies

**Database Provider**: Neon (PostgreSQL serverless)
- WebSocket connection support for serverless environments
- Connection pooling via @neondatabase/serverless

**UI Component Libraries**:
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- qrcode.react for QR code generation

**Form Management**:
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

**Session Management**:
- express-session for server-side session handling
- connect-pg-simple for PostgreSQL session store (optional)

**Development Tools**:
- Replit-specific plugins for enhanced development experience
- TypeScript for type safety across the stack
- ESBuild for production server bundling

**Key Design Decisions**:

1. **Session-based Auth vs JWT**: Session-based chosen for simpler server-side state management and easier invalidation
2. **Multi-tenant via Role Field**: Single database with role-based filtering rather than separate databases per tenant
3. **Self-Registration Flow**: Unique tokens per batch allow students to register without teacher intervention
4. **Cascade Deletes**: Database-level cascade ensures data integrity when removing teachers or batches
5. **Material Design**: Chosen for data-density and established patterns for dashboard applications