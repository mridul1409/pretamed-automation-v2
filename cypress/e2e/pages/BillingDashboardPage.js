class BillingDashboardPage {
    // ===========================================================
    // SELECTORS (GETTERS)
    // ===========================================================
    get loaderSelectors() { return ".MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root"; }
    get billManagerSidebarIcon() { return cy.get('li[aria-label="Bill Manager"] a', { timeout: 30000 }).filter(':visible').first(); }
    get teleplanSettingsLink() { return cy.get('a[aria-label="Teleplan Settings"]', { timeout: 30000 }); }
    get loginTestBtn() { return cy.contains("button", /LOGIN TEST/i); }
    get autoSyncBtn() { return cy.contains("button", /AUTO SYNC/i); }

    // ===========================================================
    // ACTIONS (METHODS)
    // ===========================================================

    waitForLoaders() {
        cy.get(this.loaderSelectors, { timeout: 300000 }).should("not.exist");
    }

    /**
     * Navigates to the Billing Manager Dashboard and verifies sidebar links
     */
    navigateToDashboard() {
        this.billManagerSidebarIcon.click({ force: true });
        cy.url({ timeout: 60000 }).should("include", "/billing-manager-dashboard");
        this.waitForLoaders();

        // Verify key sidebar items are visible
        const sidebarItems = ["Dashboard", "Service List", "Billing List", "Teleplan Services"];
        sidebarItems.forEach(item => {
            cy.contains(item, { timeout: 30000 }).should("be.visible");
        });
    }

    /**
     * Navigates to Teleplan Settings and runs the Login Test
     */
    runTeleplanLoginTest() {
        // 1. Enter Settings
        this.teleplanSettingsLink.should("be.visible").click({ force: true });
        this.waitForLoaders();

        // 2. Verify buttons are present
        this.loginTestBtn.should("be.visible");
        this.autoSyncBtn.should("be.visible");

        // 3. Trigger Login Test
        this.loginTestBtn.click({ force: true });
        this.waitForLoaders();

        // 4. Verification: Look for success message
        cy.contains(/success/i, { timeout: 30000 }).should("be.visible");
        this.waitForLoaders();
    }
}

export default new BillingDashboardPage();