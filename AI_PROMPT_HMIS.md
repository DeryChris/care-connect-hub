
Build a **Health Management Information System (HMIS)** web application using **PHP**, **CSS**,.... Use a modern, clean web UI with the exact color palette below. You may use a minimal PHP framework (e.g. Laravel) or plain PHP with a router; keep the stack simple. Prefer **vanilla CSS** (or one lightweight utility set) — no heavy JS frameworks required except for simple interactivity (e.g. modals, dropdowns).

### Technology Stack & Constraints
    Backend: Pure PHP 8.2+ (no frameworks). Use MySQLi or PDO for database (with prepared statements).

    Database: PostgreSQL.

    Frontend: HTML5, CSS3, vanilla JavaScript (minimal), Bootstrap 5.3, Font Awesome 6 (free version) for icons.

    No external PHP libraries except those bundled with PHP (e.g., no Composer packages). Exception: you may include a simple routing helper, but it must be custom code.
---

## Color palette (required)

Use these colors consistently across the app. Derive borders, hover states, and accents from them.

| Color           | Hex       | Use for                                              |
|-----------------|-----------|------------------------------------------------------|
| **Mint light**  | `#D8EFD3` | Sidebar, cards, light backgrounds, success states    |
| **Mint medium** | `#95D2B3` | Buttons, links, primary actions, nav highlights      |
| **Teal**        | `#55AD9B` | Headers, strong accents, active states, key headings |
| **Cream**       | `#F1F8E8` | Page background, form backgrounds, subtle contrast   |

-
Suggestions:
- Use **#F1F8E8** for main page background and card insides.
- Use **#95D2B3** for primary buttons and active nav items.
- Use **#55AD9B** for logos, important labels, and table headers.
- Use **#D8EFD3** for sidebar, stat cards, and success messages.
- Use dark gray/black for body text (e.g. `#1a1f2e`) and a softer gray for secondary text (e.g. `#6b7280`).
- Use a darker shade of teal or red only for destructive actions (e.g. delete).

## User Interface & Experience
- Layout: Left sidebar with navigation (collapsible on mobile), main content area. Sidebar highlights current module.
- Responsive: Must work on mobile, tablet, desktop.
- Forms: Use Bootstrap form controls with validation feedback (server-side validation messages displayed inline).
- Tables: Use table table-striped table-hover with pagination controls.
- Icons: Font Awesome 6 (free) for all actions (add, edit, delete, view).
- Modals: Use Bootstrap modals for delete confirmations and possibly for quick add/edit forms where appropriate (e.g., departments can be managed via modals on the list page).


---

## Core features to implement

### 1. Authentication
- **Login** and **logout** (session-based).
- **Register** (optional: can be disabled so only admins create users).
- **Password reset** (forgot password flow).
- After login, redirect to a **dashboard** (`/home` or `/dashboard`).
- If not logged in and visiting any protected page, redirect to login.
- Root URL `/` redirects to login when guest, or to dashboard when logged in.

### 2. Users (admin only)
- Only users with **role = admin** can access user management.
- **List users** with filters: search (name, email), filter by designation, filter by status (active/inactive). Paginate (e.g. 15 per page).
- **Add user:** name, email, password, designation (dropdown), phone, optional “active” checkbox. If designation is **Doctor**, also show: department (dropdown), specialization, consultation fee, qualification.
- **Edit user:** same fields; password optional (leave blank to keep). Toggle active/inactive.
- **Delete user:** with confirmation; prevent user from deleting themselves.
- **Toggle status:** one-click activate/deactivate without opening edit.
- **Designations:** doctor, nurse, receptionist, lab_technician, radiologist, pharmacist, accountant, hr_officer, data_entry, it_staff, admin_staff, employee.
- **Module permissions:** list of modules (e.g. General, Registration, Appointment, Laboratory, Radiology, Pharmacy, IPD, OPD, Billing, HR, Reports, Tasks, Inventory, IT). Each user (non-admin) has a set of checked modules they can access. Admins have access to all.
- Store in DB: role (admin/user), designation, permissions (JSON array of module keys), phone, is_active, and for doctors: department_id, specialization, qualification, fee, timings (JSON optional).

### 3. Departments (clinical)
- **List departments:** name, description, staff/doctor count, active/inactive, actions.
- **Add department:** name, optional description.
- **Edit department:** name, description, active checkbox.
- **Delete department:** only if no users are linked to it; otherwise show error.
- Departments are used in the **Users** form when designation is Doctor (dropdown).

