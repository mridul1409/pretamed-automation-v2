class ChartPage {
  // Global Selectors for Chart
  get loaderSelectors() { return '.MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root'; }
  get chartRefreshBtn() { return cy.contains("button", /Refresh/i); }
  get autocompleteOption() { return cy.get('.autocomplete-option'); }

  // Visual Acuity Specific Selectors
  get vAcuityContainer() { return cy.get("#vAcuity"); }
  get addAcuityBtn() { return this.vAcuityContainer.find("button.MuiIconButton-colorPrimary"); }

  // Actions
  waitForLoaders() {
    cy.get(this.loaderSelectors, { timeout: 100000 }).should('not.exist');
  }

  /**
   * Navigation logic to enter a specific patient's chart
   */
  navigateToPatientChart(orgName, patientName) {
    const listUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("PATIENT_LIST_PATH");
    cy.visit(listUrl);
    this.waitForLoaders();

    // 1. Filter and search logic (Simplified from your old code)
    cy.get("main").contains(/Active|Inactive/i).closest(".MuiBox-root").find("svg").first().click({ force: true });
    cy.get('input[placeholder="Search..."]').clear({ force: true }).type(patientName, { force: true });
    cy.get("table tr", { timeout: 60000 }).contains(patientName).click({ force: true });

    // 2. Verification
    cy.url({ timeout: 100000 }).should("include", "/patient-chart");
    this.waitForLoaders();
    this.chartRefreshBtn.should('be.visible');
  }

  /**
   * Complete CRUD operation for Visual Acuity
   */
  visualAcuityCRUD() {
    const uniqueId = Math.floor(100 + Math.random() * 900);
    const initialNote = "Initial visual acuity assessment. ID: " + uniqueId;
    const updatedNote = "Follow-up recorded. ID: " + uniqueId;
    const getRandomVal = () => Math.floor(10 + Math.random() * 90).toString();

    // --- CREATE ---
    this.addAcuityBtn.click({ force: true });
    this.vAcuityContainer.find("table tbody tr").first().within(() => {
      cy.get("td").eq(1).find(".MuiSelect-select").click({ force: true });
    });
    cy.get('li[role="option"]').first().click({ force: true });

    this.vAcuityContainer.find("table tbody tr").first().as('dataRow').within(() => {
      cy.get('input:visible').each(($el, index) => {
        if (index > 0) cy.wrap($el).clear({ force: true }).type(getRandomVal(), { force: true });
      });
    });

    this.vAcuityContainer.within(() => {
      cy.contains(/Note/i).parent().find("input, textarea").type(initialNote, { force: true });
    });
    cy.get('@dataRow').find("td").last().find("button").first().click({ force: true });
    cy.contains(/created.*successfully/i).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE ---
    cy.contains("#vAcuity tr", initialNote).should("be.visible").as("noteRowUpdate");
    cy.get("@noteRowUpdate").prev().click({ force: true }).within(() => {
      cy.get('input:visible').each(($el, index) => {
        if (index > 0) cy.wrap($el).clear({ force: true }).type(getRandomVal(), { force: true });
      });
    });

    this.vAcuityContainer.within(() => {
      cy.contains(/Note/i).parent().find("input, textarea").clear({ force: true }).type(updatedNote, { force: true });
    });
    cy.get("@noteRowUpdate").prev().find("td").last().find("button").first().click({ force: true });
    cy.contains(/updated.*successfully/i).should("be.visible");
    this.waitForLoaders();

    // --- DELETE ---
    cy.contains("#vAcuity tr", updatedNote).should("be.visible").as("noteRowToDelete");
    cy.get("@noteRowToDelete").prev().click({ force: true }).within(() => {
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]').click({ force: true });
    });
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/deleted.*successfully/i).should("be.visible");
    this.waitForLoaders();
  }
}

export default new ChartPage();