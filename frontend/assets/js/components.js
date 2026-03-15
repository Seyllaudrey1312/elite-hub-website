// Elite Hub - Reusable Page Components
// Edit once here → updates every page instantly.

// ─── NAV LINKS CONFIG ────────────────────────────────────────────────────────
const NAV_LINKS = [
    { key: 'home',          label: 'Home',            href: '../index.html' },
    { key: 'subjects',      label: 'Subjects',        href: './subjects.html' },
    { key: 'resources',     label: 'Study Resources', href: './resources.html' },
    { key: 'quizzes',       label: 'Quizzes',         href: './quizzes.html' },
    { key: 'past-papers',   label: 'Past Papers',     href: './past-papers.html' },
    { key: 'pricing',       label: 'Pricing',         href: './pricing.html' },
    { key: 'forums',        label: 'Forums',          href: './forums.html' },
    { key: 'announcements', label: 'Announcements',   href: './announcements.html' },
    { key: 'contact',       label: 'Contact',         href: './contact.html' },
];

// ─── ADMIN SIDEBAR LINKS CONFIG ──────────────────────────────────────────────
const ADMIN_LINKS = [
    { key: 'dashboard',     label: '📊 Dashboard',          href: 'admin-dashboard.html' },
    { key: 'content',       label: '📁 Content Management', href: 'admin-content.html' },
    { key: 'pricing',       label: '💳 Pricing & Payments', href: 'admin-pricing.html' },
    { key: 'users',         label: '👥 User Management',    href: 'admin-users.html' },
    { key: 'tutors',        label: '🎓 Tutor Applications', href: 'admin-tutor-applications.html', badge: true },
    { key: 'partners',      label: '🤝 Partners',           href: 'admin-partners.html' },
    { key: 'announcements', label: '📢 Announcements',      href: 'admin-announcements.html' },
    { key: 'resources',     label: '📚 Resources',          href: 'admin-resources.html' },
    { key: 'quiz-builder',  label: '✏️ Quiz Builder',       href: 'admin-quiz-builder.html' },
    { key: 'quiz-results',  label: '📈 Quiz Results',       href: 'admin-quiz-results.html' },
    { key: 'live-classes',  label: '🎙️ Live Classes',       href: 'admin-live-classes.html' },
    { key: 'video-lessons', label: '🎬 Video Lessons',      href: 'admin-video-lessons.html' },
    { key: 'settings',      label: '⚙️ Site Settings',      href: 'admin-settings.html' },
    { key: 'activity-log',  label: '🗒️ Activity Log',       href: 'admin-activity-log.html' },
];

// ─── CONTACT / FOOTER DETAILS ────────────────────────────────────────────────
const CONTACT = {
    email: 'seyllaudrey6@gmail.com',
    whatsapp: '+254 792619341',
};