### 4. Tasks
- Any logged-in user can access task management. **Non-admins** see only tasks where they are **assigned to** or **assigned by**; admins see all.
- **List tasks:** columns — title, description snippet, module, priority, assignee, due date, status, actions. Filters: search by title, filter by status, priority, module. Order by status (e.g. in progress → pending → completed → cancelled) then by priority.
- **Add task:** title, description (optional), module (dropdown from config), priority (low, medium, high, urgent), optional assignee (user dropdown), optional due date. On create, set status = pending and assigned_by = current user.
- **Edit task:** same fields plus status (pending, in progress, completed, cancelled).
- **Quick status change:** dropdown in the list row that updates status via POST without opening edit.
- **Delete task** with confirmation.
- **Modules** for tasks: same list as in user permissions (e.g. general, registration, appointment, laboratory, etc.) — use a config/array with at least `label` (and optionally icon, color) for dropdown display.

### 5. Inventory
- **List items:** name, category, current stock, min quantity, unit price, supplier, expiry date, actions. Show a simple “stock level” indicator (e.g. bar or color: low when quantity ≤ min_quantity).
- **Filters:** search by name, filter by category, filter by stock (low / in stock).
- **Stats at top:** total items, low-stock count, total value (sum of quantity × unit_price), count of items expiring in next 30 days.
- **Add item:** name, category, unit (pcs, box, bottle, etc.), min quantity, unit price, optional supplier, location, expiry date, barcode, notes. Optionally allow “initial quantity” and create an “in” transaction on create.
- **Edit item:** update the same fields (no direct quantity edit here; use transactions).
- **Stock transactions:** from the list or item detail, allow “Stock In”, “Stock Out”, and “Adjustment”. Each has quantity, optional reference, notes. For “out”, check sufficient stock; for “adjustment” treat quantity as the new total. Record each transaction (item, type, quantity, unit_price, reference, notes, created_by, timestamp).
- **Categories:** e.g. Medicine, Equipment, Surgical Supply, Consumable, Lab Reagent, Linen, Stationery, Other.

### 6. Dashboard (home)
- **Greeting:** “Good Morning/Afternoon/Evening, [First Name]” and current date.
- **Stat cards:** at least 4 (e.g. Total Patients, Today’s Appointments, In-Patients, Revenue). Prefer **real data** from the database where possible (e.g. user count, task counts, inventory value); if some entities don’t exist yet, use sensible placeholders and label them clearly.
- **Recent activity:** list of recent events (e.g. new user, new task, stock transaction). Use real data from DB if available.
- **Charts (optional but nice):** e.g. bar chart for monthly visits or task completion, simple donut for distribution. Use a lightweight library or SVG/CSS; keep it simple.
- **Quick links** to main sections (Users, Tasks, Inventory, Departments) and, for admins, User Management.

### 7. Layout and navigation
- **Sidebar (fixed):** logo/title “HMIS”, then: Dashboard, Patients (placeholder), Appointments (placeholder), IPD/OPD (placeholders), Doctors & Staff (link to users filtered by doctor), Departments, Laboratory / Radiology / Pharmacy (placeholders), Billing / Reports (placeholders), Task Management, Inventory, and — only for admins — User Management, Settings (placeholder).
- **Top bar:** breadcrumb (e.g. “Dashboard” or current page), optional search/notifications, theme toggle (light/dark optional), current time, user menu (name, logout).
- **Footer:** app name, version, optional links (Support, Privacy, Terms).
- Use the **cream #F1F8E8** for main content area and **mint #D8EFD3** for sidebar when using the palette. Buttons and links use **#95D2B3** / **#55AD9B** as specified.

### 8. Database schema (minimum)
- Provide a schema.sql file with all tables, foreign keys, and indexes. Include at least one admin user (password hashed) for testing.

- **users:** id, name, email, email_verified_at, password, remember_token, role (admin/user), designation, permissions (JSON), phone, is_active, department_id (nullable FK), specialization, qualification, fee, timings (JSON), created_at, updated_at.
- **departments:** id, name, description (nullable), is_active, created_at, updated_at.
- **tasks:** id, title, description, module, priority, status, due_date (nullable), assigned_to (nullable FK users), assigned_by (nullable FK users), created_at, updated_at.
- **inventory_items:** id, name, category, unit, quantity, min_quantity, unit_price, supplier, location, expiry_date, barcode, notes, is_active, created_at, updated_at.
- **inventory_transactions:** id, inventory_item_id (FK), type (in/out/adjustment), quantity, unit_price, reference, notes, created_by (nullable FK users), created_at, updated_at.
- Standard **sessions** and **password_reset_tokens** (or equivalent) for auth.

Use foreign keys and indexes where appropriate; nullable FKs for optional assignee/creator.

---

## Technical constraints

