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

  /**
   * Navigates directly to the Patient List page using the environment path
   */
  navigateToPatientList() {
    const url = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("PATIENT_LIST_PATH");
    cy.visit(url);
    this.waitForLoaders();
  }

  openInitialModal() {
    this.newPatientBtn.click({ force: true });
    this.patientDialog.should('be.visible');
  }

  fillInitialInfo(data, phn) {
    cy.get('#country-select-demo').clear({ force: true }).type(data.country);
    cy.get('li[role="option"]').contains(data.country).click({ force: true });
    cy.wait(1000);
    cy.contains('span', /Personal Health Number/i).next().find('input').first().type(phn, { force: true });
    cy.contains('span', /Date Of Birth/i).next().find('input[type="date"]').type(data.dob, { force: true });
    cy.contains('button', /^Next$/i).click({ force: true });
    this.waitForLoaders();
  }

  fillDetailedProfile(data, uniqueId) {
    cy.get('#generel', { timeout: 60000 }).within(() => {
      cy.contains('span', /First Name/i).next().find('input').type(data.firstName, { force: true });
      cy.contains('span', /Last Name/i).next().find('input').type(data.lastName, { force: true });
      cy.contains('span', /Gender/i).next().find('[role="combobox"]').click({ force: true });
    });
    cy.get('li[role="option"]').contains(new RegExp(data.gender, "i")).click({ force: true });

    cy.get('#generel').within(() => {
      cy.contains('span', /Email/i).next().find('input').type(`test.${uniqueId}@test.com`, { force: true });
    });

    // --- UPDATED ADDRESS SECTION ---
    cy.get('#address').within(() => {
      // 1. Fill Address
      cy.contains('span', /^Address$/).parent().find('input')
        .should('be.visible').clear({ force: true }).type(data.address, { force: true });

      // 2. Fill City
      cy.contains('span', /City/i).parent().find('input')
        .should('be.visible').clear({ force: true }).type(data.city, { force: true });

      // 3. Open Province Dropdown
      cy.contains('span', /Province/i).parent().find('[role="combobox"]')
        .should('be.visible').click({ force: true });
    });

    // 4. Select Province Option (Must be outside .within() because it's a portal)
    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(data.province)
      .should('be.visible')
      .click({ force: true });

    cy.get('#address').within(() => {
      // 5. Fill Postal Code
      cy.contains('span', /Postal Code/i).parent().find('input')
        .should('be.visible').clear({ force: true }).type(data.postalCode, { force: true });

      // 6. Fill Telephone Number
      cy.contains('span', /Telephone number/i)
        .closest('.MuiStack-root')
        .find('input')
        .last() // Target the actual phone number input, skipping type and country code
        .should('be.visible')
        .clear({ force: true })
        .type(data.phone, { force: true });
    });

    // --- FILL EMERGENCY CONTACT SECTION ---
    cy.get('#em').within(() => {
      // 1. Fill Emergency Contact Name
      cy.contains('span', /Name/i).parent().find('input').first()
        .should('be.visible').clear({ force: true }).type(data.emergencyName, { force: true });

      // 2. Fill Emergency Contact Number
      cy.contains('span', /Number/i).parent().find('input').first()
        .should('be.visible').clear({ force: true }).type(data.emergencyPhone, { force: true });

      // 3. Fill Emergency Contact Email
      cy.contains('span', /Email/i).parent().find('input').first()
        .should('be.visible').clear({ force: true }).type(data.emergencyEmail, { force: true });

      // 4. Fill Emergency Contact Relationship
      cy.contains('span', /Relationship/i).parent().find('input').first()
        .should('be.visible').clear({ force: true }).type(data.emergencyRelationship, { force: true });
    });

    // --- 3. FILL PRIMARY CARE PROVIDER SECTION ---
    cy.get('#pcp').within(() => {
      // Directly target the 'ADD' button by its text and click it
      cy.contains('button', /ADD PRIMARY CARE PROVIDER/i)
        .should('exist')
        .scrollIntoView()
        .click({ force: true });

      // Wait for the search input to appear and then type
      cy.get('input[placeholder="Search Contact"]', { timeout: 15000 })
        .should('be.visible')
        .type(data.pcp, { force: true });
      this.waitForLoaders();
      cy.get('ul.autocomplete-options li.autocomplete-option', { timeout: 20000 })
        .should('be.visible')
        .first()
        .click({ force: true });
      this.waitForLoaders();


    });

    // --- 4. FILL REFERRING PROVIDER SECTION ---
    cy.get('#refP').within(() => {
      cy.contains('button', /ADD REFERRING PROVIDER/i)
        .should('exist')
        .scrollIntoView()
        .click({ force: true });

      // Wait for the search input to appear and then type
      cy.get('input[placeholder="Search Contact"]', { timeout: 15000 })
        .should('be.visible')
        .type(data.referralProvider, { force: true });

      // Wait for background API search results
      this.waitForLoaders();

      // Select the first option from the autocomplete dropdown
      cy.get('ul.autocomplete-options li.autocomplete-option', { timeout: 20000 })
        .should('be.visible')
        .first()
        .click({ force: true });

      // Final sync wait to ensure section is saved
      this.waitForLoaders();
    });

    // --- 5. FINALIZE AND CREATE PATIENT ---
    cy.contains('button', /^Create$/i)
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });
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