class PatientPage {
  // Selectors
  get loaderSelectors() { return '.MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root'; }
  get newPatientBtn() { return cy.contains('button', /New Patient/i); }
  get patientDialog() { return cy.get('[role="dialog"]'); }
  get createSubmitBtn() { return cy.contains('button', /^Create$/i); }
    get countryInput() { return cy.get('#country-select-demo'); }
  get provinceSelect() { return cy.contains('span', /Province \/ Territory/i).next().find('[role="combobox"]'); }
  get phnInput() { return cy.contains('span', /Personal Health Number/i).next().find('input').first(); }
  get dobInput() { return cy.contains('span', /Date Of Birth/i).next().find('input[type="date"]'); }
  get nextBtn() { return cy.contains('button', /^Next$/i); }
  get refreshBtn() { return cy.contains('button', /Refresh/i); }

  // Actions
  waitForLoaders() {
    cy.get(this.loaderSelectors, { timeout: 120000 }).should('not.exist');
  }

  openInitialModal() {
    this.newPatientBtn.click({ force: true });
    this.patientDialog.should('be.visible');
  }

  fillInitialInfo(data, phn) {
    cy.get('#country-select-demo').clear({ force: true }).type(data.country);
    cy.get('li[role="option"]').contains(data.country).click({ force: true });
    cy.wait(1000);
    cy.contains('span', /Province \/ Territory/i).next().find('[role="combobox"]').click({ force: true });
    cy.get('li[role="option"]').contains(data.province).click({ force: true });
    cy.contains('span', /Personal Health Number/i).next().find('input').first().type(phn, { force: true });
    cy.contains('span', /Date Of Birth/i).next().find('input[type="date"]').type(data.dob, { force: true });
    cy.contains('button', /^Next$/i).click({ force: true });
    this.waitForLoaders();
  }

  fillDetailedProfile(data, uniqueId) {
    cy.get('#generel').within(() => {
      cy.contains('span', /First Name/i).next().find('input').type(data.firstName, { force: true });
      cy.contains('span', /Last Name/i).next().find('input').type(data.lastName, { force: true });
      cy.contains('span', /Gender/i).next().find('[role="combobox"]').click({ force: true });
    });
    cy.get('li[role="option"]').contains(new RegExp(data.gender, "i")).click({ force: true });
    
    cy.get('#generel').within(() => {
      cy.contains('span', /Email/i).next().find('input').type(`test.${uniqueId}@test.com`, { force: true });
    });

    cy.get('#address').within(() => {
      cy.contains('span', /^Address$/).next().find('input').type(data.address, { force: true });
      cy.contains('span', /City/i).next().find('input').type(data.city, { force: true });
      cy.get('input[required]').last().type(data.phone, { force: true });
    });

    cy.get('#pcp').find('input').type(data.pcp, { force: true });
    this.createSubmitBtn.should('be.enabled').click({ force: true });
  }

  // 1. Function to wait for the URL to change to the Patient List page
  waitForPatientPageUrl() {
    const expectedUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env('PATIENT_LIST_PATH');
    cy.url({ timeout: 60000 }).should("include", expectedUrl);
    this.waitForLoaders();
  }

  // 2. Function to wait for specific table headers to ensure data is rendered
  verifyPatientTableContent() {
    // Waiting for key column headers to confirm table stability
    cy.contains('Registered Date', { timeout: 60000 }).should('be.visible');
    cy.contains('Address', { timeout: 30000 }).should('be.visible');
    cy.contains('Status', { timeout: 30000 }).should('be.visible');
    this.waitForLoaders();
  }
}

export default new PatientPage();