// ─── RENDER NAV ──────────────────────────────────────────────────────────────
function renderNav(activePage) {
    const el = document.getElementById('main-nav');
    if (!el) return;

    const token    = localStorage.getItem('authToken');
    const student  = (() => { try { return JSON.parse(localStorage.getItem('student')); } catch { return null; } })();
    const loggedIn = !!token;

    // Build desktop links
    const desktopLinks = NAV_LINKS.map(link => {
        const isActive = link.key === activePage;
        return `<a href="${link.href}" class="${isActive ? 'text-yellow-400 font-bold' : 'hover:text-yellow-400 transition'}">${link.label}</a>`;
    }).join('');

    // Build mobile links
    const mobileLinks = NAV_LINKS.map(link => {
        const isActive = link.key === activePage;
        return `<a href="${link.href}" class="block px-3 py-2 ${isActive ? 'bg-blue-800 text-yellow-400 font-bold' : 'hover:bg-blue-800'} rounded">${link.label}</a>`;
    }).join('');

    // Auth section (desktop)
    const desktopAuth = loggedIn
        ? `<span class="text-yellow-200 text-sm">Welcome, ${student?.name?.split(' ')[0] || 'Student'}</span>
           <button onclick="logoutStudent()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition text-sm">Logout</button>`
        : `<a href="./login.html" class="bg-yellow-400 text-blue-900 px-4 py-2 rounded hover:bg-yellow-300 transition">Login</a>
           <a href="./register.html" class="bg-yellow-400 text-blue-900 px-4 py-2 rounded hover:bg-yellow-300 transition">Register</a>`;

    // Auth section (mobile)
    const mobileAuth = loggedIn
        ? `<div class="px-3 py-2 text-yellow-200 text-sm">Welcome, ${student?.name?.split(' ')[0] || 'Student'}</div>
           <button onclick="logoutStudent()" class="block w-full text-left px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500">Logout</button>`
        : `<a href="./login.html" class="block px-3 py-2 bg-yellow-400 text-blue-900 rounded hover:bg-yellow-300">Login</a>
           <a href="./register.html" class="block px-3 py-2 bg-yellow-400 text-blue-900 rounded hover:bg-yellow-300">Register</a>`;

    el.innerHTML = `
        <nav class="bg-blue-900 text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="../index.html" class="text-2xl font-bold text-yellow-400">Elite Hub</a>
                    </div>

                    <!-- Mobile hamburger -->
                    <div class="flex items-center md:hidden">
                        <button id="nav-hamburger" onclick="toggleMobileMenu()" class="text-white hover:text-yellow-400 focus:outline-none flex items-center">
                            <svg id="nav-icon-open" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                            <svg id="nav-icon-close" class="h-6 w-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Desktop menu -->
                    <div class="hidden md:flex items-center space-x-4">
                        ${desktopLinks}
                        ${desktopAuth}
                    </div>
                </div>

                <!-- Mobile menu -->
                <div id="mobile-menu" class="hidden md:hidden pb-3 space-y-1">
                    ${mobileLinks}
                    ${mobileAuth}
                </div>
            </div>
        </nav>
    `;

    // Attach resize handler to close menu on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            const menu = document.getElementById('mobile-menu');
            const open = document.getElementById('nav-icon-open');
            const close = document.getElementById('nav-icon-close');
            if (menu) menu.classList.add('hidden');
            if (open) open.classList.remove('hidden');
            if (close) close.classList.add('hidden');
        }
    });
}

// Global toggle used by the injected nav HTML
function toggleMobileMenu() {
    const menu  = document.getElementById('mobile-menu');
    const open  = document.getElementById('nav-icon-open');
    const close = document.getElementById('nav-icon-close');
    if (!menu) return;
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
        menu.classList.add('hidden');
        open.classList.remove('hidden');
        close.classList.add('hidden');
    } else {
        menu.classList.remove('hidden');
        open.classList.add('hidden');
        close.classList.remove('hidden');
    }
}

// ─── RENDER ADMIN SIDEBAR ────────────────────────────────────────────────────
function renderAdminSidebar(activePage, pendingCount = 0) {
    const el = document.getElementById('admin-sidebar');
    if (!el) return;

    const sidebarLinks = ADMIN_LINKS.map(link => {
        const isActive = link.key === activePage;
        const badge = (link.badge && pendingCount > 0)
            ? `<span class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">${pendingCount}</span>`
            : '';
        return `
            <a href="${link.href}"
               class="flex items-center px-4 py-3 rounded-lg transition border-l-4
                      ${isActive
                          ? 'bg-blue-700 border-yellow-400 text-white font-semibold'
                          : 'border-transparent text-gray-200 hover:bg-blue-800'}">
                ${link.label}${badge}
            </a>`;
    }).join('');

    el.innerHTML = `
        <!-- Desktop sidebar -->
        <aside id="admin-sidebar-panel"
               class="fixed top-0 left-0 h-full z-40 -translate-x-full lg:translate-x-0 lg:static lg:z-auto
                      w-64 bg-blue-900 text-white flex flex-col transition-transform duration-300">
            <div class="p-6 flex items-center justify-between lg:justify-start border-b border-blue-800">
                <div>
                    <h1 class="text-2xl font-bold text-yellow-400">Elite Hub</h1>
                    <p class="text-xs text-gray-300 mt-1">Admin Panel</p>
                </div>
                <button onclick="closeAdminSidebar()" class="lg:hidden text-white hover:text-gray-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                ${sidebarLinks}
            </nav>
            <div class="p-4 border-t border-blue-800">
                <button onclick="adminLogout()" class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                    🚪 Logout
                </button>
            </div>
        </aside>

        <!-- Overlay -->
        <div id="admin-sidebar-overlay"
             class="fixed inset-0 bg-black bg-opacity-40 z-30 hidden lg:hidden"
             onclick="closeAdminSidebar()"></div>

        <!-- Mobile top bar -->
        <div class="lg:hidden bg-blue-900 text-yellow-400 px-4 py-3 flex items-center gap-3 shadow fixed top-0 left-0 right-0 z-20">
            <button onclick="openAdminSidebar()" class="text-white p-2 rounded hover:bg-blue-800">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>
            <span class="font-semibold">Elite Hub Admin</span>
        </div>
    `;

    // Resize handler
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            document.body.style.overflow = 'auto';
            const overlay = document.getElementById('admin-sidebar-overlay');
            const panel   = document.getElementById('admin-sidebar-panel');
            if (overlay) overlay.classList.add('hidden');
            if (panel)   panel.classList.remove('-translate-x-full');
        }
    });
}

