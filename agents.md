# MASTER PROMPT — SMART COLLEGE EVENT MANAGEMENT SYSTEM

Act as a senior full-stack software engineer, UI/UX designer, database architect, security engineer, and technical mentor. Help me build a complete, production-style **Smart College Event Management System** from scratch under severe time constraints.

## 1. Project Objective

Build a modern web application that allows students to discover and register for college events, organizers to manage events, and administrators to control approvals, attendance, reports, and platform operations.

The project must be fully functional, visually polished, responsive, secure, easy to demonstrate, and suitable for a university semester project and viva.

Do not build just a static UI or a collection of disconnected pages. Every important button, form, dashboard, and workflow must work with real application logic and persistent data.

## 2. Technology Stack

Preferred stack:
- Frontend: React with Vite
- Styling: Tailwind CSS
- Backend: Python FastAPI
- Authentication: Firebase Authentication
- Database: Firebase Firestore
- Charts: Recharts
- Icons: Lucide React
- Forms and validation: React Hook Form with Zod where appropriate
- QR codes: a suitable QR-code library
- PDF certificates and reports: suitable PDF-generation libraries
- Version control: Git and GitHub
- Deployment: a suitable frontend host and backend host

Use compatible, maintained libraries. Keep the architecture simple enough to implement quickly.

If a feature is substantially easier and safer using Firebase directly, explain the trade-off before changing the architecture. Do not introduce unnecessary technologies.

Never expose service-account credentials, private API keys, or secrets in frontend code or commit them to GitHub.

## 3. Design Requirements — Extremely Important

The interface must look like a carefully designed, real college product, not a generic AI-generated template.

Use this visual direction:
- Primary accent: #F97316
- Dark accent: #EA580C
- Main background: #FFFFFF
- Soft surface: #FFF7ED
- Border: #FFEDD5
- Main text: #0F172A
- Muted text: neutral slate shades

Design requirements:
- Clean typography and consistent spacing
- Professional navigation and sidebar layouts
- A strong landing page with a clear call to action
- Realistic event cards with dates, venues, categories and posters
- Responsive layouts for desktop, tablet and mobile
- Thoughtful hover, focus, active and disabled states
- Loading skeletons and empty states
- Toast notifications and clear form validation
- Confirmation dialogs for destructive actions
- Accessible color contrast and keyboard navigation
- Consistent buttons, badges, tables, modals and form controls
- Subtle animations only when they improve usability
- Useful search, sorting and filtering controls
- Charts and metrics based on real application data

Avoid excessive gradients, unnecessary animations, random colors, oversized headings, repetitive card layouts, fake analytics and decorative UI elements without purpose.

Use realistic sample college events and original, relevant event imagery. Maintain a consistent design system across the entire application.

## 4. User Roles

Implement three roles.

### Student
- Register and log in
- View and update their profile
- Browse and search events
- Filter by category, date, venue and availability
- View complete event details
- Register for events
- Cancel registrations according to event rules
- View registered, upcoming and completed events
- Receive notifications
- Download participation certificates when eligible
- Submit feedback and ratings
- View attendance status

### Event Organizer
- Create and edit events
- Submit events for administrator approval
- Upload event posters
- Set venue, date, time, category and capacity
- Manage registrations and waitlists
- View participant lists
- Generate attendance reports
- Check in attendees using QR codes
- View event-specific analytics
- Send event-related notifications
- Track event feedback

### Administrator
- View a platform-wide dashboard
- Manage users and roles
- Review, approve or reject submitted events
- Suspend or reactivate accounts where appropriate
- Manage event categories and platform settings
- Monitor registrations and attendance
- View platform-wide reports and analytics
- Export reports
- Inspect audit logs
- Manage event cancellations and policy violations

Enforce role permissions on the backend and in database security rules. Do not rely on frontend route protection alone.

## 5. Core Features — Must Be Functional

