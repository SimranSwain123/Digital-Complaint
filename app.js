// State Management for Digital Complaint & Grievance Management System

const DEFAULT_SLA_SETTINGS = {
    "Utilities": 2,      // 2 days
    "Infrastructure": 5, // 5 days
    "Sanitation": 1,     // 1 day
    "Public Safety": 3,  // 3 days
    "Admin Services": 4  // 4 days
};

const DEFAULT_OFFICERS = {
    "Utilities": "David Miller",
    "Infrastructure": "Sarah Jenkins",
    "Sanitation": "Robert Chen",
    "Public Safety": "Marcus Aurelius",
    "Admin Services": "Emily Watson"
};

const ESCALATION_OFFICERS = {
    "Utilities": "Utilities Supervisor",
    "Infrastructure": "Infrastructure Supervisor",
    "Sanitation": "Sanitation Supervisor",
    "Public Safety": "Chief Safety Supervisor",
    "Admin Services": "Chief Admin Supervisor"
};

// Initial state data if localStorage is empty
const INITIAL_COMPLAINTS = [
    {
        id: "GRV-2026-1001",
        category: "Utilities",
        subcategory: "Water Supply Leakage",
        description: "Main water pipeline has burst near Street 14, causing severe flooding in the local park and drop in water pressure for households.",
        location: "Sector 4, Green Park Road",
        submissionDate: "2026-07-16T10:00:00.000Z", // 2 days before current local time
        status: "Submitted",
        assignedOfficer: "David Miller",
        slaDays: 2,
        slaBreached: false,
        timeline: [
            {
                date: "2026-07-16T10:00:00.000Z",
                title: "Complaint Registered",
                description: "Complaint successfully filed online. Auto-assigned to Utilities department.",
                actor: "Citizen (System)"
            }
        ],
        attachments: [{ name: "pipe_leakage.jpg", size: "2.4 MB" }],
        feedback: null
    },
    {
        id: "GRV-2026-1002",
        category: "Infrastructure",
        subcategory: "Pothole Damage",
        description: "A large pothole has opened up in the middle of the highway. Several vehicles have sustained tire damages over the past 24 hours.",
        location: "NH-48 highway, near Exit 12",
        submissionDate: "2026-07-14T08:30:00.000Z", // 4 days ago
        status: "In Progress",
        assignedOfficer: "Sarah Jenkins",
        slaDays: 5,
        slaBreached: false,
        timeline: [
            {
                date: "2026-07-14T08:30:00.000Z",
                title: "Complaint Registered",
                description: "Complaint filed and assigned to Infrastructure.",
                actor: "Citizen (System)"
            },
            {
                date: "2026-07-14T14:15:00.000Z",
                title: "Review Completed",
                description: "Complaint reviewed and moved to In-Progress stage. Repair crew scheduled.",
                actor: "Sarah Jenkins (Officer)"
            }
        ],
        attachments: [{ name: "pothole_road.png", size: "3.1 MB" }],
        feedback: null
    },
    {
        id: "GRV-2026-1003",
        category: "Sanitation",
        subcategory: "Garbage Overflow",
        description: "Public garbage bins are overflowing and have not been cleared for over a week. The smell is unbearable and stray animals are spreading trash.",
        location: "Block C Market, behind Plaza",
        submissionDate: "2026-07-12T09:00:00.000Z", // 6 days ago
        status: "Resolved",
        assignedOfficer: "Robert Chen",
        slaDays: 1,
        slaBreached: true, // Registered on 12th, resolved on 14th (took 2 days, SLA was 1 day)
        timeline: [
            {
                date: "2026-07-12T09:00:00.000Z",
                title: "Complaint Registered",
                description: "Complaint filed and assigned to Sanitation.",
                actor: "Citizen (System)"
            },
            {
                date: "2026-07-13T10:00:00.000Z",
                title: "Auto-Escalated",
                description: "SLA of 1 day breached. Complaint escalated to Sanitation Supervisor.",
                actor: "SLA Monitor Engine"
            },
            {
                date: "2026-07-14T11:00:00.000Z",
                title: "Resolved",
                description: "Clean up team deployed. All overflow garbage cleared, and area sanitized.",
                actor: "Sanitation Supervisor"
            }
        ],
        attachments: [],
        feedback: {
            rating: 4,
            comments: "Took longer than expected, but the cleaning job was thorough."
        }
    },
    {
        id: "GRV-2026-1004",
        category: "Public Safety",
        subcategory: "Broken Streetlight",
        description: "Entire stretch of streetlights is out from house 50 to 90. The area is pitch dark at night, making it unsafe for residents to walk.",
        location: "Oakwood Avenue, Phase 2",
        submissionDate: "2026-07-17T21:10:00.000Z", // 1 day ago
        status: "Under Review",
        assignedOfficer: "Marcus Aurelius",
        slaDays: 3,
        slaBreached: false,
        timeline: [
            {
                date: "2026-07-17T21:10:00.000Z",
                title: "Complaint Registered",
                description: "Complaint registered. Auto-assigned to Public Safety.",
                actor: "Citizen (System)"
            },
            {
                date: "2026-07-18T09:00:00.000Z",
                title: "Under Investigation",
                description: "Officer checking electrical lines and circuit breaker issues.",
                actor: "Marcus Aurelius (Officer)"
            }
        ],
        attachments: [],
        feedback: null
    },
    {
        id: "GRV-2026-1005",
        category: "Utilities",
        subcategory: "Voltage Fluctuations",
        description: "Severe voltage fluctuations are occurring, leading to household appliances like refrigerators and AC units failing.",
        location: "Sunrise Apartments, Sector 15",
        submissionDate: "2026-07-15T15:00:00.000Z", // 3 days ago
        status: "Escalated",
        assignedOfficer: "Utilities Supervisor",
        slaDays: 2, // breached SLA of 2 days
        slaBreached: true,
        timeline: [
            {
                date: "2026-07-15T15:00:00.000Z",
                title: "Complaint Registered",
                description: "Complaint filed and assigned to Utilities.",
                actor: "Citizen (System)"
            },
            {
                date: "2026-07-17T15:00:00.000Z",
                title: "Auto-Escalated",
                description: "SLA of 2 days breached. Re-assigned to Utilities Supervisor.",
                actor: "SLA Monitor Engine"
            }
        ],
        attachments: [],
        feedback: null
    }
];

