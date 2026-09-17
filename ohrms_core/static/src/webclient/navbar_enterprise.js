/** @odoo-module **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { useExternalListener, onMounted, onPatched } from "@odoo/owl";
import { user } from "@web/core/user";

const HISTORY_KEY = "ohrms_visit_history";
const PIN_KEY = "ohrms_pinned_apps";
const HISTORY_LIMIT = 12;

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.state.showHomeMenu = false;
        this.state.showOfficialHome = false;
        this.state.activeSectionId = null;
        this.state.visitHistory = this._loadHistory();
        this.state.pinnedAppIds = this._loadPins();
        this.state.userName = user.name || "";
        this.state.userRole = user.isAdmin ? "Administrateur" : user.isSystem ? "Administration" : "";
        this.state.lastActionApp = null;
        this._lastRecordedAppId = null;
        onMounted(() => {
            this._maybeRecordCurrentApp();
            this._loadUserProfile();
        });
        onPatched(() => this._maybeRecordCurrentApp());
        useExternalListener(window, "keydown", (ev) => {
            if (ev.key === "Escape") {
                if (this.state.showHomeMenu || this.state.showOfficialHome) {
                    this.closeHomeMenu();
                }
            }
        });
    },

    get enterpriseApps() {
        return this.menuService.getApps();
    },

    get activeSection() {
        const sections = this.currentAppSections || [];
        if (!sections.length) {
            return null;
        }
        return (
            sections.find((section) => section.id === this.state.activeSectionId) ||
            sections.find((section) => section.childrenTree && section.childrenTree.length) ||
            sections[0]
        );
    },

    get sidebarMenus() {
        return (this.activeSection && this.activeSection.childrenTree) || [];
    },

    get hasModuleSidebar() {
        return Boolean(
            !this.state.showHomeMenu &&
            !this.state.showOfficialHome &&
            this.currentApp &&
            this.sidebarMenus.length
        );
    },

    /** Resolved visit rows (live app + relative time). */
    get visitHistoryApps() {
        const apps = this.enterpriseApps;
        return (this.state.visitHistory || [])
            .map((row) => {
                const app = apps.find((item) => item.id === row.id);
                if (!app) {
                    return null;
                }
                return {
                    ...row,
                    app,
                    when: this._formatWhen(row.at),
                    pinned: this.state.pinnedAppIds.includes(row.id),
                };
            })
            .filter(Boolean);
    },

    get frequentApps() {
        return [...this.visitHistoryApps]
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 5);
    },

    get pinnedApps() {
        const apps = this.enterpriseApps;
        return (this.state.pinnedAppIds || [])
            .map((id) => apps.find((app) => app.id === id))
            .filter(Boolean);
    },

    get returnShortcuts() {
        const keys = ["paie", "employés", "employees", "congés", "time off", "tableaux de bord", "dashboards"];
        const seen = new Set();
        const result = [];
        for (const app of this.enterpriseApps) {
            const name = (app.name || "").toLowerCase();
            if (keys.some((key) => name.includes(key)) && !seen.has(app.id)) {
                seen.add(app.id);
                result.push(app);
            }
        }
        return result.slice(0, 6);
    },

    get lastVisitedApp() {
        return this.visitHistoryApps[0] || null;
    },

    get sessionUserName() {
        return this.state.userName || user.name || user.login || "";
    },

    get sessionUserRole() {
        return this.state.userRole || "";
    },

    get sessionUserInitial() {
        const name = this.sessionUserName || "?";
        return name.trim().charAt(0).toUpperCase();
    },

    get returnDashboardCards() {
        const cards = [];
        if (this.lastVisitedApp) {
            cards.push({
                key: "continue",
                kind: "continue",
                title: "Continuer",
                subtitle: this.lastVisitedApp.app.name,
                app: this.lastVisitedApp.app,
            });
        }
        for (const row of this.visitHistoryApps.slice(0, 6)) {
            cards.push({
                key: `hist-${row.id}`,
                kind: "history",
                title: row.app.name,
                subtitle: `${row.when} · ${row.visits} visite${row.visits > 1 ? "s" : ""}`,
                app: row.app,
                pinned: row.pinned,
            });
        }
        for (const app of this.pinnedApps) {
            cards.push({
                key: `pin-${app.id}`,
                kind: "pin",
                title: "Épinglé",
                subtitle: app.name,
                app,
            });
        }
        for (const row of this.frequentApps.slice(0, 4)) {
            cards.push({
                key: `freq-${row.id}`,
                kind: "frequent",
                title: "Les plus utilisés",
                subtitle: `${row.app.name} · ${row.visits}`,
                app: row.app,
            });
        }
        for (const app of this.returnShortcuts) {
            cards.push({
                key: `rh-${app.id}`,
                kind: "shortcut",
                title: "Raccourci RH",
                subtitle: app.name,
                app,
            });
        }
        cards.push({
            key: "all-apps",
            kind: "all_apps",
            title: "Toutes les applications",
            subtitle: "Ouvrir le menu officiel",
        });
        if (this.visitHistoryApps.length) {
            cards.push({
                key: "clear",
                kind: "clear",
                title: "Effacer",
                subtitle: "Vider l'historique",
            });
        }
        return cards;
    },

    get returnDashboardTrack() {
        const cards = this.returnDashboardCards;
        if (!cards.length) {
            return [];
        }
        return cards.concat(cards);
    },

    /** 9-dot: official Enterprise home — app grid only. */
    openOfficialHome() {
        this.state.showHomeMenu = false;
        this.state.showOfficialHome = true;
        document.body.classList.remove("o_tn_home_menu_open");
        document.body.classList.add("o_ohrms_official_home");
    },

    toggleOfficialHome() {
        if (this.state.showOfficialHome) {
            this.closeHomeMenu();
        } else {
            this.openOfficialHome();
        }
    },

    /** ‹ : working return dashboard (history, pins, shortcuts). */
    openReturnHome() {
        this.state.lastActionApp = this.currentApp || null;
        this.state.showOfficialHome = false;
        this.state.showHomeMenu = true;
        this.state.visitHistory = this._loadHistory();
        this.state.pinnedAppIds = this._loadPins();
        document.body.classList.remove("o_ohrms_official_home");
        document.body.classList.add("o_tn_home_menu_open");
    },

    onAppBrandClick() {
        if (this.state.showHomeMenu) {
            this.goBackToLastAction();
            return;
        }
        this.openReturnHome();
    },

    goBackToLastAction() {
        this.closeHomeMenu();
        const app = this.state.lastActionApp;
        if (app && this.menuService && this.currentApp && this.currentApp.id !== app.id) {
            this.menuService.selectMenu(app);
        }
    },

    toggleHomeMenu() {
        if (this.state.showHomeMenu) {
            this.closeHomeMenu();
        } else {
            this.openReturnHome();
        }
    },

    closeHomeMenu() {
        this.state.showHomeMenu = false;
        this.state.showOfficialHome = false;
        document.body.classList.remove("o_tn_home_menu_open");
        document.body.classList.remove("o_ohrms_official_home");
    },

    openEnterpriseApp(app) {
        this.closeHomeMenu();
        this.onNavBarDropdownItemSelection(app);
    },

    togglePin(ev, app) {
        ev.stopPropagation();
        const ids = [...this.state.pinnedAppIds];
        const index = ids.indexOf(app.id);
        if (index >= 0) {
            ids.splice(index, 1);
        } else {
            ids.unshift(app.id);
        }
        this.state.pinnedAppIds = ids.slice(0, 8);
        localStorage.setItem(PIN_KEY, JSON.stringify(this.state.pinnedAppIds));
    },

    clearVisitHistory(ev) {
        ev.stopPropagation();
        this.state.visitHistory = [];
        localStorage.removeItem(HISTORY_KEY);
    },

    onReturnCard(ev, card) {
        ev.stopPropagation();
        if (card.kind === "clear") {
            this.clearVisitHistory(ev);
            return;
        }
        if (card.kind === "all_apps") {
            this.openOfficialHome();
            return;
        }
        if (card.app) {
            this.openEnterpriseApp(card.app);
        }
    },

    async _loadUserProfile() {
        this.state.userName = user.name || user.login || "";
        const orm = this.env.services.orm;
        const uid = user.userId;
        if (!uid || !orm) {
            if (user.isAdmin) {
                this.state.userRole = "Administrateur";
            }
            return;
        }
        try {
            const records = await orm.read("res.users", [uid], ["name"]);
            if (records && records[0] && records[0].name) {
                this.state.userName = records[0].name;
            }
        } catch {
            this.state.userName = user.name || user.login || "";
        }
        try {
            const employees = await orm.searchRead(
                "hr.employee",
                [["user_id", "=", uid]],
                ["job_title", "job_id"],
                { limit: 1 }
            );
            if (employees && employees.length) {
                const jobTitle = employees[0].job_title;
                const jobName = employees[0].job_id && employees[0].job_id[1];
                if (jobTitle || jobName) {
                    this.state.userRole = jobTitle || jobName;
                    return;
                }
            }
        } catch {
            // no employee linked
        }
        try {
            const records = await orm.read("res.users", [uid], ["group_ids"]);
            const groupIds = records && records[0] && records[0].group_ids;
            if (groupIds && groupIds.length) {
                const groups = await orm.read("res.groups", groupIds, ["full_name", "name"]);
                const preferred = [
                    /administration|settings|administrateur/i,
                    /comptable|accountant|invoicing/i,
                    /payroll|paie/i,
                    /officer|manager|responsable|administrator/i,
                ];
                for (const pattern of preferred) {
                    const hit = (groups || []).find((group) =>
                        pattern.test(`${group.full_name || ""} ${group.name || ""}`)
                    );
                    if (hit) {
                        this.state.userRole = hit.full_name || hit.name;
                        return;
                    }
                }
                if (groups && groups[0]) {
                    this.state.userRole = groups[0].full_name || groups[0].name || "";
                    return;
                }
            }
        } catch {
            // group_ids may be restricted
        }
        if (user.isAdmin) {
            this.state.userRole = "Administrateur";
        } else if (user.isSystem) {
            this.state.userRole = "Administration";
        }
    },

    isCurrentApp(app) {
        return Boolean(this.currentApp && app && this.currentApp.id === app.id);
    },

    isActiveSection(section) {
        return Boolean(this.activeSection && section && this.activeSection.id === section.id);
    },

    selectAppSection(section) {
        this.state.activeSectionId = section.id;
        const target = this._firstActionMenu(section);
        if (target) {
            this.menuService.selectMenu(target);
        }
    },

    _maybeRecordCurrentApp() {
        const app = this.currentApp;
        if (!app || app.id === this._lastRecordedAppId) {
            return;
        }
        this._lastRecordedAppId = app.id;
        this._recordVisit(app);
    },

    _recordVisit(app) {
        if (!app || !app.id) {
            return;
        }
        const previous = this._loadHistory();
        const existing = previous.find((row) => row.id === app.id);
        const visits = previous.filter((row) => row.id !== app.id);
        visits.unshift({
            id: app.id,
            name: app.name,
            at: Date.now(),
            visits: (existing && existing.visits ? existing.visits : 0) + 1,
        });
        this.state.visitHistory = visits.slice(0, HISTORY_LIMIT);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.state.visitHistory));
    },

    _loadHistory() {
        try {
            const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
            return Array.isArray(raw) ? raw : [];
        } catch {
            return [];
        }
    },

    _loadPins() {
        try {
            const raw = JSON.parse(localStorage.getItem(PIN_KEY) || "[]");
            return Array.isArray(raw) ? raw : [];
        } catch {
            return [];
        }
    },

    _formatWhen(ts) {
        const diff = Date.now() - ts;
        if (diff < 60000) {
            return "à l'instant";
        }
        if (diff < 3600000) {
            return `il y a ${Math.max(1, Math.floor(diff / 60000))} min`;
        }
        if (diff < 86400000) {
            return `il y a ${Math.max(1, Math.floor(diff / 3600000))} h`;
        }
        return new Date(ts).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    },

    _firstActionMenu(menu) {
        if (menu && menu.actionID) {
            return menu;
        }
        for (const child of (menu && menu.childrenTree) || []) {
            const found = this._firstActionMenu(child);
            if (found) {
                return found;
            }
        }
        return null;
    },
});
