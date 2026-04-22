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
    cy.get('input[name="totalRoom"]').type(data.rooms, { force: true });
    cy.get('input[name="totalBed"]').type(data.beds, { force: true });
    cy.get('input[name="inPatient"]').check({ force: true });
    this.countryInput.clear().type(`${data.country}{enter}`, { force: true });
    cy.get('input[name="line"]').type(data.address, { force: true });
    cy.get('input[name="city"]').type(data.city, { force: true });
    this.stateDropdown.click({ force: true });
    cy.get('li[role="option"]').contains(data.state).click();
    cy.get('input[name="postalCode"]').type(data.postalCode, { force: true });
    cy.contains("Telephone Numbers").parent().find('input').first().type(data.phone, { force: true });
    cy.get('input[name="faxNumber"]').type(data.fax, { force: true });
    cy.contains("Emergency Numbers").parent().find('input').first().type(data.emergencyPhone, { force: true });
    cy.contains("Contact Emails").parent().find('input').first().type(data.email, { force: true });
    this.submitBtn.click({ force: true });
  }

  switchOrganization(orgName) {
    this.waitForLoaders();
    this.orgSwitcherBtn.should('be.visible').click({ force: true });
    cy.get('li[role="menuitem"]', { timeout: 60000 }).contains(orgName).click({ force: true });
    this.waitForLoaders();
  }
}

export default new OrgPage();