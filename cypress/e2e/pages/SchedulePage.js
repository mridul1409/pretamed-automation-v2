class SchedulePage {
  // Selectors
  get loaderSelectors() { return '.MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root'; }
  get addEventBtn() { return cy.contains('button', /Add Event/i); }
  get patientSearchInput() { return cy.contains('p', /^Patient$/).parent().find('input[placeholder="Search"]'); }
  get autocompleteOption() { return cy.get('.autocomplete-option'); }
  get dayInput() { return cy.get('[aria-label="Day"]').first(); }
  get monthInput() { return cy.get('[aria-label="Month"]').first(); }
  get yearInput() { return cy.get('[aria-label="Year"]').first(); }
  get saveBtn() { return cy.contains('button', /^Add$/); }
  get duplicateModal() { return cy.get('body'); }

  // Actions
  waitForLoaders() {
    cy.get(this.loaderSelectors, { timeout: 120000 }).should('not.exist');
  }

  navigateToSchedule() {
    const fullUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("SCHEDULE_PATH");
    cy.visit(fullUrl);
    this.waitForLoaders();
  }

  openAddEventForm() {
    this.addEventBtn.should('be.visible').click({ force: true });
  }

  fillPatientDetails(name, fullName) {
    this.patientSearchInput.clear({ force: true }).type(name, { delay: 100, force: true });
    this.autocompleteOption.contains(fullName).should('be.visible').click({ force: true });
  }

  /**
 * Searches and selects a referring provider
 */
  fillReferringProvider(providerName) {
    cy.contains('p', /Referring Provider/i)
      .parent()
      .find('input[placeholder="Search Contact"]')
      .type(providerName, { delay: 100, force: true });

    // Select the first autocomplete result
    this.autocompleteOption.first().click({ force: true });
  }

  fillDateTime(dateStr, start, end) {
    const [d, m, y] = dateStr.split('/');
    this.dayInput.type(d);
    this.monthInput.type(m);
    this.yearInput.type(y);

    const startParts = start.split(/[: ]/);
    const endParts = end.split(/[: ]/);

    // Start Time
    cy.contains('p', 'Start').parent().within(() => {
      cy.get('[aria-label="Hours"]').click().type(startParts[0]);
      cy.get('[aria-label="Minutes"]').click().type(startParts[1]);
      cy.get('[aria-label="Meridiem"]').click().type(startParts[2]);
    });

    // End Time
    cy.contains('p', 'End').parent().within(() => {
      cy.get('[aria-label="Hours"]').click().type(endParts[0]);
      cy.get('[aria-label="Minutes"]').click().type(endParts[1]);
      cy.get('[aria-label="Meridiem"]').click().type(endParts[2]);
    });
  }

  selectEventType(type) {
    cy.contains('p', /Select Type/i).parent().find('[role="combobox"]').click({ force: true });
    cy.get('li[role="option"]').contains(type).click({ force: true });
  }

  handleDuplicateAndSave() {
    this.saveBtn.should('be.enabled').click({ force: true });
    cy.wait(1000);
    this.duplicateModal.then(($body) => {
      if ($body.text().includes('Duplicate Booking Warning')) {
        cy.contains('.swal2-popup', 'Duplicate Booking Warning')
          .contains('button', 'Add')
          .click({ force: true });
      }
    });
    cy.contains(/successfully/i, { timeout: 20000 }).should('be.visible');
  }
}

export default new SchedulePage();