class StateManager {
    constructor() {
        this.complaints = [];
        this.slaSettings = {};
        this.currentUser = {
            role: "Citizen",
            name: "John Doe",
            department: "None",
            avatar: "JD"
        };
        // Set initial virtual system time equal to user's local time (or static base 2026-07-18T20:09:18)
        this.systemTime = new Date("2026-07-18T20:09:18+05:30");
        this.load();
    }

    load() {
        try {
            const savedComplaints = localStorage.getItem("griv_complaints");
            const savedSLAs = localStorage.getItem("griv_sla_settings");
            const savedTime = localStorage.getItem("griv_system_time");
            const savedUser = localStorage.getItem("griv_current_user");

            if (savedComplaints) {
                this.complaints = JSON.parse(savedComplaints);
            } else {
                this.complaints = [...INITIAL_COMPLAINTS];
                this.saveComplaints();
            }

            if (savedSLAs) {
                this.slaSettings = JSON.parse(savedSLAs);
            } else {
                this.slaSettings = { ...DEFAULT_SLA_SETTINGS };
                this.saveSLAs();
            }

            if (savedTime) {
                this.systemTime = new Date(savedTime);
            } else {
                this.saveSystemTime();
            }

            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            } else {
                this.saveUser();
            }
        } catch (e) {
            console.error("Failed to load local state. Resetting to defaults.", e);
            this.complaints = [...INITIAL_COMPLAINTS];
            this.slaSettings = { ...DEFAULT_SLA_SETTINGS };
            this.systemTime = new Date("2026-07-18T20:09:18+05:30");
        }
    }

    saveComplaints() {
        localStorage.setItem("griv_complaints", JSON.stringify(this.complaints));
    }

    saveSLAs() {
        localStorage.setItem("griv_sla_settings", JSON.stringify(this.slaSettings));
    }

    saveSystemTime() {
        localStorage.setItem("griv_system_time", this.systemTime.toISOString());
    }

    saveUser() {
        localStorage.setItem("griv_current_user", JSON.stringify(this.currentUser));
    }

    saveAll() {
        this.saveComplaints();
        this.saveSLAs();
        this.saveSystemTime();
        this.saveUser();
    }

    // Citizen files a new complaint
    addComplaint(category, subcategory, location, description, files) {
        const id = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const slaDays = this.slaSettings[category] || 3;
        const submissionDate = this.systemTime.toISOString();
        const assignedOfficer = DEFAULT_OFFICERS[category] || "General Desk";

        const newComplaint = {
            id,
            category,
            subcategory,
            description,
            location,
            submissionDate,
            status: "Submitted",
            assignedOfficer,
            slaDays,
            slaBreached: false,
            timeline: [
                {
                    date: submissionDate,
                    title: "Complaint Registered",
                    description: `Complaint successfully registered under ${category}. Auto-assigned to officer ${assignedOfficer}.`,
                    actor: "Citizen (System)"
                }
            ],
            attachments: files || [],
            feedback: null
        };

        this.complaints.unshift(newComplaint);
        this.saveComplaints();
        return newComplaint;
    }

    // Update status from officer/admin dashboard
    updateStatus(id, newStatus, remarks) {
        const complaint = this.complaints.find(c => c.id === id);
        if (!complaint) return null;

        const updateTime = this.systemTime.toISOString();
        complaint.status = newStatus;
        
        // SLA flag checked at time of action
        const durationMs = this.systemTime - new Date(complaint.submissionDate);
        const maxDurationMs = complaint.slaDays * 24 * 60 * 60 * 1000;
        if (durationMs > maxDurationMs) {
            complaint.slaBreached = true;
        }

        complaint.timeline.push({
            date: updateTime,
            title: `Status Updated to ${newStatus}`,
            description: remarks || `Status changed to ${newStatus}.`,
            actor: `${this.currentUser.name} (${this.currentUser.role})`
        });

        this.saveComplaints();
        return complaint;
    }

    // Submit citizen rating feedback
    submitFeedback(id, rating, comments) {
        const complaint = this.complaints.find(c => c.id === id);
        if (!complaint) return null;

        complaint.feedback = {
            rating: parseInt(rating),
            comments: comments || ""
        };

        complaint.timeline.push({
            date: this.systemTime.toISOString(),
            title: "Feedback Provided",
            description: `Citizen rated the resolution ${rating} out of 5 stars.`,
            actor: "Citizen"
        });

        this.saveComplaints();
        return complaint;
    }

    // Adjust SLA rules
    updateSLASetting(category, days) {
        if (this.slaSettings[category] !== undefined) {
            this.slaSettings[category] = parseInt(days);
            this.saveSLAs();
            return true;
        }
        return false;
    }

    // SLA Evaluation Engine
    checkSLAEscalations() {
        let escalatedCount = 0;
        const checkTime = this.systemTime;

        this.complaints.forEach(complaint => {
            // Check only active non-resolved, non-escalated tickets
            if (complaint.status !== "Resolved" && complaint.status !== "Escalated") {
                const submissionDate = new Date(complaint.submissionDate);
                const slaMs = complaint.slaDays * 24 * 60 * 60 * 1000;
                
                if (checkTime - submissionDate > slaMs) {
                    // Breached! Auto escalate
                    complaint.status = "Escalated";
                    complaint.slaBreached = true;
                    
                    const oldOfficer = complaint.assignedOfficer;
                    const newOfficer = ESCALATION_OFFICERS[complaint.category] || "Chief System Supervisor";
                    complaint.assignedOfficer = newOfficer;
                    
                    complaint.timeline.push({
                        date: checkTime.toISOString(),
                        title: "Auto-Escalated",
                        description: `SLA of ${complaint.slaDays} day(s) breached. Ticket reassigned from ${oldOfficer} to ${newOfficer}.`,
                        actor: "SLA Monitor Engine"
                    });
                    
                    escalatedCount++;
                }
            }
        });

        if (escalatedCount > 0) {
            this.saveComplaints();
        }
        return escalatedCount;
    }

    // Time Travel Mechanism
    fastForward(days) {
        // Move virtual time forward
        const originalTime = new Date(this.systemTime);
        this.systemTime.setDate(this.systemTime.getDate() + days);
        this.saveSystemTime();
        
        // Execute SLA engine checks
        const escalated = this.checkSLAEscalations();
        return {
            originalTime,
            newTime: this.systemTime,
            escalated
        };
    }
}

