# Project Report: Digital Complaint & Grievance Management System

## 1. Project Overview
The Digital Complaint & Grievance Management System is a centralized, responsive web platform designed to streamline the grievance redressal process. It enables citizens to seamlessly register complaints, track their status in real-time, and interact with relevant departments. Concurrently, it empowers authorities and organizations to manage complaints efficiently through role-based dashboards, automated escalation workflows, and actionable analytics.

**Collaborating Organization**: Unified Mentor  
**Reference Models**: Consumer Forum, E-Consumer Grievance Portals (CPGRAMS style)

## 2. Problem Statement
Traditional grievance handling processes often suffer from:
- Manual complaint registration and tracking leading to inefficiencies.
- Lack of transparency and real-time updates for complainants.
- Absence of defined Service Level Agreement (SLA) escalation mechanisms.
- Poor accountability and disjointed reporting.
- Limited data insights for effective decision-making.

## 3. Key Objectives
- To provide a unified, accessible digital platform for grievance registration and tracking.
- To establish distinct, role-based workflows for Citizens, Officers, and Administrators.
- To enforce automated SLA tracking to ensure timely resolution of complaints.
- To offer an intuitive, government-portal-style aesthetic that builds trust and ease of use.
- To equip administrators with data-driven charts and performance metrics.

## 4. Technology Stack
The application is built using a modern, lightweight, frontend-focused technology stack:
- **Core Structure**: HTML5
- **Styling**: Vanilla CSS3 (Custom Government Portal Aesthetics, fully responsive grid and flexbox layouts)
- **Logic & State Management**: Vanilla JavaScript (ES6+), utilizing `localStorage` for client-side persistence and state management
- **Data Visualization**: Chart.js (Loaded via CDN with graceful fallback safety checks)
- **Deployment**: Render Web Services integration (Express.js backend for static delivery)
- **Version Control**: Git & GitHub

## 5. System Features & Modules

### 5.1. Citizen Dashboard
- **Grievance Registration**: Intuitive form to submit complaints across categories (Utilities, Infrastructure, Sanitation, Public Safety) with mock file attachment support.
- **My Complaints**: A list view allowing citizens to track the real-time status of their submitted tickets.
- **Quick Links**: Interactive category shortcut cards that intelligently prepopulate forms for rapid data entry.

### 5.2. Officer Dashboard
- **Ticket Management**: Interface to view assigned complaints, update statuses (In Progress, Resolved, Closed), and add internal resolution notes.
- **Deadline Tracking**: Visibility into SLA deadlines to prioritize urgent matters.

### 5.3. Administrator Dashboard
- **Summary & Analytics**: Interactive Chart.js graphs providing insights into complaints by category, status distribution, and SLA breaches.
- **SLA Settings & Simulation**: A robust "Time Travel" simulation panel to test SLA breaches and auto-escalations by fast-forwarding system time (+1, +3, +7 days).
- **All Registry List**: Master view of all grievances in the system for complete oversight and audit trails.

## 6. UI/UX Design Approach
The user interface was purposefully designed to reflect an official, trustworthy government portal:
- **Aesthetic**: Clean, light theme with solid white card layouts, distinct borders, and deep navy headers.
- **Branding**: Tri-color header ribbons, official government emblems, banner widgets, and active notice marquees.
- **Accessibility**: High-contrast text, clear modern typography, and W3C utility links.
- **Interactivity**: Smooth DOM swapping between views to create a fluid Single Page Application (SPA) experience without page reloads.

## 7. Project Links
- **GitHub Repository**: https://github.com/SimranSwain123/Digital-Complaint
- **Live Deployment**: https://digital-complaint.onrender.com

## 8. Conclusion
The Digital Complaint & Grievance Management System successfully modernizes the traditional complaint workflow. By leveraging a responsive, single-page application architecture with robust client-side state management, the platform ensures transparency, accountability, and efficiency in public grievance redressal.