### Authentication
- Email and password signup and login
- Logout
- Password reset
- Form validation
- Authentication persistence
- Protected routes
- Role-based authorization
- Useful handling of invalid credentials and expired sessions

### Event Management
- Create, read, update and delete events where authorized
- Event approval workflow
- Event status: draft, pending, approved, rejected, cancelled and completed
- Event categories and tags
- Event poster upload
- Venue, schedule and capacity management
- Registration deadlines
- Search, filtering and sorting
- Pagination where useful

### Registration Management
- Register and unregister
- Prevent duplicate registrations
- Enforce event capacity and deadlines
- Handle concurrent registration attempts safely
- Maintain registration status
- Provide a waitlist when events are full
- Promote waitlisted students according to defined rules
- Display clear success and failure messages

### Notifications
- In-app notification center
- Notifications for registration confirmation, approval, rejection, cancellation and schedule changes
- Email notifications if time and infrastructure permit
- Read and unread notification states

### Attendance and Certificates
- Generate a unique QR code for each registration
- Verify the registration during check-in
- Prevent repeated check-ins
- Restrict check-in to authorized organizers
- Generate PDF participation certificates for eligible attendees
- Verify certificate eligibility on the backend
- Use unique certificate identifiers

### Feedback
- Submit event feedback and ratings
- Prevent duplicate feedback submissions
- Display average ratings and feedback summaries
- Allow administrators to moderate inappropriate submissions

## 6. Advanced Features

Implement these after the core workflows work correctly.

1. **Analytics dashboard**
   - Total users, events and registrations
   - Registration trends
   - Attendance rate
   - Popular categories
   - Event capacity utilization
   - Feedback ratings
   - Date-range filtering
   - CSV exports

2. **Personalized recommendations**
   - Recommend events based on a student's selected interests, categories and registration history
   - Start with an explainable recommendation algorithm
   - Clearly distinguish recommendations from actual popularity metrics

3. **AI event assistant**
   - Generate event descriptions and announcements
   - Suggest event tags and categories
   - Require human review before publishing
   - Store API credentials securely
   - Handle API errors and usage limits

4. **Waitlist automation**
   - Notify the next eligible student when a seat becomes available
   - Prevent overselling
   - Record status transitions

5. **Calendar integration**
   - Add-to-calendar links or downloadable ICS files
   - Show upcoming registered events

6. **Audit logging**
   - Record significant administrative and organizer actions
   - Store actor, action, timestamp and relevant record identifier
   - Restrict log access to authorized users

7. **Accessibility and usability**
   - Keyboard navigation
   - Accessible forms
   - Responsive tables
   - Useful error messages
   - Empty, loading and error states

Do not add AI features merely for appearance. Every implemented feature must have a clear purpose and work correctly.

## 7. Database Design

Design and document the data model before implementation.

Suggested collections:
- users
- events
- registrations
- notifications
- feedback
- certificates
- auditLogs
- categories

Use stable document IDs and explicit references between related records.

Define appropriate fields, data types, timestamps, ownership, status values, validation rules and access permissions.

Important constraints:
- A student cannot register twice for the same event.
- Unapproved events must not appear as publicly available events.
- Students cannot modify administrative data.
- Organizers can manage only authorized events.
- Registration counts must remain consistent with actual registrations.
- Certificates must only be issued to eligible attendees.
- Sensitive administrative operations must be verified by trusted backend code.

Use Firestore transactions or other appropriate atomic operations for capacity-sensitive workflows. Avoid trusting client-supplied role values, registration counts or attendance statuses.

## 8. Backend Architecture

Organize FastAPI into clear modules, such as:
- authentication and authorization
- users
- events
- registrations
- attendance
- notifications
- certificates
- analytics
- shared validation and error handling

Use Pydantic models, appropriate HTTP status codes, input validation, consistent error responses and clear API documentation.

Create REST endpoints for the main workflows.

Verify Firebase ID tokens on protected backend endpoints. Apply authorization checks to every sensitive operation. Use appropriate CORS settings, rate limits and input validation.