// Instantiate state manager
const appState = new StateManager();

// Visual Toast System
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Auto-remove toast after 4s
    const removeTimer = setTimeout(() => {
        toast.style.animation = "slideIn 0.3s reverse forwards";
        toast.addEventListener("animationend", () => toast.remove());
    }, 4000);

    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(removeTimer);
        toast.remove();
    });
}

// Chart Global References
let categoryChart = null;
let complianceChart = null;

// Initialize Analytics Charts (Chart.js wrapper)
function renderAnalyticsCharts() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js library is not loaded. Skipping chart rendering.");
        return;
    }
    const categoryCtx = document.getElementById("chart-category");
    const complianceCtx = document.getElementById("chart-compliance");

    if (!categoryCtx || !complianceCtx) return;

    // Process State data for Charts
    const complaints = appState.complaints;
    
    // 1. Complaints by Category
    const catCounts = {};
    complaints.forEach(c => {
        catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    });

    const categories = Object.keys(catCounts);
    const categoryData = Object.values(catCounts);

    // Destroy existing charts to prevent canvas re-use errors
    if (categoryChart) categoryChart.destroy();
    if (complianceChart) complianceChart.destroy();

    // Theme values matching CSS variables
    const purpleGlow = "#6366f1";
    const cyanGlow = "#06b6d4";
    const greenGlow = "#10b981";
    const amberGlow = "#f59e0b";
    const redGlow = "#ef4444";
    
    categoryChart = new Chart(categoryCtx, {
        type: "doughnut",
        data: {
            labels: categories,
            datasets: [{
                data: categoryData,
                backgroundColor: [purpleGlow, cyanGlow, greenGlow, amberGlow, "#8b5cf6"],
                borderColor: "#1e293b",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#94a3b8", font: { family: "Plus Jakarta Sans" } }
                }
            }
        }
    });

    // 2. SLA Compliance Metrics
    let compliant = 0;
    let breached = 0;
    complaints.forEach(c => {
        if (c.slaBreached) breached++;
        else compliant++;
    });

    complianceChart = new Chart(complianceCtx, {
        type: "bar",
        data: {
            labels: ["SLA Compliant", "SLA Breached"],
            datasets: [{
                label: "Complaints Count",
                data: [compliant, breached],
                backgroundColor: [greenGlow, redGlow],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8", font: { family: "Plus Jakarta Sans" } }
                },
                y: {
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { color: "#94a3b8", font: { family: "Plus Jakarta Sans" }, stepSize: 1 }
                }
            }
        }
    });
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Calculate remaining time for SLA
function getSLARemainingLabel(complaint) {
    if (complaint.status === "Resolved") {
        return complaint.slaBreached 
            ? `<span class="badge badge-sla-breached">SLA Breached (Resolved Late)</span>`
            : `<span class="badge badge-sla-ok">Resolved within SLA</span>`;
    }

    const submissionDate = new Date(complaint.submissionDate);
    const deadline = new Date(submissionDate.getTime() + complaint.slaDays * 24 * 60 * 60 * 1000);
    const diffMs = deadline - appState.systemTime;
    
    if (diffMs < 0) {
        return `<span class="badge badge-sla-breached">SLA Breached</span>`;
    }

    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours <= 24) {
        return `<span class="badge badge-sla-warning">Breaches in ${diffHours} hr(s)</span>`;
    }

    const diffDays = Math.ceil(diffHours / 24);
    return `<span class="badge badge-sla-ok">${diffDays} day(s) remaining</span>`;
}

// Get Badge class based on complaint status
function getStatusBadgeHTML(status) {
    switch (status) {
        case "Submitted":
            return `<span class="badge badge-submitted">Submitted</span>`;
        case "Under Review":
            return `<span class="badge badge-review">Under Review</span>`;
        case "In Progress":
            return `<span class="badge badge-progress">In Progress</span>`;
        case "Resolved":
            return `<span class="badge badge-resolved">Resolved</span>`;
        case "Escalated":
            return `<span class="badge badge-escalated">Escalated</span>`;
        default:
            return `<span class="badge">${status}</span>`;
    }
}

