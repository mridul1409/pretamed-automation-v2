class OrgPage {
  // Selectors
  get loaderSelectors() { return '.MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root'; }
  get createOrgBtn() { return cy.contains(/Create Organization/i); }
  get orgNameInput() { return cy.get('input[name="organizationName"]'); }
  get orgUniqIdInput() { return cy.get('input[name="organizationUniqIdentifier"]'); }
  get orgTypeDropdown() { return cy.get('.MuiSelect-select').first(); }
  get countryInput() { return cy.get('#country-select-demo'); }
  get stateDropdown() { return cy.get('#mui-component-select-state'); }
  get submitBtn() { return cy.get('button').contains(/Create/i); }
  get orgSwitcherBtn() { return cy.get('.MuiAppBar-root button[aria-haspopup="true"], header button[aria-haspopup="true"]'); }

  // Actions
  waitForLoaders() {
    cy.get(this.loaderSelectors, { timeout: 120000 }).should('not.exist');
  }

  navigateToOrg() {
    const orgUrl = Cypress.config().baseUrl.replace(/\/$/, '') + Cypress.env('ORG_PATH');
    cy.visit(orgUrl);
    this.waitForLoaders();
  }


  fillOrgForm(data, newName, newId) {
    this.orgNameInput.type(newName, { force: true });
    this.orgUniqIdInput.type(newId, { force: true });
    this.orgTypeDropdown.click({ force: true });
    cy.get('li[role="option"]').contains(data.type).click();
    // Registration number
    cy.contains('span', /Registration number/i).parent().find('input')
      .should('be.visible').type("REG-12345", { force: true });

    // Licence number
    cy.contains('span', /Licence number/i).parent().find('input')
      .should('be.visible').type("LIC-67890", { force: true });

    cy.get('input[name="totalRoom"]').type(data.rooms, { force: true });
    cy.get('input[name="totalBed"]').type(data.beds, { force: true });
    cy.get('input[name="inPatient"]').check({ force: true });

    // Address Section
    this.countryInput.clear().type(`${data.country}{enter}`, { force: true });
    cy.get('input[name="line"]').type(data.address, { force: true });
    cy.get('input[name="city"]').type(data.city, { force: true });

    // Updated State/Province Selector based on new UI
    cy.contains('div', /Province/i).parent().find('[role="combobox"], .MuiSelect-select').click({ force: true });
    cy.get('li[role="option"]').contains(data.state).click();

    cy.get('input[name="postalCode"]').type(data.postalCode, { force: true });

    // --- CONTACT SECTION (Handling Country Pickers) ---

    // Telephone Numbers: Target the last input to skip country code
    cy.contains(/Telephone numbers/i).parent().find('input').last().type(data.phone, { force: true });

    // Fax: Target the last input to skip country code
    cy.contains("span", /^Fax$/).parent().find('input').last().type(data.fax, { force: true });

    // Emergency Numbers: Target the last input to skip country code
    cy.contains(/Emergency numbers/i).parent().find('input').last().type(data.emergencyPhone, { force: true });

    // Contact Emails
    cy.contains(/Organization emails/i).parent().find('input').first().type(data.email, { force: true });

    this.submitBtn.click({ force: true });
  }

  /**
     * Verifies the successful creation of an organization by checking 
     * the dashboard headers and the presence of the new org name.
     */
  verifyOrgCreated(newName) {
    this.waitForLoaders();

    // 1. Verify the URL returns to the main organization list
    const expectedUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env('ORG_PATH');
    cy.url({ timeout: 60000 }).should("eq", expectedUrl);
    this.waitForLoaders();

    // 2. Verify dashboard specific headers as per your screenshot
    cy.contains("Incoming Request to join the Organization", { timeout: 30000 }).should("be.visible");
    cy.contains("Outgoing Request to join an Organization", { timeout: 30000 }).should("be.visible");

    // 3. Look for the newly created Organization Name in the list
    cy.contains(newName, { timeout: 30000 }).should("be.visible");

    this.waitForLoaders();
  }

switchOrganization(orgName) {
    // 1. Hard reload to refresh the list
    cy.reload();
    this.waitForLoaders();

    // 2. Click the organization switcher button
    this.orgSwitcherBtn.should('be.visible').click({ force: true });

    // 3. Updated Logic: Use 'exist' instead of 'be.visible'
    // This bypasses the visibility/clipping issue caused by 'position: fixed'
    cy.get('li[role="menuitem"]', { timeout: 30000 })
      .contains(orgName)
      .scrollIntoView()
      .should('exist') // Changed from 'be.visible' to 'exist'
      .click({ force: true }); // force: true will execute the click even if clipped

    this.waitForLoaders();
  }
}

export default new OrgPage();