// Global admin sidebar controls
function openAdminSidebar() {
    const panel   = document.getElementById('admin-sidebar-panel');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (panel)   panel.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAdminSidebar() {
    const panel   = document.getElementById('admin-sidebar-panel');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (panel)   panel.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ─── RENDER FOOTER ───────────────────────────────────────────────────────────
function renderFooter() {
    const el = document.getElementById('main-footer');
    if (!el) return;

    el.innerHTML = `
        <footer class="bg-blue-900 text-white py-8 mt-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-xl font-bold text-yellow-400 mb-4">Elite Hub</h3>
                        <p class="text-gray-300">Supporting your academic journey with quality education resources (Seyll Audrey).</p>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-4">Contact Info</h3>
                        <p class="text-gray-300">
                            <a href="mailto:${CONTACT.email}" class="hover:text-yellow-400">Email: ${CONTACT.email}</a>
                        </p>
                        <p class="text-gray-300">
                            <a href="https://wa.me/${CONTACT.whatsapp.replace(/\D/g,'')}" target="_blank" class="hover:text-yellow-400">WhatsApp: ${CONTACT.whatsapp}</a>
                        </p>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-4">Quick Links</h3>
                        <ul class="space-y-2 text-gray-300">
                            <li><a href="./resources.html"     class="hover:text-yellow-400">Resources</a></li>
                            <li><a href="./quizzes.html"       class="hover:text-yellow-400">Quizzes</a></li>
                            <li><a href="./announcements.html" class="hover:text-yellow-400">Announcements</a></li>
                            <li><a href="./contact.html"       class="hover:text-yellow-400">Contact</a></li>
                            <li><a href="./partners.html"      class="hover:text-yellow-400">Partners</a></li>
                            <li><a href="./past-papers.html"   class="hover:text-yellow-400">Past Papers</a></li>
                            <li><a href="./grade-calculator.html" class="hover:text-yellow-400">Grade Calculator</a></li>
                        </ul>
                    </div>
                </div>
                <hr class="border-blue-800 my-6">
                <div class="flex justify-between items-center flex-wrap gap-4">
                    <p class="text-gray-400">&copy; ${new Date().getFullYear()} Elite Hub. All rights reserved.</p>
                    <div class="flex gap-3">
                        <img src="../assets/images/logos/EMG logo.jpg" alt="EMG" class="h-12 w-12 rounded">
                        <img src="../assets/images/logos/TGV logo.jpg" alt="TGV" class="h-12 w-12 rounded">
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// ─── INIT PAGE ───────────────────────────────────────────────────────────────
async function initPage(type, activePage) {
    if (type === 'student') {
        renderNav(activePage);
        renderFooter();
    } else if (type === 'admin') {
        // Render sidebar with 0 first, then fetch real count
        renderAdminSidebar(activePage, 0);
        try {
            const token = localStorage.getItem('adminToken');
            if (token) {
                const res  = await fetch(`${typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '/api'}/tutors/applications/count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const count = data.count || data.pending || 0;
                    if (count > 0) renderAdminSidebar(activePage, count);
                }
            }
        } catch (_) { /* silently ignore — sidebar already rendered */ }
    }
}