// Render dynamic components based on the active role
function renderUI() {
    // 1. Update Header Info
    const systemTimeEl = document.getElementById("system-time-display");
    if (systemTimeEl) {
        systemTimeEl.textContent = formatDate(appState.systemTime);
    }

    // Role Indicator
    const userRoleNameEl = document.getElementById("user-role-name");
    const userRoleAvatarEl = document.getElementById("user-role-avatar");
    const userRoleDeptEl = document.getElementById("user-role-dept");

    if (userRoleNameEl) userRoleNameEl.textContent = appState.currentUser.name;
    if (userRoleAvatarEl) userRoleAvatarEl.textContent = appState.currentUser.avatar;
    if (userRoleDeptEl) userRoleDeptEl.textContent = appState.currentUser.department;

    // Show/hide sidebar navigation sections depending on active role
    const navCitizen = document.getElementById("nav-citizen-group");
    const navAdmin = document.getElementById("nav-admin-group");
    
    if (navCitizen) {
        navCitizen.style.display = (appState.currentUser.role === "Citizen") ? "block" : "none";
    }
    if (navAdmin) {
        navAdmin.style.display = (appState.currentUser.role === "Admin") ? "block" : "none";
    }

    // Render Stats counters
    renderQuickStats();

    // 2. Render Dashboards based on active page
    const citizenPanel = document.getElementById("panel-citizen");
    const officerPanel = document.getElementById("panel-officer");
    const adminPanel = document.getElementById("panel-admin");
    const landingPanel = document.getElementById("panel-landing");

    // Hide all
    [citizenPanel, officerPanel, adminPanel, landingPanel].forEach(p => {
        if (p) p.classList.remove("active");
    });

    if (appState.currentUser.role === "Citizen") {
        citizenPanel.classList.add("active");
        renderCitizenDashboard();
    } else if (appState.currentUser.role === "Officer") {
        officerPanel.classList.add("active");
        renderOfficerDashboard();
    } else if (appState.currentUser.role === "Admin") {
        adminPanel.classList.add("active");
        renderAdminDashboard();
    }
}

function renderQuickStats() {
    const totalCount = appState.complaints.length;
    const resolvedCount = appState.complaints.filter(c => c.status === "Resolved").length;
    const breachedCount = appState.complaints.filter(c => c.slaBreached).length;
    const activeCount = totalCount - resolvedCount;

    // Update Landing Stats
    const statsTotal = document.getElementById("stat-total");
    const statsResolved = document.getElementById("stat-resolved");
    const statsBreached = document.getElementById("stat-breached");
    const statsActive = document.getElementById("stat-active");

    if (statsTotal) statsTotal.textContent = totalCount;
    if (statsResolved) statsResolved.textContent = resolvedCount;
    if (statsBreached) statsBreached.textContent = breachedCount;
    if (statsActive) statsActive.textContent = activeCount;
}

// ----------------------------------------------------
// CITIZEN DASHBOARD LOGIC
// ----------------------------------------------------
function renderCitizenDashboard() {
    const listBody = document.getElementById("citizen-complaints-list");
    if (!listBody) return;

    listBody.innerHTML = "";

    // Show only the citizen's tickets (for the mock system, we show all tickets that are citizen-owned)
    const complaints = appState.complaints;

    if (complaints.length === 0) {
        listBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No complaints registered yet.</td></tr>`;
        return;
    }

    complaints.forEach(c => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `
            <td><strong style="color: var(--color-primary);">${c.id}</strong></td>
            <td>
                <div>${c.category}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.subcategory}</div>
            </td>
            <td>
                <div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.description}</div>
            </td>
            <td>${formatDate(c.submissionDate)}</td>
            <td>${getStatusBadgeHTML(c.status)}</td>
            <td>${getSLARemainingLabel(c)}</td>
        `;
        
        tr.addEventListener("click", () => openDetailDrawer(c.id));
        listBody.appendChild(tr);
    });
}

// ----------------------------------------------------
// OFFICER DASHBOARD LOGIC
// ----------------------------------------------------
function renderOfficerDashboard() {
    const listBody = document.getElementById("officer-complaints-list");
    if (!listBody) return;

    listBody.innerHTML = "";

    // Filter to only display tickets assigned to the active officer OR their supervisor role
    const officerName = appState.currentUser.name;
    const officerDept = appState.currentUser.department;

    // Show complaints matching department or assigned directly
    const complaints = appState.complaints.filter(c => 
        c.category === officerDept || 
        c.assignedOfficer === officerName || 
        c.assignedOfficer.includes(officerDept)
    );

    // Apply filters
    const searchVal = document.getElementById("officer-search")?.value.toLowerCase() || "";
    const statusFilter = document.getElementById("officer-status-filter")?.value || "ALL";

    const filtered = complaints.filter(c => {
        const matchesSearch = c.id.toLowerCase().includes(searchVal) || 
                              c.description.toLowerCase().includes(searchVal) || 
                              c.subcategory.toLowerCase().includes(searchVal);
        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        listBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No complaints found matching filters.</td></tr>`;
        return;
    }

    filtered.forEach(c => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `
            <td><strong style="color: var(--color-primary);">${c.id}</strong></td>
            <td>
                <div>${c.subcategory}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.location}</div>
            </td>
            <td>${formatDate(c.submissionDate)}</td>
            <td>
                <div>${c.assignedOfficer}</div>
            </td>
            <td>${getStatusBadgeHTML(c.status)}</td>
            <td>${getSLARemainingLabel(c)}</td>
        `;
        
        tr.addEventListener("click", () => openDetailDrawer(c.id));
        listBody.appendChild(tr);
    });
}