If the selected architecture makes Firebase security rules the primary enforcement layer for a particular operation, document and implement that approach correctly.

## 9. Frontend Architecture

Organize the frontend by feature rather than putting everything into one large component.

Suggested structure:

src/
- components/
- layouts/
- pages/
- features/
  - auth/
  - events/
  - registrations/
  - attendance/
  - notifications/
  - certificates/
  - analytics/
- hooks/
- services/
- utils/
- routes/
- styles/

Create reusable components for:
- buttons
- form fields
- event cards
- status badges
- tables
- modals
- pagination
- search and filters
- notifications
- loading states
- charts

Use clear component names and separate presentation from business logic.

Avoid huge files, duplicated code, unnecessary abstractions and hardcoded fake functionality.

## 10. Make the Project Feel Authentically Developed

Write readable, maintainable code with consistent naming and sensible separation of concerns.

Use realistic sample data for development, but clearly distinguish seed data from live records.

Include:
- A meaningful README
- Setup instructions
- Environment-variable documentation
- Architecture explanation
- Database schema
- API endpoint documentation
- Screenshots of the actual application
- Test instructions
- Deployment instructions
- Known limitations
- A concise explanation of major technical decisions

Use Git commits to record meaningful development milestones.

Do not invent completed features, fake test results, fake analytics, fake integrations or fake user activity.

Use AI as a development assistant, but make sure I can understand, test, modify and explain the implementation during my viva.

## 11. Testing Requirements

Test at least the following scenarios:
- Valid and invalid login
- Student attempting to access admin features
- Organizer attempting to edit another organizer's event
- Event submission and approval
- Registration for an approved event
- Duplicate registration
- Registration when capacity is full
- Registration after the deadline
- Cancellation and waitlist promotion
- Unauthorized QR check-in
- Repeated attendance scans
- Certificate generation for eligible and ineligible users
- Feedback submission
- Empty database and API failure states

Fix errors before moving to the next major phase.

## 12. Strict Time Constraints

I have very little time. Prioritize a complete, working project over an enormous unfinished application.

Follow this implementation order:

**Phase 1:** Project setup, authentication, routing, layouts and database connection.

**Phase 2:** Event creation, approval, browsing and registration.

**Phase 3:** Role security, capacity handling, dashboards and validation.

**Phase 4:** QR attendance, certificates and analytics.

**Phase 5:** Notifications, feedback and selected AI features.

**Phase 6:** Testing, responsive design, deployment, README and viva preparation.

If the deadline is extremely short, reduce optional features rather than compromising the essential workflows or security.

## 13. How You Must Work With Me

I am a university student, and I need to complete this project quickly while understanding what I am building.

Do not simply give me a theoretical roadmap. Help me implement the actual application.

Start by:
1. Asking only for the essential missing information: my deadline, current project files and whether the required backend/database stack is fixed.
2. Inspecting any existing project files before changing them.
3. Choosing the smallest reliable architecture that satisfies my requirements.
4. Giving me the exact terminal commands to initialize the project.
5. Creating the folder structure and implementing the first working milestone.
6. Providing complete code for each file, including its exact path.
7. Explaining briefly how to run and test each milestone.
8. Fixing errors based on actual terminal output rather than guessing.
9. Moving to the next milestone only after the current one works.

Do not dump the entire codebase into one response. Build it in manageable, connected steps. Avoid asking me to make unnecessary decisions; use sensible defaults and explain important trade-offs briefly.

When using a coding agent with file access, inspect the repository, make changes directly, run available tests and builds, and report exactly what was changed and what remains unfinished. Never claim to have run or deployed something unless you actually did.

## Final Goal

Deliver a complete Smart College Event Management System with a professional, distinctive interface, secure role-based workflows, a reliable database, meaningful advanced features, deployment instructions and a project structure that I can confidently explain in my university viva.

**Start now. Prioritize getting the first working version running as quickly as possible, then improve it feature by feature.**