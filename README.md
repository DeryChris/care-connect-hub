# 🏥 Care Connect Hub

> **A Modern Healthcare Intelligence Platform Transforming HMIS into a Knowledge Management System**

[![TypeScript](https://img.shields.io/badge/TypeScript-98.6%25-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=flat-square)](https://github.com/DeryChris/care-connect-hub)

---

## 🎯 Overview

Care Connect Hub is an enterprise-grade **Healthcare Management Information System (HMIS)** evolving into a **Knowledge Management System (KMS)**. Built with modern web technologies, it enables healthcare facilities to manage patients, appointments, staff, inventory, and clinical knowledge seamlessly—all in one unified platform.

### Core Value Proposition
✅ **Unified Healthcare Operations** - Manage every aspect of your facility  
✅ **Knowledge-Driven Care** - Built-in medical protocols, guidelines & SOPs  
✅ **AI-Powered Discovery** - Smart search & intelligent recommendations  
✅ **Secure & Compliant** - Enterprise-grade security & healthcare standards  

---

## 🚀 Key Features

### 🏢 **Core Operations**
- **Patient Management** - Complete patient records, medical history, and profiles
- **Appointment System** - Scheduling, reminders, and appointment tracking
- **Staff Management** - User roles, permissions, designations, and departments
- **Department Management** - Clinical departments with staff allocation
- **Multi-User Support** - Admin, doctors, nurses, technicians, and more

### 📊 **Business Intelligence**
- **Dashboard Analytics** - Real-time statistics and KPIs
- **Task Management** - Assign, track, and complete healthcare tasks
- **Inventory Management** - Track medical supplies, equipment, and medicines
  - Stock monitoring with low-stock alerts
  - Expiry date tracking
  - Stock transactions (In/Out/Adjustment)
  - Category-based organization

### 📚 **Knowledge Management (Phase 1-3)**
- **Knowledge Base** - 50+ medical protocols and clinical guidelines
- **Global Search** - Cross-module semantic search across knowledge + patients + staff
- **Document Management** - File upload, categorization, and PDF preview
- **Wiki System** - Markdown editor with version control
- **Contribution System** - Author/Reviewer/Approver workflow for clinical content
- **AI Assistant** (Coming Soon) - Semantic search, summarization, and recommendations

### 🔐 **Security & Compliance**
- **Role-Based Access Control (RBAC)** - Granular permission management
- **Secure Authentication** - Session-based with password hashing
- **CSRF Protection** - Token-based form submissions
- **Input Validation** - Server-side validation on all forms
- **HIPAA-Ready** - Designed for healthcare compliance

---

## 💻 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type-safe development |
| **Vite** | 5.4.19 | Lightning-fast build tool |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **shadcn/ui** | Latest | High-quality UI components |
| **React Router** | 6.30.1 | Client-side routing |
| **React Hook Form** | 7.61.1 | Form management |
| **TanStack Query** | 5.83.0 | Server state management |
| **Recharts** | 2.15.4 | Data visualization |
| **Lucide React** | 0.462.0 | Icon library |
| **Radix UI** | Latest | Accessible component primitives |

### Developer Tools
- **ESLint** - Code linting & quality
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **PostCSS** - CSS processing

---

## 📁 Project Structure

```
care-connect-hub/
├── src/
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx
│   │   ├── KnowledgeBase.tsx
│   │   ├── Documents.tsx
│   │   ├── Wiki.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── LaboratoryPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── TasksPage.tsx
│   │   └── ...
│   ├── components/           # Reusable components
│   │   ├── layout/
│   │   ├── ui/
│   │   └── GlobalSearch.tsx  # Cross-module search
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── mock-knowledge.ts # 50+ medical protocols
│   └── App.tsx              # Main app router
├── public/                  # Static assets
├── index.html              # Entry point
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── tailwind.config.ts     # Tailwind config
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 16+ (recommended 18+)
- **npm** or **yarn** package manager

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/DeryChris/care-connect-hub.git
cd care-connect-hub

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173
```

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Preview production build
npm run preview

# Run linting
npm run lint

# Run tests
npm run test

# Watch mode for tests
npm run test:watch
```

---

## 📋 Project Roadmap

### Phase 1: ✅ Core Knowledge Infrastructure (Complete)
- [x] Knowledge Base Module - 50+ medical protocols
- [x] Global Search Engine - Cross-module search
- [x] Basic document organization
- [x] Knowledge article pages

### Phase 2: 🚧 Knowledge Creation & Collaboration (In Progress)
- [ ] Internal Wiki System - Markdown editor & preview
- [ ] Contribution Workflow - Author/Reviewer/Approver roles
- [ ] Article versioning & history
- [ ] Comments & discussions
- [ ] Template system for protocols

### Phase 3: 🔮 AI-Powered Discovery (Planned)
- [ ] AI Knowledge Assistant - Semantic search & chatbot
- [ ] Auto-summarization of medical content
- [ ] Smart recommendations based on user behavior
- [ ] Usage analytics dashboard
- [ ] Contribution leaderboard

---

## 🎨 Design Principles

Care Connect Hub follows modern UX/UI best practices:

- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Accessibility** - WCAG 2.1 compliant with keyboard navigation
- **Clean Architecture** - Well-organized, maintainable code structure
- **Performance** - Optimized bundle size & fast load times
- **User-Centric** - Intuitive navigation and clear visual hierarchy

---

## 🔐 Security Features

### Authentication & Authorization
- Session-based authentication
- Secure password hashing (bcrypt)
- Role-based access control (RBAC)
- Module-level permissions
- Automatic session timeout

### Data Protection
- CSRF token validation
- XSS prevention with input sanitization
- SQL injection protection (prepared statements ready)
- Secure HTTP headers
- Data validation & sanitization

---

## 📊 Core Modules

### Dashboard
- Real-time statistics & KPIs
- Recent activity feed
- Quick access shortcuts
- Personalized greeting

### Patient Management
- Complete patient profiles
- Medical history tracking
- Contact information
- Emergency contacts

### Appointments
- Schedule management
- Doctor availability
- Appointment reminders
- Calendar view

### Laboratory
- Test ordering
- Result tracking
- Report generation

### Pharmacy
- Medicine inventory
- Prescription management
- Stock control
- Supplier tracking

### Inventory Management
- Medical supplies tracking
- Equipment management
- Stock level monitoring
- Expiry date alerts
- Stock transactions

### Task Management
- Create & assign tasks
- Priority levels (Low, Medium, High, Urgent)
- Due date tracking
- Status updates
- Filter & search capabilities

### Reports & Analytics
- Custom report generation
- Data visualization
- Export functionality
- Audit trails

---

## 🤝 Contributing

We love contributions! Whether it's bug reports, feature requests, or code contributions, your input helps make Care Connect Hub better.

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Respect HIPAA compliance considerations

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**DeryChris** - Healthcare Technology Developer

- GitHub: [@DeryChris](https://github.com/DeryChris)
- Repository: [care-connect-hub](https://github.com/DeryChris/care-connect-hub)

---

## 📞 Support & Contact

For questions, bug reports, or feature requests:

- 🐛 [Report a Bug](https://github.com/DeryChris/care-connect-hub/issues)
- 💡 [Request a Feature](https://github.com/DeryChris/care-connect-hub/issues)
- 📧 Open an issue for discussions

---

## 🌟 Acknowledgments

- **React & Vite** community for excellent tooling
- **shadcn/ui** for beautiful components
- **Radix UI** for accessible primitives
- **TanStack** for state management solutions
- All contributors and supporters

---

## 🗺️ Roadmap Highlights

| Quarter | Focus | Status |
|---------|-------|--------|
| **Q1 2026** | Core HMIS Features | ✅ Complete |
| **Q2 2026** | Knowledge Management Phase 1 | ✅ Complete |
| **Q3 2026** | Wiki & Contribution System | 🚧 In Progress |
| **Q4 2026** | AI-Powered Features | 🔮 Planned |

---

## 💡 Vision

To revolutionize healthcare management by creating an integrated platform that empowers healthcare professionals with intelligent tools, centralized knowledge, and seamless operations—all while maintaining the highest standards of security, privacy, and patient care.

---

**⭐ If you find this project helpful, please star it on GitHub!**