// ----------------------------------------------------
// ADMIN DASHBOARD LOGIC
// ----------------------------------------------------
function renderAdminDashboard() {
    // Render the configuration rules table
    const slaTableBody = document.getElementById("admin-sla-rules-body");
    if (slaTableBody) {
        slaTableBody.innerHTML = "";
        Object.entries(appState.slaSettings).forEach(([category, days]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${category}</strong></td>
                <td>${DEFAULT_OFFICERS[category] || "General Desk"}</td>
                <td>${ESCALATION_OFFICERS[category] || "Supervisor"}</td>
                <td>
                    <input type="number" class="sla-edit-input" data-category="${category}" value="${days}" min="1" max="30"> Days
                </td>
            `;
            slaTableBody.appendChild(tr);
        });

        // Add change listeners
        document.querySelectorAll(".sla-edit-input").forEach(input => {
            input.addEventListener("change", (e) => {
                const cat = e.target.getAttribute("data-category");
                const days = e.target.value;
                appState.updateSLASetting(cat, days);
                showToast(`SLA for ${cat} updated to ${days} days`, "success");
                renderQuickStats();
                renderAnalyticsCharts();
            });
        });
    }

    // Render system wide complaints list
    const systemListBody = document.getElementById("admin-complaints-list");
    if (systemListBody) {
        systemListBody.innerHTML = "";

        const searchVal = document.getElementById("admin-search")?.value.toLowerCase() || "";
        const categoryFilter = document.getElementById("admin-category-filter")?.value || "ALL";

        const filtered = appState.complaints.filter(c => {
            const matchesSearch = c.id.toLowerCase().includes(searchVal) || 
                                  c.description.toLowerCase().includes(searchVal) || 
                                  c.location.toLowerCase().includes(searchVal);
            const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            systemListBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No records found.</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            tr.innerHTML = `
                <td><strong style="color: var(--color-primary);">${c.id}</strong></td>
                <td>${c.category}</td>
                <td>${c.assignedOfficer}</td>
                <td>${formatDate(c.submissionDate)}</td>
                <td>${getStatusBadgeHTML(c.status)}</td>
                <td>${c.slaBreached ? '<span class="badge badge-sla-breached">Breached</span>' : '<span class="badge badge-sla-ok">Compliant</span>'}</td>
            `;
            tr.addEventListener("click", () => openDetailDrawer(c.id));
            systemListBody.appendChild(tr);
        });
    }

    // Update charts
    renderAnalyticsCharts();
}

// ----------------------------------------------------
// DRAWER / DETAIL POPUP ENGINE
// ----------------------------------------------------
let activeDetailId = null;

function openDetailDrawer(id) {
    const complaint = appState.complaints.find(c => c.id === id);
    if (!complaint) return;

    activeDetailId = id;
    
    // Set text elements
    document.getElementById("detail-title-id").textContent = complaint.id;
    document.getElementById("detail-category-badge").innerHTML = getStatusBadgeHTML(complaint.status);
    
    document.getElementById("detail-desc").textContent = complaint.description;
    document.getElementById("detail-location").textContent = complaint.location;
    document.getElementById("detail-date").textContent = formatDate(complaint.submissionDate);
    document.getElementById("detail-officer").textContent = complaint.assignedOfficer;
    document.getElementById("detail-sla-status").innerHTML = getSLARemainingLabel(complaint);

    // Show attachment block if present
    const attachmentWrapper = document.getElementById("detail-attachments-wrapper");
    if (attachmentWrapper) {
        attachmentWrapper.innerHTML = "";
        if (complaint.attachments && complaint.attachments.length > 0) {
            complaint.attachments.forEach(file => {
                const item = document.createElement("div");
                item.className = "attachment-preview-box";
                item.innerHTML = `
                    <div class="attachment-icon">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                        <div class="attachment-name">${file.name}</div>
                        <div class="attachment-size">${file.size || "Unknown size"}</div>
                    </div>
                `;
                attachmentWrapper.appendChild(item);
            });
        } else {
            attachmentWrapper.innerHTML = `<span style="color: var(--color-text-muted); font-size: 0.85rem;">No attachments uploaded.</span>`;
        }
    }

    // Citizen feedback section (Citizen View ONLY)
    const feedbackSection = document.getElementById("citizen-feedback-section");
    if (feedbackSection) {
        if (appState.currentUser.role === "Citizen" && complaint.status === "Resolved") {
            feedbackSection.style.display = "block";
            
            // Check if feedback already submitted
            if (complaint.feedback) {
                feedbackSection.innerHTML = `
                    <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--color-success);">Thank you for your feedback!</h4>
                        <div style="color: var(--color-warning); font-size: 1.1rem; margin-bottom: 0.25rem;">
                            ${"★".repeat(complaint.feedback.rating)}${"☆".repeat(5 - complaint.feedback.rating)}
                        </div>
                        <p style="font-size: 0.85rem; color: var(--color-text-secondary); font-style: italic;">"${complaint.feedback.comments || 'No remarks provided'}"</p>
                    </div>
                `;
            } else {
                feedbackSection.innerHTML = `
                    <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
                        <h4 style="font-size: 0.95rem; color: var(--color-text-primary);">Rate Resolution Service</h4>
                        <div class="rating-group" id="rating-stars-input">
                            <span class="rating-star" data-rating="1">★</span>
                            <span class="rating-star" data-rating="2">★</span>
                            <span class="rating-star" data-rating="3">★</span>
                            <span class="rating-star" data-rating="4">★</span>
                            <span class="rating-star" data-rating="5">★</span>
                        </div>
                        <div class="form-group">
                            <textarea class="form-control" id="feedback-comments" placeholder="Add comments/suggestions (optional)..." style="font-size: 0.8rem; min-height: 60px;"></textarea>
                        </div>
                        <button class="btn btn-primary btn-sm" id="btn-submit-feedback">Submit Feedback</button>
                    </div>
                `;
                setupFeedbackEvents(complaint.id);
            }
        } else {
            feedbackSection.style.display = "none";
        }
    }

    // Officer actions section (Officer View ONLY)
    const officerActionsSection = document.getElementById("officer-actions-section");
    if (officerActionsSection) {
        if (appState.currentUser.role === "Officer" && complaint.status !== "Resolved") {
            officerActionsSection.style.display = "block";
            
            // Populate select status options
            const selectHtml = `
                <div class="form-group">
                    <label>Action & Update Status</label>
                    <select class="form-control" id="action-new-status">
                        <option value="Under Review" ${complaint.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved">Mark as Resolved</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Investigation Notes / Remarks</label>
                    <textarea class="form-control" id="action-remarks" placeholder="Enter details of action taken..." style="font-size: 0.85rem; min-height: 80px;"></textarea>
                </div>
                <button class="btn btn-primary btn-sm" id="btn-submit-officer-action" style="width: 100%;">Apply Update</button>
            `;
            officerActionsSection.innerHTML = selectHtml;
            setupOfficerActionEvents(complaint.id);
        } else {
            officerActionsSection.style.display = "none";
        }
    }

    // Render Timeline events
    const timelineContainer = document.getElementById("detail-timeline-container");
    if (timelineContainer) {
        timelineContainer.innerHTML = "";
        complaint.timeline.forEach(event => {
            const item = document.createElement("div");
            item.className = `timeline-item completed ${event.title === 'Auto-Escalated' ? 'escalated' : ''}`;
            item.innerHTML = `
                <div class="timeline-node"></div>
                <div class="timeline-content">
                    <div class="timeline-time">${formatDate(event.date)}</div>
                    <div class="timeline-title">${event.title}</div>
                    <div class="timeline-desc">${event.description}</div>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.25rem; text-align: right;">By: ${event.actor}</div>
                </div>
            `;
            timelineContainer.appendChild(item);
        });
    }

    // Open Drawer UI
    document.getElementById("drawer-backdrop").classList.add("active");
}

function closeDetailDrawer() {
    document.getElementById("drawer-backdrop").classList.remove("active");
    activeDetailId = null;
}

// Setup listeners inside Citizen feedback view
function setupFeedbackEvents(complaintId) {
    const stars = document.querySelectorAll("#rating-stars-input .rating-star");
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.getAttribute("data-rating"));
            stars.forEach(s => {
                const r = parseInt(s.getAttribute("data-rating"));
                if (r <= selectedRating) {
                    s.classList.add("selected");
                } else {
                    s.classList.remove("selected");
                }
            });
        });
    });

    const submitBtn = document.getElementById("btn-submit-feedback");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            if (selectedRating === 0) {
                showToast("Please select a rating star first.", "warning");
                return;
            }
            const comments = document.getElementById("feedback-comments").value;
            appState.submitFeedback(complaintId, selectedRating, comments);
            showToast("Feedback submitted. Thank you!", "success");
            openDetailDrawer(complaintId); // refresh drawer
            renderUI();
        });
    }
}

// Setup listeners inside Officer actions
function setupOfficerActionEvents(complaintId) {
    const submitBtn = document.getElementById("btn-submit-officer-action");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            const newStatus = document.getElementById("action-new-status").value;
            const remarks = document.getElementById("action-remarks").value;

            if (!remarks.trim()) {
                showToast("Please provide investigation notes/remarks.", "warning");
                return;
            }

            appState.updateStatus(complaintId, newStatus, remarks);
            showToast(`Ticket status updated to ${newStatus}`, "success");
            closeDetailDrawer();
            renderUI();
        });
    }
}

// ----------------------------------------------------
// PERSONA SWAP ENGINE
// ----------------------------------------------------
// ----------------------------------------------------
// SUB-TAB NAVIGATION ENGINE
// ----------------------------------------------------
function switchCitizenTab(target) {
    const listTab = document.getElementById("citizen-tab-list");
    const formTab = document.getElementById("citizen-tab-form");
    const listView = document.getElementById("citizen-view-list");
    const formView = document.getElementById("citizen-view-form");
    const categoryInfo = document.getElementById("citizen-category-info");
    const banner = document.querySelector(".banner-widget");

    if (target === "list") {
        if (listView) listView.style.display = "block";
        if (formView) formView.style.display = "none";
        if (categoryInfo) categoryInfo.style.display = "grid";
        if (banner) banner.style.display = "flex";
        
        if (listTab) listTab.classList.add("active");
        if (formTab) formTab.classList.remove("active");
        renderCitizenDashboard();
    } else if (target === "form") {
        if (listView) listView.style.display = "none";
        if (formView) formView.style.display = "block";
        if (categoryInfo) categoryInfo.style.display = "none";
        if (banner) banner.style.display = "none";
        
        if (listTab) listTab.classList.remove("active");
        if (formTab) formTab.classList.add("active");
    }
}

function switchAdminTab(target) {
    const tabSummary = document.getElementById("admin-tab-summary");
    const tabSla = document.getElementById("admin-tab-sla");
    const tabList = document.getElementById("admin-tab-list");
    
    const viewSummary = document.getElementById("admin-view-summary");
    const viewSla = document.getElementById("admin-view-sla");
    const viewList = document.getElementById("admin-view-list");

    // Reset view blocks
    if (viewSummary) viewSummary.style.display = "none";
    if (viewSla) viewSla.style.display = "none";
    if (viewList) viewList.style.display = "none";

    // Reset button states
    [tabSummary, tabSla, tabList].forEach(t => {
        if (t) t.classList.remove("active");
    });

    if (target === "summary") {
        if (viewSummary) viewSummary.style.display = "block";
        if (tabSummary) tabSummary.classList.add("active");
        renderAnalyticsCharts();
    } else if (target === "sla") {
        if (viewSla) viewSla.style.display = "block";
        if (tabSla) tabSla.classList.add("active");
    } else if (target === "list") {
        if (viewList) viewList.style.display = "block";
        if (tabList) tabList.classList.add("active");
    }
}

// ----------------------------------------------------
// PERSONA SWAP ENGINE
// ----------------------------------------------------
function selectRole(roleName) {
    if (roleName === "Citizen") {
        appState.currentUser = {
            role: "Citizen",
            name: "John Doe",
            department: "None",
            avatar: "JD"
        };
    } else if (roleName === "Officer") {
        // Swap to default officer role
        appState.currentUser = {
            role: "Officer",
            name: "Sarah Jenkins",
            department: "Infrastructure",
            avatar: "SJ"
        };
    } else if (roleName === "Admin") {
        appState.currentUser = {
            role: "Admin",
            name: "Administrator",
            department: "Central Admin",
            avatar: "AD"
        };
    }

    appState.saveUser();
    
    // Reset and select target sub-tabs
    if (roleName === "Citizen") {
        switchCitizenTab("list");
    } else if (roleName === "Admin") {
        switchAdminTab("summary");
    }

    showToast(`Logged in as ${appState.currentUser.name} (${appState.currentUser.role})`, "success");
    renderUI();
    closeDetailDrawer();
}

// ----------------------------------------------------
// DOM READY & EVENT INITIALIZATION
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Default View state
    renderUI();

    // 2. Role Selector drop down listener
    const topRoleSelector = document.getElementById("top-role-selector");
    if (topRoleSelector) {
        topRoleSelector.value = appState.currentUser.role;
        topRoleSelector.addEventListener("change", (e) => {
            selectRole(e.target.value);
        });
    }

    // 3. Close Drawer listener
    const closeBtn = document.getElementById("drawer-close-btn");
    const backdrop = document.getElementById("drawer-backdrop");
    if (closeBtn) closeBtn.addEventListener("click", closeDetailDrawer);
    if (backdrop) {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closeDetailDrawer();
        });
    }

    // 4. File Complaint Modal / Panel transitions
    const btnNewComplaint = document.getElementById("btn-new-complaint");
    const citizenTabList = document.getElementById("citizen-tab-list");
    const citizenTabForm = document.getElementById("citizen-tab-form");

    if (btnNewComplaint) {
        btnNewComplaint.addEventListener("click", () => {
            // Show registration form page
            document.getElementById("citizen-view-list").style.display = "none";
            document.getElementById("citizen-view-form").style.display = "block";
            
            // update sub-tab actions
            if (citizenTabList) citizenTabList.classList.remove("active");
            if (citizenTabForm) citizenTabForm.classList.add("active");
        });
    }

    const btnCancel = document.getElementById("btn-cancel-complaint");
    if (btnCancel) {
        btnCancel.addEventListener("click", () => {
            document.getElementById("citizen-view-list").style.display = "block";
            document.getElementById("citizen-view-form").style.display = "none";
            
            if (citizenTabList) citizenTabList.classList.add("active");
            if (citizenTabForm) citizenTabForm.classList.remove("active");
            renderCitizenDashboard();
        });
    }

    // Category Card click shortcuts to open form with pre-selected values
    const setupCategoryCardLink = (cardId, categoryValue) => {
        const card = document.getElementById(cardId);
        if (card) {
            card.addEventListener("click", () => {
                document.getElementById("citizen-view-list").style.display = "none";
                document.getElementById("citizen-view-form").style.display = "block";
                
                if (citizenTabList) citizenTabList.classList.remove("active");
                if (citizenTabForm) citizenTabForm.classList.add("active");
                
                const selectEl = document.getElementById("comp-category");
                if (selectEl) {
                    selectEl.value = categoryValue;
                }
                
                const subcatEl = document.getElementById("comp-subcategory");
                if (subcatEl) {
                    subcatEl.focus();
                }
            });
        }
    };

    setupCategoryCardLink("card-cat-utilities", "Utilities");
    setupCategoryCardLink("card-cat-infrastructure", "Infrastructure");
    setupCategoryCardLink("card-cat-sanitation", "Sanitation");
    setupCategoryCardLink("card-cat-safety", "Public Safety");

    // Sub-tab button controls (Citizen)
    if (citizenTabList) {
        citizenTabList.addEventListener("click", () => {
            document.getElementById("citizen-view-list").style.display = "block";
            document.getElementById("citizen-view-form").style.display = "none";
            citizenTabList.classList.add("active");
            if (citizenTabForm) citizenTabForm.classList.remove("active");
            renderCitizenDashboard();
        });
    }
    
    if (citizenTabForm) {
        citizenTabForm.addEventListener("click", () => {
            document.getElementById("citizen-view-list").style.display = "none";
            document.getElementById("citizen-view-form").style.display = "block";
            citizenTabForm.classList.add("active");
            if (citizenTabList) citizenTabList.classList.remove("active");
        });
    }

    // 5. Submit Complaint Form handler
    const formRegister = document.getElementById("form-register-complaint");
    if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            const category = document.getElementById("comp-category").value;
            const subcategory = document.getElementById("comp-subcategory").value;
            const location = document.getElementById("comp-location").value;
            const description = document.getElementById("comp-description").value;

            // Mock file preview list reader
            const fileInput = document.getElementById("comp-files");
            const files = [];
            if (fileInput && fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    const f = fileInput.files[i];
                    files.push({
                        name: f.name,
                        size: (f.size / (1024 * 1024)).toFixed(1) + " MB"
                    });
                }
            }

            if (!category || !subcategory || !location || !description) {
                showToast("Please fill all required form fields.", "warning");
                return;
            }

            const newTicket = appState.addComplaint(category, subcategory, location, description, files);
            showToast(`Complaint filed successfully! ID: ${newTicket.id}`, "success");
            
            // Clear form
            formRegister.reset();
            const filePreviewContainer = document.getElementById("file-preview-gallery");
            if (filePreviewContainer) filePreviewContainer.innerHTML = "";

            // Transition to list view
            document.getElementById("citizen-view-list").style.display = "block";
            document.getElementById("citizen-view-form").style.display = "none";
            if (citizenTabList) citizenTabList.classList.add("active");
            if (citizenTabForm) citizenTabForm.classList.remove("active");
            
            renderCitizenDashboard();
            renderQuickStats();
        });
    }

    // File input drag and drop/selection preview
    const fileInput = document.getElementById("comp-files");
    const previewContainer = document.getElementById("file-preview-gallery");
    if (fileInput && previewContainer) {
        fileInput.addEventListener("change", () => {
            previewContainer.innerHTML = "";
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const previewItem = document.createElement("div");
                previewItem.className = "file-preview-item";
                
                // Show simple icon or object URL if image
                if (file.type.startsWith("image/")) {
                    const imgUrl = URL.createObjectURL(file);
                    previewItem.innerHTML = `<img src="${imgUrl}" alt="preview">`;
                } else {
                    previewItem.innerHTML = `
                        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#1e293b; color:var(--color-primary); font-size:0.7rem; font-weight:700;">
                            DOC
                        </div>
                    `;
                }
                previewContainer.appendChild(previewItem);
            }
        });
    }

    // 6. Time Travel Panel triggers
    const simTrigger = document.getElementById("sim-trigger");
    const simPanel = document.getElementById("sim-panel");
    const simClose = document.getElementById("sim-close");

    if (simTrigger && simPanel) {
        simTrigger.addEventListener("click", () => {
            simPanel.classList.toggle("active");
        });
    }

    if (simClose && simPanel) {
        simClose.addEventListener("click", () => {
            simPanel.classList.remove("active");
        });
    }

    // Time Fast Forward Buttons
    document.querySelectorAll(".btn-fast-forward").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const days = parseInt(e.target.getAttribute("data-days"));
            const result = appState.fastForward(days);
            
            showToast(`Time simulated forward by ${days} day(s).`, "warning");
            
            if (result.escalated > 0) {
                showToast(`SLA breaches detected! ${result.escalated} complaint(s) auto-escalated.`, "danger");
            }

            renderUI();
            
            // If details drawer is open, refresh it in case the open ticket just escalated
            if (activeDetailId) {
                openDetailDrawer(activeDetailId);
            }
        });
    });

    // 7. Search & Filtering listeners
    const officerSearch = document.getElementById("officer-search");
    const officerFilter = document.getElementById("officer-status-filter");
    if (officerSearch) officerSearch.addEventListener("input", renderOfficerDashboard);
    if (officerFilter) officerFilter.addEventListener("change", renderOfficerDashboard);

    const adminSearch = document.getElementById("admin-search");
    const adminFilter = document.getElementById("admin-category-filter");
    if (adminSearch) adminSearch.addEventListener("input", renderAdminDashboard);
    if (adminFilter) adminFilter.addEventListener("change", renderAdminDashboard);
    
    // Custom sidebar view buttons for Admin dashboard panels
    const adminTabSummary = document.getElementById("admin-tab-summary");
    const adminTabSla = document.getElementById("admin-tab-sla");
    const adminTabList = document.getElementById("admin-tab-list");

    const sectionSummary = document.getElementById("admin-view-summary");
    const sectionSLA = document.getElementById("admin-view-sla");
    const sectionList = document.getElementById("admin-view-list");

    if (adminTabSummary && sectionSummary) {
        adminTabSummary.addEventListener("click", () => {
            sectionSummary.style.display = "block";
            if (sectionSLA) sectionSLA.style.display = "none";
            if (sectionList) sectionList.style.display = "none";
            
            adminTabSummary.classList.add("active");
            if (adminTabSla) adminTabSla.classList.remove("active");
            if (adminTabList) adminTabList.classList.remove("active");
        });
    }

    if (adminTabSla && sectionSLA) {
        adminTabSla.addEventListener("click", () => {
            sectionSummary.style.display = "none";
            sectionSLA.style.display = "block";
            if (sectionList) sectionList.style.display = "none";
            
            adminTabSla.classList.add("active");
            if (adminTabSummary) adminTabSummary.classList.remove("active");
            if (adminTabList) adminTabList.classList.remove("active");
        });
    }

    if (adminTabList && sectionList) {
        adminTabList.addEventListener("click", () => {
            sectionSummary.style.display = "none";
            if (sectionSLA) sectionSLA.style.display = "none";
            sectionList.style.display = "block";
            
            adminTabList.classList.add("active");
            if (adminTabSummary) adminTabSummary.classList.remove("active");
            if (adminTabSla) adminTabSla.classList.remove("active");
        });
    }

    // Run self-checks on startup
    runSelfValidation();
});

// ----------------------------------------------------
// AUTOMATED SELF-VERIFICATION CHECKS
// ----------------------------------------------------
function runSelfValidation() {
    console.group("System Integrity & Validation Self-Check");
    
    // Check 1: State Initialization
    const initialCount = appState.complaints.length;
    console.log(`[PASS] Complaints Database loaded. Entry count: ${initialCount}`);
    
    // Check 2: SLA Configuration check
    const categoriesCount = Object.keys(appState.slaSettings).length;
    console.log(`[PASS] SLA policy tables loaded. Category count: ${categoriesCount}`);

    // Check 3: Add ticket calculation check
    const dummyTicket = appState.addComplaint(
        "Utilities", 
        "Power Outage", 
        "Test St", 
        "Automated self-validation query", 
        []
    );
    const expectedSla = appState.slaSettings["Utilities"];
    const checkSlaMatch = dummyTicket.slaDays === expectedSla;
    console.log(`[${checkSlaMatch ? 'PASS' : 'FAIL'}] SLA threshold assignment check. Assigned Days: ${dummyTicket.slaDays}, Expected: ${expectedSla}`);

    // Check 4: SLA Breach and Escalation Check
    // Create a backdated complaint to force an immediate breach
    const backdatedId = `GRV-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const submission = new Date(appState.systemTime.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    
    const backdatedComplaint = {
        id: backdatedId,
        category: "Sanitation",
        subcategory: "Test SLA",
        description: "Backdated ticket to test auto-escalation engine",
        location: "Test Location",
        submissionDate: submission.toISOString(),
        status: "Submitted",
        assignedOfficer: "Robert Chen",
        slaDays: 1, // 1 day SLA
        slaBreached: false,
        timeline: [
            {
                date: submission.toISOString(),
                title: "Complaint Registered",
                description: "Initial registered ticket.",
                actor: "Citizen"
            }
        ],
        attachments: [],
        feedback: null
    };
    
    appState.complaints.push(backdatedComplaint);
    const escalatedCount = appState.checkSLAEscalations();
    
    const updatedTestObj = appState.complaints.find(c => c.id === backdatedId);
    const checkEscalated = updatedTestObj.status === "Escalated" && updatedTestObj.slaBreached === true && updatedTestObj.assignedOfficer === "Sanitation Supervisor";
    console.log(`[${checkEscalated ? 'PASS' : 'FAIL'}] Time-Travel Escalation logic check. Status: ${updatedTestObj.status}, Officer: ${updatedTestObj.assignedOfficer}, SLA Breached: ${updatedTestObj.slaBreached}`);

    // Cleanup test tickets so they don't persist in database
    appState.complaints = appState.complaints.filter(c => c.id !== dummyTicket.id && c.id !== backdatedId);
    appState.saveComplaints();
    
    console.groupEnd();
}