- **Backend:** PHP (version 8.0+). You may use Composer and a minimal framework (e.g. Laravel, Slim) or plain PHP with a simple router and PDO.
- **Frontend:** HTML + **CSS**. Prefer vanilla CSS with the given palette; avoid large CSS frameworks unless necessary. Use semantic HTML and responsive layout (sidebar can collapse to a menu on small screens).
- **JavaScript:** Only where needed (e.g. modal open/close, dropdowns, form validation, chart rendering). No requirement for React/Vue/Angular.
- **Security:** Hash passwords (e.g. bcrypt); use CSRF tokens on forms; validate and sanitize input; enforce admin-only access for user management and scope task list for non-admins.

---

## Project Structure & File Generation
Generate the following files with their complete content. Use consistent naming and follow PSR-1/PSR-2 coding style (where applicable).

├── config/
│   └── database.php          # DB connection (singleton pattern)
├── controllers/
│   ├── AuthController.php     # login, logout, auth checks
│   ├── UserController.php     # CRUD for users
│   ├── DepartmentController.php
│   ├── InventoryController.php
│   └── TaskController.php
├── models/
│   ├── User.php               # Model class with DB methods
│   ├── Department.php
│   ├── InventoryItem.php
│   ├── InventoryTransaction.php
│   └── Task.php
├── public/
│   ├── index.php              # Router (entry point)
│   ├── .htaccess              # Rewrite rules for clean URLs
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css      # Custom overrides
│   │   └── js/
│   │       └── script.js      # Custom JS (e.g., confirm deletes, AJAX if needed)
├── views/
│   ├── layouts/
│   │   ├── header.php         # <head>, navbar, sidebar start
│   │   └── footer.php         # closing tags, scripts
│   ├── auth/
│   │   └── login.php
│   ├── dashboard.php
│   ├── users/
│   │   ├── index.php          # list with pagination/search
│   │   ├── create.php
│   │   └── edit.php
│   ├── departments/
│   │   └── index.php          # list (CRUD via modals or separate pages)
│   ├── inventory/
│   │   ├── index.php          # list with search/filter
│   │   ├── create.php
│   │   ├── edit.php
│   │   └── low_stock.php      # low stock view
│   └── tasks/
│       ├── index.php          # filterable list
│       ├── create.php
│       └── edit.php
├── helpers/
│   ├── auth.php               # isAuthenticated(), isAdmin(), requireLogin(), etc.
│   ├── validation.php         # input validation functions
│   └── csrf.php               # generate and verify CSRF tokens
└── sql/
    └── schema.sql             # complete database dump with CREATE TABLE statements and optional test data

- You can add files or directories that you think are needed to the structure.
---

## Security:
- SQL Injection: Always use prepared statements (MySQLi or PDO).
- XSS: Escape all output with htmlspecialchars().
- CSRF: Include a hidden token in every POST form; validate on submission.
- Password Hashing: Use password_hash() and password_verify().
- Session Security: Regenerate session ID after login; set proper session cookie parameters (HttpOnly, Secure in production).
- File Permissions: No direct access to PHP files outside public folder (place .htaccess restrictions or configure server accordingly).

---
## Improvements over a “bare” clone

Where possible, prefer:
- **Real dashboard data** (counts, recent activities from DB) instead of hardcoded numbers.
- **Eager loading** (e.g. load user’s department with user list) to avoid N+1 queries.
- **Validation** on every form (required fields, email format, unique email, numeric fee/quantity, etc.).
- **Clear error and success messages** after create/update/delete/toggle.
- **Consistent naming:** same route and naming conventions (e.g. `users.index`, `tasks.store`).
- Optional: **role/permission checks** so that “module permissions” on users actually restrict access to Tasks, Inventory, etc. for non-admins.

---

## Deliverables

1. A working web app that runs on a standard PHP stack (e.g. `php -S` or Apache/Nginx with PHP).
2. Instructions to set up the database (migrations or SQL dump) and config (DB credentials, app URL).
3. At least one admin user (or seeder) so the app can be used immediately after setup.
4. UI that consistently uses the four colors **#D8EFD3**, **#95D2B3**, **#55AD9B**, **#F1F8E8** for a modern, cohesive look.
5. All code files listed above, with clear file path headings (e.g., ### /hmis/config/database.php).
6. The complete SQL schema (with sample data).
7. gAny additional notes on usage or assumptions.

This should be  ready to implement project.
The code should be well-commented, especially for complex logic.

---

## Evaluation Criteria
- Completeness: All modules and features are implemented.
- Security: Proper handling of passwords, SQL, XSS, CSRF.
- Code Quality: Organized, readable, follows best practices.
- UI/UX: Clean, responsive, intuitive.
- Functionality: All CRUD operations work, filters/pagination function correctly, roles are enforced.

---

Start generating the application now. Provide the code in a structured, easy-to-follow manner.
NB: create a folder and put all other .md files that you create in there.