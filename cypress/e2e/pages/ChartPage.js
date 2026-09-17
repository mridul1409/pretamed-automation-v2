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
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should("be.visible");
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should("not.exist");
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
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should("be.visible");
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should("not.exist");
    this.waitForLoaders();

    // --- DELETE ---
    cy.contains("#vAcuity tr", updatedNote).should("be.visible").as("noteRowToDelete");
    cy.get("@noteRowToDelete").prev().click({ force: true }).within(() => {
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]').click({ force: true });
    });
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should("be.visible");
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should("not.exist");
    this.waitForLoaders();
  }

  // Selectors for Intraocular Pressure
  get iPressureContainer() { return cy.get("#iPressure"); }
  get addPressureBtn() { return this.iPressureContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Intraocular Pressure
   */
  intraocularPressureCRUD() {
    const initialRE = Math.floor(100 + Math.random() * 900);
    const initialLE = Math.floor(100 + Math.random() * 900);
    const updatedRE = Math.floor(100 + Math.random() * 900);
    const updatedLE = Math.floor(100 + Math.random() * 900);
    const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, "0");

    // --- CREATE ---
    this.addPressureBtn.click({ force: true });
    this.iPressureContainer.find("table tbody tr").first().within(() => {
      cy.get("td").eq(0).find("input").first().type(`2026-02-${day}`, { force: true });
      cy.get("td").eq(1).find("input").first().type(initialRE.toString(), { force: true });
      cy.get("td").eq(2).find("input").first().type(initialLE.toString(), { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });
    cy.contains(/created.*successfully/i).should("be.visible", { timeout: 60000 });
    cy.contains(/created.*successfully/i).should("not.exist", { timeout: 60000 });
    this.waitForLoaders();

    // --- UPDATE PART ---
    // Use an alias to target the exact row we want to edit
    cy.contains("#iPressure tr", initialRE.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('rowToUpdate');

    // Click the row to enter edit mode
    cy.get('@rowToUpdate').click({ force: true });

    // Important: Wait for the row to actually contain inputs (Edit Mode)
    cy.get('@rowToUpdate').within(() => {
      // Increased wait for stable input rendering after the TypeError
      cy.get("input", { timeout: 120000 }).should("be.visible");

      cy.get("td").eq(1).find("input").clear({ force: true }).type(updatedRE.toString(), { force: true });
      cy.get("td").eq(2).find("input").clear({ force: true }).type(updatedLE.toString(), { force: true });

      // Click the Save button (blue tick) within the same row
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/updated.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/updated.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();

    // --- DELETE PART ---
    // Using an alias to target the specific row that contains the updated value
    cy.contains("#iPressure tr", updatedRE.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('rowToDelete');

    // Click the specific row to enter edit mode
    cy.get("@rowToDelete").click({ force: true });

    // Locate the delete button within the same targeted row
    cy.get("@rowToDelete").within(() => {
      // Increased timeout to wait for the delete button to render after the app exception
      cy.get('button[aria-label="Delete"]', { timeout: 120000 })
        .should("be.visible")
        .click({ force: true });
    });

    // Standard confirmation flow
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/deleted.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/deleted.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();
  }

  // Selectors for Level of Care
  get levelOfCareContainer() { return cy.get("#levelOfCare"); }
  get addLevelBtn() { return this.levelOfCareContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Level of Care
   */
  levelOfCareCRUD() {
    const createId = Math.floor(100 + Math.random() * 900);
    const updateId = Math.floor(100 + Math.random() * 900);
    const initialDesc = "Routine check ID: " + createId;
    const updatedDesc = "Urgent follow-up ID: " + updateId;

    // --- CREATE PART ---
    this.addLevelBtn.click({ force: true });
    this.levelOfCareContainer.find("table tbody tr").first().within(() => {
      cy.get("td").eq(0).find("input").first().type("2026-02-03", { force: true });
      cy.get("td").eq(1).find("input").first().type("Stable", { force: true });
      cy.get("td").eq(2).find("input").first().type(initialDesc, { force: true });
      cy.get("td").eq(3).find("input").first().type("Doctor Mehedi", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });
    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#levelOfCare tr", createId.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('levelRowToUpdate');

    cy.get('@levelRowToUpdate').click({ force: true });
    cy.get('@levelRowToUpdate').within(() => {
      // Waiting for edit mode inputs to render properly
      cy.get("input", { timeout: 120000 }).should("be.visible");
      cy.get("td").eq(1).find("input").clear({ force: true }).type("Urgent", { force: true });
      cy.get("td").eq(2).find("input").clear({ force: true }).type(updatedDesc, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#levelOfCare tr", updateId.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('levelRowToDelete');

    cy.get("@levelRowToDelete").click({ force: true });
    cy.get("@levelRowToDelete").within(() => {
      cy.get('button[aria-label="Delete"]', { timeout: 120000 })
        .should("be.visible")
        .click({ force: true });
    });
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();
  }

  // Selectors for Allergies (New Feature)
  get allergyHxContainer() { return cy.get("#allergyHx"); }

  /**
   * Complete CRUD operation for Medication Allergy
   * @param {Object} createData - Initial record values
   * @param {Object} updateData - Updated record values
   */
  medicationAllergyCRUD(createData, updateData) {
    // ==========================================
    // 1. CREATE OPERATION
    // ==========================================
    // Open new allergy entry form
    this.allergyHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    // Handle "New Allergy" menu item if it pops up
    cy.get('body').then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains('li', /New Allergy/i).click({ force: true });
      }
    });

    this.waitForLoaders();

    // 1. Fill Substance (Autocomplete)
    this.allergyHxContainer
      .find('table tbody tr', { timeout: 30000 })
      .first()
      .find('input[placeholder*="e.g. penicillin, peanuts"]')
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(createData.substance, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 2. Select Category (Dropdown)
    this.allergyHxContainer
      .find('table tbody tr')
      .first()
      .contains('div, span', /Select category/i)
      .closest('[role="combobox"], .MuiSelect-select')
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(createData.category || "Medication")
      .should('be.visible')
      .click({ force: true });

    // 3. Fill Header Reaction
    if (createData.reaction) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. hives, rash"]')
        .first()
        .clear({ force: true })
        .type(createData.reaction, { force: true });
    }

    // 4. Expand Additional Details
    this.allergyHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.allergyHxContainer.contains('button', /Hide additional details/i, { timeout: 30000 }).should('be.visible');

    // 5. Select Clinical status (Dropdown)
    if (createData.clinicalStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Clinical status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.clinicalStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 6. Select Verification status (Dropdown)
    if (createData.verificationStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Verification status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.verificationStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 7. Select Criticality (Dropdown)
    if (createData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Save Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 9. Verify Toast Message
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();



    // ==========================================
    // 2. UPDATE OPERATION
    // ==========================================
    // Open edit mode by clicking the title text directly
    this.allergyHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + createData.substance + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Update Substance Name (Autocomplete)
    if (updateData.substance) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. penicillin, peanuts"]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updateData.substance, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // Update Criticality
    if (updateData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updateData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // Save Updated Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Verify Update Toast Message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();


    // ==========================================
    // 3. DELETE OPERATION
    // ==========================================
    // Target latest card and click red delete button
    this.allergyHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      // .filter(`:contains("${targetSubstance}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // Confirm Deletion in SweetAlert Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // Verify Delete Toast Message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
    cy.log("✅ Medication Allergy CRUD Completed");
  }

  /**
   * Complete CRUD operation for Food Allergy
   * @param {Object} createData - Initial record values
   * @param {Object} updateData - Updated record values
   */
  foodAllergyCRUD(createData, updateData) {
    // ==========================================
    // 1. CREATE OPERATION
    // ==========================================
    this.allergyHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    // Handle "New Allergy" menu item if it pops up
    cy.get('body').then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains('li', /New Allergy/i).click({ force: true });
      }
    });

    this.waitForLoaders();

    // 1. Fill Substance (Autocomplete)
    this.allergyHxContainer
      .find('table tbody tr', { timeout: 30000 })
      .first()
      .find('input[placeholder*="e.g. penicillin, peanuts"]')
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(createData.substance, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 2. Select Category (Dropdown)
    this.allergyHxContainer
      .find('table tbody tr')
      .first()
      .contains('div, span', /Select category/i)
      .closest('[role="combobox"], .MuiSelect-select')
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(createData.category || "Food")
      .should('be.visible')
      .click({ force: true });

    // 3. Fill Header Reaction
    if (createData.reaction) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. hives, rash"]')
        .first()
        .clear({ force: true })
        .type(createData.reaction, { force: true });
    }

    // 4. Expand Additional Details
    this.allergyHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.allergyHxContainer.contains('button', /Hide additional details/i, { timeout: 30000 }).should('be.visible');

    // 5. Select Clinical status (Dropdown)
    if (createData.clinicalStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Clinical status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.clinicalStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 6. Select Verification status (Dropdown)
    if (createData.verificationStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Verification status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.verificationStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 7. Select Criticality (Dropdown)
    if (createData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Save Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 9. Verify Toast Message
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // ==========================================
    // 2. UPDATE OPERATION
    // ==========================================
    // Open edit mode by clicking the title text directly
    this.allergyHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + createData.substance + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Update Substance Name (Autocomplete)
    if (updateData.substance) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. penicillin, peanuts"]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updateData.substance, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // Update Criticality
    if (updateData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updateData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // Save Updated Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Verify Update Toast Message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // ==========================================
    // 3. DELETE OPERATION
    // ==========================================
    this.allergyHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // Confirm Deletion in SweetAlert Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // Verify Delete Toast Message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
    cy.log("✅ Food Allergy CRUD Completed");
  }

  /**
   * Complete CRUD operation for Environmental Allergy
   * @param {Object} createData - Initial record values
   * @param {Object} updateData - Updated record values
   */
  environmentalAllergyCRUD(createData, updateData) {
    // ==========================================
    // 1. CREATE OPERATION
    // ==========================================
    this.allergyHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    // Handle "New Allergy" menu item if it pops up
    cy.get('body').then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains('li', /New Allergy/i).click({ force: true });
      }
    });

    this.waitForLoaders();

    // 1. Fill Substance (Autocomplete)
    this.allergyHxContainer
      .find('table tbody tr', { timeout: 30000 })
      .first()
      .find('input[placeholder*="e.g. penicillin, peanuts"]')
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(createData.substance, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 2. Select Category (Dropdown)
    this.allergyHxContainer
      .find('table tbody tr')
      .first()
      .contains('div, span', /Select category/i)
      .closest('[role="combobox"], .MuiSelect-select')
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(createData.category || "Environmental")
      .should('be.visible')
      .click({ force: true });

    // 3. Fill Header Reaction
    if (createData.reaction) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. hives, rash"]')
        .first()
        .clear({ force: true })
        .type(createData.reaction, { force: true });
    }

    // 4. Expand Additional Details
    this.allergyHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.allergyHxContainer.contains('button', /Hide additional details/i, { timeout: 30000 }).should('be.visible');

    // 5. Select Clinical status (Dropdown)
    if (createData.clinicalStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Clinical status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.clinicalStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 6. Select Verification status (Dropdown)
    if (createData.verificationStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Verification status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.verificationStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 7. Select Criticality (Dropdown)
    if (createData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Save Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 9. Verify Toast Message
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // ==========================================
    // 2. UPDATE OPERATION
    // ==========================================
    // Open edit mode by clicking the title text directly
    this.allergyHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + createData.substance + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Update Substance Name (Autocomplete)
    if (updateData.substance) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. penicillin, peanuts"]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updateData.substance, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // Update Criticality
    if (updateData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updateData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // Save Updated Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Verify Update Toast Message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // ==========================================
    // 3. DELETE OPERATION
    // ==========================================
    this.allergyHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // Confirm Deletion in SweetAlert Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // Verify Delete Toast Message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
    cy.log("✅ Environmental Allergy CRUD Completed");
  }

  /**
   * Complete CRUD operation for Biologic Allergy
   * @param {Object} createData - Initial record values
   * @param {Object} updateData - Updated record values
   */
  biologicAllergyCRUD(createData, updateData) {
    // ==========================================
    // 1. CREATE OPERATION
    // ==========================================
    this.allergyHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    // Handle "New Allergy" menu item if it pops up
    cy.get('body').then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains('li', /New Allergy/i).click({ force: true });
      }
    });

    this.waitForLoaders();

    // 1. Fill Substance (Autocomplete)
    this.allergyHxContainer
      .find('table tbody tr', { timeout: 30000 })
      .first()
      .find('input[placeholder*="e.g. penicillin, peanuts"]')
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(createData.substance, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 2. Select Category (Dropdown)
    this.allergyHxContainer
      .find('table tbody tr')
      .first()
      .contains('div, span', /Select category/i)
      .closest('[role="combobox"], .MuiSelect-select')
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(createData.category || "Biologic")
      .should('be.visible')
      .click({ force: true });

    // 3. Fill Header Reaction
    if (createData.reaction) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. hives, rash"]')
        .first()
        .clear({ force: true })
        .type(createData.reaction, { force: true });
    }

    // 4. Expand Additional Details
    this.allergyHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.allergyHxContainer.contains('button', /Hide additional details/i, { timeout: 30000 }).should('be.visible');

    // 5. Select Clinical status (Dropdown)
    if (createData.clinicalStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Clinical status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.clinicalStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 6. Select Verification status (Dropdown)
    if (createData.verificationStatus) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Verification status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.verificationStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 7. Select Criticality (Dropdown)
    if (createData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(createData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Save Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 9. Verify Toast Message
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // ==========================================
    // 2. UPDATE OPERATION
    // ==========================================
    // Open edit mode by clicking the title text directly
    this.allergyHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + createData.substance + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Update Substance Name (Autocomplete)
    if (updateData.substance) {
      this.allergyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="e.g. penicillin, peanuts"]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updateData.substance, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // Update Criticality
    if (updateData.criticality) {
      this.allergyHxContainer
        .find('table tbody tr')
        .contains('p', /^Criticality$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updateData.criticality)
        .should('be.visible')
        .click({ force: true });
    }

    // Save Updated Record (Click Blue Tick Button)
    this.allergyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // Verify Update Toast Message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // ==========================================
    // 3. DELETE OPERATION
    // ==========================================
    this.allergyHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // Confirm Deletion in SweetAlert Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // Verify Delete Toast Message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
    cy.log("✅ Biologic Allergy CRUD Completed");
  }

  // Selectors for Vital Measurements
  get measurementsContainer() { return cy.get("#measurements"); }
  get addVitalsBtn() { return this.measurementsContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Vital Measurements
   */
  vitalMeasurementsCRUD() {
    const hrCreate = Math.floor(100 + Math.random() * 900);
    const hrUpdate = Math.floor(100 + Math.random() * 900);

    // --- CREATE PART ---
    this.addVitalsBtn.click({ force: true });

    this.measurementsContainer.find("table tbody tr").first().as('vitalsNewRow').within(() => {
      // Index 0: Date
      cy.get("td").eq(0).find("input").first().type("2026-02-03", { force: true });
      // Index 1: BP (Sys/Dia)
      cy.get("td").eq(1).find("input").eq(0).type("120", { force: true });
      cy.get("td").eq(1).find("input").eq(1).type("80", { force: true });
      // Index 2: HR (Using as Unique ID)
      cy.get("td").eq(2).find("input").type(hrCreate.toString(), { force: true });
      // Index 3-5: SPO2, RR, Temp
      cy.get("td").eq(3).find("input").type("98", { force: true });
      cy.get("td").eq(4).find("input").type("16", { force: true });
      cy.get("td").eq(5).find("input").type("36.6", { force: true });
      // Save
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#measurements tr", hrCreate.toString())
      .scrollIntoView()
      .as("vitalsRowToUpdate");

    cy.get("@vitalsRowToUpdate").click({ force: true });

    cy.get("@vitalsRowToUpdate").within(() => {
      // Wait for edit mode inputs to appear
      cy.get("input", { timeout: 120000 }).should("be.visible");

      // Updating HR and SPO2
      cy.get("td").eq(2).find("input").clear({ force: true }).type(hrUpdate.toString(), { force: true });
      cy.get("td").eq(3).find("input").clear({ force: true }).type("99", { force: true });

      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // --- DELETE PART ---
    // Target the specific row updated previously
    cy.contains("#measurements tr", hrUpdate.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('vitalsRowToDelete');

    // Crucial Step: Click the row first to ensure the action icons (Delete) are triggered/rendered
    cy.get("@vitalsRowToDelete").click({ force: true });

    cy.get("@vitalsRowToDelete").within(() => {
      // Use an increased timeout to handle the app's internal TypeError sluggishness
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]', { timeout: 120000 })
        .should("be.visible")
        .click({ force: true });
    });

    // Standard confirmation flow
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();
  }

  // Selectors for Body Measurements
  get phyMeasurementsContainer() { return cy.get("#phyMeasurements"); }
  get addPhyBtn() { return this.phyMeasurementsContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Body Measurements (Physical)
   */
  bodyMeasurementsCRUD() {
    const weightCreate = Math.floor(100 + Math.random() * 900);
    const weightUpdate = Math.floor(100 + Math.random() * 900);

    // --- CREATE PART ---
    this.addPhyBtn.click({ force: true });

    this.phyMeasurementsContainer.find("table tbody tr").first().as('phyNewRow').within(() => {
      // Date (eq 0), Height (eq 1), Weight (eq 3)
      cy.get("td").eq(0).find("input").first().type("2026-02-03", { force: true });
      cy.get("td").eq(1).find("input").first().type("175", { force: true });
      cy.get("td").eq(3).find("input").first().type(weightCreate.toString(), { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#phyMeasurements tr", weightCreate.toString())
      .scrollIntoView()
      .as("phyRowToUpdate");

    cy.get("@phyRowToUpdate").click({ force: true });

    cy.get("@phyRowToUpdate").within(() => {
      // Wait for inputs to render in edit mode
      cy.get("input", { timeout: 120000 }).should("be.visible");
      cy.get("td").eq(1).find("input").first().clear({ force: true }).type("180", { force: true });
      cy.get("td").eq(3).find("input").first().clear({ force: true }).type(weightUpdate.toString(), { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#phyMeasurements tr", weightUpdate.toString())
      .scrollIntoView()
      .as("phyRowToDelete");

    // Click row first to trigger the delete icon's visibility
    cy.get("@phyRowToDelete").click({ force: true });

    cy.get("@phyRowToDelete").within(() => {
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]', { timeout: 120000 })
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();
  }


  // Selectors for Medical History
  get medicalHxContainer() { return cy.get("#medicalHx"); }
  get addMedicalHxBtn() { return this.medicalHxContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }





  // Selectors for Medical History (New Feature)
  get medicalHxContainer() { return cy.get("#medicalHx"); }

  /**
   * Create Medical History record
   * @param {Object} data - Contains diagnosis, verification, clinicalStatus, onsetAge, etc.
   */
  createMedicalHistory(data) {
    // 1. Scroll to container and click Add '+' button
    this.medicalHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    this.waitForLoaders();

    // 2. Fill Diagnosis (Autocomplete)
    this.medicalHxContainer
      .find('table tbody tr')
      .first()
      .find('input[placeholder*="Search diagnosis"]')
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(data.diagnosis, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 3. Select Verification (Dropdown)
    if (data.verification) {
      this.medicalHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('[role="combobox"], .MuiSelect-select')
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(data.verification)
        .should('be.visible')
        .click({ force: true });
    }

    // 4. Select Clinical Status (Dropdown)
    if (data.clinicalStatus) {
      this.medicalHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(2)
        .find('[role="combobox"], .MuiSelect-select')
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(data.clinicalStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 5. Expand Additional Details
    this.medicalHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.medicalHxContainer.contains('button', /Hide additional details/i, { timeout: 30000 }).should('be.visible');

    // 6. Fill Onset (Age & Comment)
    if (data.onsetAge || data.onsetComment) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^ONSET$/i)
        .closest('.MuiBox-root, div')
        .parent()
        .within(() => {
          if (data.onsetAge) {
            cy.get('input[placeholder*="Years"]').first().clear({ force: true }).type(data.onsetAge, { force: true });
          }
          if (data.onsetComment) {
            cy.get('input[placeholder*="Note"]').first().clear({ force: true }).type(data.onsetComment, { force: true });
          }
        });
    }

    // 7. Fill Abatement (Age & Comment)
    if (data.abatementAge || data.abatementComment) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^ABATEMENT$/i)
        .closest('.MuiBox-root, div')
        .parent()
        .within(() => {
          if (data.abatementAge) {
            cy.get('input[placeholder*="Years"]').first().clear({ force: true }).type(data.abatementAge, { force: true });
          }
          if (data.abatementComment) {
            cy.get('input[placeholder*="Note"]').first().clear({ force: true }).type(data.abatementComment, { force: true });
          }
        });
    }

    // 8. Select Severity (Dropdown)
    if (data.severity) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Severity$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(data.severity)
        .should('be.visible')
        .click({ force: true });
    }

    // 9. Fill Body Site (Autocomplete)
    if (data.bodySite) {
      this.medicalHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search body site"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.bodySite, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 10. Fill Stage (Autocomplete)
    if (data.stage) {
      this.medicalHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search stage"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.stage, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 11. Fill Asserter (Autocomplete / Text)
    if (data.asserter) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Asserter$/i)
        .parent()
        .find('input')
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(data.asserter, { delay: 200, force: true });

      cy.get('body').then(($body) => {
        if ($body.find('li.MuiAutocomplete-option, li.autocomplete-option').length > 0) {
          cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
            .first()
            .click({ force: true });
        }
      });
    }

    // 12. Save Record (Click Blue Tick Button)
    this.medicalHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 13. Verify creation toast message
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // 14. Verify newly created Medical History record in summary card (Latest entry)
    this.medicalHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${data.diagnosis}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains(data.diagnosis).should('be.visible');
        if (data.verification) {
          cy.contains(new RegExp(data.verification, 'i')).should('be.visible');
        }
        if (data.clinicalStatus) {
          cy.contains(new RegExp(data.clinicalStatus, 'i')).should('be.visible');
        }
      });

    this.waitForLoaders();
    cy.log("✅ Medical History Creation Completed");
  }


  /**
     * Update Medical History record
     * @param {string} existingDiagnosis - Diagnosis title of the record to update
     * @param {Object} updatedData - Values to update
     */
  updateMedicalHistory(existingDiagnosis, updatedData) {
    // 1. Target the latest entry among duplicates and click to enter edit mode
    this.medicalHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .filter(`:contains("${existingDiagnosis}")`)
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + existingDiagnosis + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 2. Update Diagnosis (if provided)
    if (updatedData.diagnosis) {
      this.medicalHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="Search diagnosis"]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.diagnosis, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 3. Update Verification (Dropdown)
    if (updatedData.verification) {
      this.medicalHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('[role="combobox"], .MuiSelect-select')
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updatedData.verification)
        .should('be.visible')
        .click({ force: true });
    }

    // 4. Update Clinical Status (Dropdown)
    if (updatedData.clinicalStatus) {
      this.medicalHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(2)
        .find('[role="combobox"], .MuiSelect-select')
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updatedData.clinicalStatus)
        .should('be.visible')
        .click({ force: true });
    }

    // 5. Update Onset
    if (updatedData.onsetAge || updatedData.onsetComment) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^ONSET$/i)
        .closest('.MuiBox-root, div')
        .parent()
        .within(() => {
          if (updatedData.onsetAge) {
            cy.get('input[placeholder*="Years"]').first().clear({ force: true }).type(updatedData.onsetAge, { force: true });
          }
          if (updatedData.onsetComment) {
            cy.get('input[placeholder*="Note"]').first().clear({ force: true }).type(updatedData.onsetComment, { force: true });
          }
        });
    }

    // 6. Update Abatement
    if (updatedData.abatementAge || updatedData.abatementComment) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^ABATEMENT$/i)
        .closest('.MuiBox-root, div')
        .parent()
        .within(() => {
          if (updatedData.abatementAge) {
            cy.get('input[placeholder*="Years"]').first().clear({ force: true }).type(updatedData.abatementAge, { force: true });
          }
          if (updatedData.abatementComment) {
            cy.get('input[placeholder*="Note"]').first().clear({ force: true }).type(updatedData.abatementComment, { force: true });
          }
        });
    }

    // 7. Update Severity
    if (updatedData.severity) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Severity$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updatedData.severity)
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Update Body site
    if (updatedData.bodySite) {
      this.medicalHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search body site"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.bodySite, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 9. Update Stage
    if (updatedData.stage) {
      this.medicalHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search stage"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.stage, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 10. Update Asserter
    if (updatedData.asserter) {
      this.medicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Asserter$/i)
        .parent()
        .find('input')
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.asserter, { delay: 200, force: true });

      cy.get('body').then(($body) => {
        if ($body.find('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 }).length > 0) {
          cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
            .first()
            .click({ force: true });
        }
      });
    }

    // 11. Save Updated Record (Click Blue Tick Button)
    this.medicalHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 12. Verify update toast message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // 13. Verify updated record in summary card
    const targetDiagnosis = updatedData.diagnosis || existingDiagnosis;
    this.medicalHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${targetDiagnosis}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains(targetDiagnosis).should('be.visible');
        if (updatedData.verification) {
          cy.contains(new RegExp(updatedData.verification, 'i')).should('be.visible');
        }
        if (updatedData.clinicalStatus) {
          cy.contains(new RegExp(updatedData.clinicalStatus, 'i')).should('be.visible');
        }
      });
    this.waitForLoaders();
    cy.log("✅ Medical History Update Completed");
  }

  /**
   * Delete Medical History record
   * @param {string} diagnosisTitle - Diagnosis title of the record to delete
   */
  deleteMedicalHistory(diagnosisTitle) {
    // 1. Locate the latest record by diagnosis and click the red delete button
    this.medicalHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${diagnosisTitle}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // 2. Handle SweetAlert Confirmation Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // 3. Verify deleted successfully toast message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
    cy.log("✅ Medical History Delete Completed");
  }


  // Selectors for Surgical History (New Feature)
  get surgicalHxContainer() { return cy.get("#surgicalHx"); }

  /**
   * Create Surgical History record - Initial step
   * @param {Object} data - Contains surgeryName, surgeryDate, profileType, status, category
   */
  createSurgicalHistory(data) {
    // 1. Scroll to container and click the Add '+' button
    this.surgicalHxContainer
      .scrollIntoView()
      .should('be.visible', { timeout: 300000 })
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary', { timeout: 300000 })
      .last()
      .click({ force: true });

    this.waitForLoaders();

    // 2. Fill Surgery Name (Autocomplete)
    this.surgicalHxContainer
      .find('table tbody tr')
      .first()
      .find('input[placeholder*="Search surgery / procedure"]', { timeout: 300000 })
      .should('be.visible', { timeout: 300000 })
      .clear({ force: true })
      .type(data.surgeryName, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 150000 })
      .first()
      .should('be.visible', { timeout: 300000 })
      .click({ force: true });

    const SURGICAL_HX_DATA = {
      surgeryName: "Appendectomy",
      surgeryDate: "2024-05-15",
      profileType: "Surgical (past surgeries)",
      status: "Completed",
      category: "Surgical procedure"
    };

    // 4. Expand Additional Details
    this.surgicalHxContainer
      .contains('button', /Show additional details/i, { timeout: 300000 })
      .should('be.visible', { timeout: 300000 })
      .click({ force: true });

    this.surgicalHxContainer.contains('button', /Hide additional details/i, { timeout: 300000 }).should('be.visible');

    // 5. Select Profile type (Dropdown)
    this.surgicalHxContainer
      .contains('p', /^Profile type$/i)
      .parent()
      .find('[role="combobox"], .MuiSelect-select')
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 300000 })
      .contains(data.profileType, { timeout: 300000 })
      .should('be.visible', { timeout: 300000 })
      .click({ force: true });

    // 6. Select Status (Dropdown)
    this.surgicalHxContainer
      .contains('p', /^Status$/i, { timeout: 300000 })
      .parent()
      .find('[role="combobox"], .MuiSelect-select', { timeout: 300000 })
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 300000 })
      .contains(data.status, { timeout: 300000 })
      .should('be.visible')
      .click({ force: true });

    // 6.1 Fill Performed Timing Date
    if (data.performedDate) {
      this.surgicalHxContainer
        .contains('div, p', /^PERFORMED TIMING$/i, { timeout: 300000 })
        .parent()
        .find('input[type="date"], input', { timeout: 300000 })
        .last()
        .should('be.visible')
        .clear({ force: true })
        .type(data.performedDate, { force: true });
    }

    // 7. Fill Category (Autocomplete)
    this.surgicalHxContainer
      .contains('div, p', /^Category$/i, { timeout: 300000 })
      .parent()
      .find('input', { timeout: 300000 })
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(data.category, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 8. Fill Outcome (Autocomplete)
    if (data.outcome) {
      this.surgicalHxContainer
        .find('input[placeholder*="Search outcome"]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(data.outcome, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 9. Fill Location (Plain text)
    if (data.location) {
      this.surgicalHxContainer
        .contains('div, p', /^LOCATION$/i, { timeout: 300000 })
        .parent()
        .find('input', { timeout: 300000 })
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(data.location, { force: true });
    }

    // 10. Fill Reason (Autocomplete)
    if (data.reason) {
      this.surgicalHxContainer
        .find('input[placeholder*="Search reason"]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(data.reason, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 11. Fill Body site (Autocomplete)
    if (data.bodySite) {
      this.surgicalHxContainer
        .find('input[placeholder*="Search body site"]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(data.bodySite, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 12. Fill Complication (Plain text)
    if (data.complication) {
      this.surgicalHxContainer
        .contains('div, p', /^Complication$/i, { timeout: 300000 })
        .parent()
        .find('input', { timeout: 300000 })
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(data.complication, { force: true });
    }

    // 13. Fill Follow-up (Plain text)
    if (data.followUp) {
      this.surgicalHxContainer
        .contains('div, p', /^Follow-up$/i, { timeout: 300000 })
        .parent()
        .find('input', { timeout: 300000 })
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(data.followUp, { force: true });
    }

    // 14. Fill Note (Plain text / Textarea)
    if (data.note) {
      this.surgicalHxContainer
        .find('textarea[placeholder*="Additional context..."], input[placeholder*="Additional context..."]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(data.note, { force: true });
    }

    // 15. Save Surgical History Record (Click Blue Tick Button)
    this.surgicalHxContainer
      .contains('button', /Hide additional details/i, { timeout: 300000 })
      .parent()
      .find('button.MuiIconButton-colorPrimary', { timeout: 300000 })
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 16. Verify creation toast message
    cy.contains(/created.*successfully/i, { timeout: 600000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 600000 }).should('not.exist');
    this.waitForLoaders();

    // 17. Verify newly created Surgical History record (Targets the latest/top entry among duplicates)
    this.surgicalHxContainer
      .find('.MuiAccordion-root', { timeout: 300000 })
      .filter(`:contains("${data.surgeryName}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        // Verify Surgery Name
        cy.contains(data.surgeryName).should('be.visible', { timeout: 300000 });

        // Verify Status and Outcome together or individually
        if (data.status) {
          cy.contains(new RegExp(data.status, 'i', { timeout: 300000 })).should('be.visible');
        }
        if (data.outcome) {
          cy.contains(new RegExp(data.outcome, 'i', { timeout: 300000 })).should('be.visible');
        }
      });
  }

  /**
     * Update Surgical History record - Initial step (Re-open edit mode)
     * @param {string} existingSurgeryName - Surgery name of the record to update
     * @param {Object} updatedData - Values to update
     */
  updateSurgicalHistory(existingSurgeryName, updatedData) {
    // 1. Target the specific Surgery Name text element directly (not the whole accordion header)
    this.surgicalHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 300000 })
      .filter(`:contains("${existingSurgeryName}")`)
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + existingSurgeryName + '"]', { timeout: 300000 })
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 2. Verify edit form table row is rendered
    this.surgicalHxContainer
      .find('table tbody tr', { timeout: 300000 })
      .first()
      .find('input[placeholder*="Search surgery / procedure"]', { timeout: 300000 })
      .first()
      .should('be.visible');

    // 2. Update Surgery Name (if provided)
    if (updatedData.surgeryName) {
      this.surgicalHxContainer
        .find('table tbody tr', { timeout: 300000 })
        .first()
        .find('input[placeholder*="Search surgery / procedure"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.surgeryName, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 3. Update Surgery Date (if provided)
    if (updatedData.surgeryDate) {
      this.surgicalHxContainer
        .find('table tbody tr', { timeout: 300000 })
        .first()
        .find('td', { timeout: 300000 })
        .eq(1)
        .find('input', { timeout: 300000 })
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.surgeryDate, { force: true });
    }

    // 4. Update Profile type (if provided)
    if (updatedData.profileType) {
      this.surgicalHxContainer
        .contains('p', /^Profile type$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select', { timeout: 300000 })
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 300000 })
        .contains(updatedData.profileType, { timeout: 300000 })
        .should('be.visible')
        .click({ force: true });
    }

    // 5. Update Status (Scoped to edit table/form container)
    if (updatedData.status) {
      this.surgicalHxContainer
        .find('table tbody tr', { timeout: 300000 })
        .contains('p', /^Status$/i, { timeout: 300000 })
        .parent()
        .find('[role="combobox"], .MuiSelect-select', { timeout: 300000 })
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 300000 })
        .contains(updatedData.status, { timeout: 300000 })
        .should('be.visible')
        .click({ force: true });
    }

    // 6. Update Performed Timing Date (if provided)
    if (updatedData.performedDate) {
      this.surgicalHxContainer
        .contains('div, p', /^PERFORMED TIMING$/i, { timeout: 300000 })
        .parent()
        .find('input[type="date"], input', { timeout: 300000 })
        .last()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.performedDate, { force: true });
    }

    // 7. Update Category (if provided)
    if (updatedData.category) {
      this.surgicalHxContainer
        .contains('div, p', /^Category$/i, { timeout: 300000 })
        .parent()
        .find('input', { timeout: 300000 })
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.category, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Update Outcome (if provided)
    if (updatedData.outcome) {
      this.surgicalHxContainer
        .find('input[placeholder*="Search outcome"]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.outcome, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 9. Update Location (Scoped inside edit table/form container)
    if (updatedData.location) {
      this.surgicalHxContainer
        .find('table tbody tr', { timeout: 300000 })
        .contains('div, p', /^LOCATION$/i, { timeout: 300000 })
        .parent()
        .find('input', { timeout: 300000 })
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.location, { force: true });
    }

    // 10. Update Reason (if provided)
    if (updatedData.reason) {
      this.surgicalHxContainer
        .find('input[placeholder*="Search reason"]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.reason, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 11. Update Body site (if provided)
    if (updatedData.bodySite) {
      this.surgicalHxContainer
        .find('input[placeholder*="Search body site"]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.bodySite, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 12. Update Complication (Scoped inside edit table/form container)
    if (updatedData.complication) {
      this.surgicalHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Complication$/i, { timeout: 300000 })
        .parent()
        .find('input', { timeout: 300000 })
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.complication, { force: true });
    }

    // 13. Update Follow-up (Scoped inside edit table/form container)
    if (updatedData.followUp) {
      this.surgicalHxContainer
        .find('table tbody tr', { timeout: 300000 })
        .contains('div, p', /^Follow-up$/i, { timeout: 300000 })
        .parent()
        .find('input')
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.followUp, { force: true });
    }

    // 14. Update Note (Scoped inside edit table/form container)
    if (updatedData.note) {
      this.surgicalHxContainer
        .find('table tbody tr', { timeout: 300000 })
        .find('textarea[placeholder*="Additional context..."], input[placeholder*="Additional context..."]', { timeout: 300000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.note, { force: true });
    }

    // 15. Save Updated Surgical History (Click Blue Tick Button)
    this.surgicalHxContainer
      .contains('button', /Hide additional details/i, { timeout: 300000 })
      .parent()
      .find('button.MuiIconButton-colorPrimary', { timeout: 300000 })
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 16. Verify update toast message
    cy.contains(/updated.*successfully/i, { timeout: 600000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 600000 }).should('not.exist');
    this.waitForLoaders();

    // 17. Verify updated record in the latest accordion card
    const targetSurgeryName = updatedData.surgeryName || existingSurgeryName;
    this.surgicalHxContainer
      .find('.MuiAccordion-root', { timeout: 300000 })
      .filter(`:contains("${targetSurgeryName}")`, { timeout: 300000 })
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains(targetSurgeryName, { timeout: 300000 }).should('be.visible');
        if (updatedData.status) {
          cy.contains(new RegExp(updatedData.status, 'i', { timeout: 300000 })).should('be.visible');
        }
        if (updatedData.outcome) {
          cy.contains(new RegExp(updatedData.outcome, 'i', { timeout: 300000 })).should('be.visible');
        }
      });
  }

  /**
 * Delete Surgical History record
 * @param {string} surgeryName - Surgery name of the record to delete
 */
  deleteSurgicalHistory(surgeryName) {
    // 1. Locate the latest record by surgery name and click the red delete button
    this.surgicalHxContainer
      .find('.MuiAccordion-root', { timeout: 600000 })
      .filter(`:contains("${surgeryName}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError', { timeout: 600000 })
      .should('be.visible')
      .click({ force: true });

    // 2. Handle SweetAlert Confirmation Modal
    cy.get('.swal2-popup', { timeout: 300000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // 3. Verify deleted successfully toast message
    cy.contains(/deleted.*successfully/i, { timeout: 600000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 600000 }).should('not.exist');
    this.waitForLoaders();
  }



  // Selectors for Family History (New Feature)
  get familyHxContainer() { return cy.get("#familyHx"); }

  /**
    * Create Family History - Initial step (Diagnosis & Relationship)
    * @param {Object} data - Contains diagnosis search query and relationship
    */
  createFamilyHistory(data) {
    // 1. Scroll container into view and click the Add '+' button
    this.familyHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    this.waitForLoaders();

    // 2. Type Diagnosis and select first option from autocomplete
    this.familyHxContainer
      .find('table tbody tr')
      .first()
      .find('input[placeholder*="Search"]')
      .first()
      .should('be.visible')
      .clear({ force: true })
      .type(data.diagnosis, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 300000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 3. Select Relationship from dropdown
    this.familyHxContainer
      .find('table tbody tr')
      .first()
      .find('input[placeholder*="Select relationship"]')
      .should('be.visible')
      .click({ force: true });

    // 4. Choose relationship option from the opened dropdown list
    cy.get('li.MuiAutocomplete-option, li[role="option"]', { timeout: 10000 })
      .contains(data.relationship)
      .should('be.visible')
      .click({ force: true });

    // 5. Expand and wait for Additional Details
    this.familyHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.familyHxContainer.contains('button', /Hide additional details/i).should('be.visible');
    this.familyHxContainer.contains(/Conditions/i).should('be.visible');
    this.familyHxContainer.contains(/Procedures/i).should('be.visible');
    this.familyHxContainer.contains(/Reasons/i).should('be.visible');

    // 6. Fill Condition (Autocomplete)
    this.familyHxContainer
      .contains('p', /^Condition$/i)
      .parent()
      .find('input[placeholder*="Search"]')
      .should('be.visible')
      .clear({ force: true })
      .type(data.condition, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 7. Fill Age & Comment
    this.familyHxContainer
      .contains('div, p', /^Age$/i)
      .parent()
      .find('input')
      .first()
      .clear({ force: true })
      .type(data.age, { force: true });

    this.familyHxContainer
      .find('input[placeholder*="e.g. around age 40"]')
      .should('be.visible')
      .clear({ force: true })
      .type(data.comment, { force: true });

    // 8. Select Outcome (Dropdown)
    this.familyHxContainer
      .contains('div, p', /^Outcome$/i)
      .parent()
      .find('[role="combobox"], .MuiSelect-select')
      .click({ force: true });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(data.outcome)
      .should('be.visible')
      .click({ force: true });

    // 9. Check Contributed to death
    this.familyHxContainer
      .contains('p', /^Contributed to death$/i)
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true });

    this.familyHxContainer
      .find('input[placeholder*="Note about this condition"]')
      .should('be.visible')
      .clear({ force: true })
      .type(data.note, { force: true });

    // 10. Fill Procedures Section
    cy.get('#family-history-section-procedures')
      .scrollIntoView()
      .within(() => {
        // Procedure Autocomplete
        cy.get('input[placeholder*="Search procedure"]')
          .should('be.visible')
          .clear({ force: true })
          .type(data.procedure, { delay: 200, force: true });
      });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.get('#family-history-section-procedures').within(() => {
      // Age & Comment
      cy.contains('div, p', /^Age$/i)
        .parent()
        .find('input')
        .first()
        .clear({ force: true })
        .type(data.procedureAge, { force: true });

      cy.get('input[placeholder*="e.g. around age 50"]')
        .should('be.visible')
        .clear({ force: true })
        .type(data.procedureComment, { force: true });

    });

    // 11. Fill Reasons Section
    cy.get('#family-history-section-reasons')
      .scrollIntoView()
      .within(() => {
        // Reason Autocomplete
        cy.get('input[placeholder*="Search clinical finding"]')
          .should('be.visible')
          .clear({ force: true })
          .type(data.reason, { delay: 200, force: true });
      });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.get('#family-history-section-reasons').within(() => {
      // Reference type Autocomplete
      cy.get('input[placeholder*="Search procedure"]')
        .should('be.visible')
        .clear({ force: true })
        .type(data.referenceType, { delay: 200, force: true });
    });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // 12. Fill Personal Details Section
    cy.get('#family-history-section-personal')
      .scrollIntoView()
      .within(() => {
        // Relative name (Text field)
        cy.get('input[placeholder*="Relative name"]')
          .should('be.visible')
          .clear({ force: true })
          .type(data.relativeName, { force: true });

        // Sex (Dropdown)
        cy.contains('p', /^Sex$/i)
          .parent()
          .find('[role="combobox"], .MuiSelect-select')
          .click({ force: true });
      });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(data.sex)
      .should('be.visible')
      .click({ force: true });

    cy.get('#family-history-section-personal').within(() => {
      // Status (Dropdown)
      cy.contains('p', /^Status$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .click({ force: true });
    });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(data.status)
      .should('be.visible')
      .click({ force: true });

    cy.get('#family-history-section-personal').within(() => {
      // Data absent reason (Dropdown)
      cy.contains('p', /^Data absent reason$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .click({ force: true });
    });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(data.dataAbsentReason)
      .should('be.visible')
      .click({ force: true });

    cy.get('#family-history-section-personal').within(() => {
      // Comment (Text field)
      cy.get('input[placeholder*="e.g. early 1950s"]')
        .should('be.visible')
        .clear({ force: true })
        .type(data.personalComment, { force: true });

      // Note (Textarea)
      cy.get('textarea[placeholder*="General note about the relative"], input[placeholder*="General note about the relative"]')
        .should('be.visible')
        .clear({ force: true })
        .type(data.note, { force: true });
    });

    // 13. Save Family History Record (Click Blue Tick Button)
    this.familyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 14. Verification: Toast message
    cy.contains(/created.*successfully/i, { timeout: 600000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 600000 }).should('not.exist');
    this.waitForLoaders();

    // 15. Verify created Family History record in the summary card
    this.familyHxContainer
      .contains('.MuiAccordion-root', data.diagnosis)
      .should('be.visible')
      .within(() => {
        cy.contains(data.diagnosis).should('be.visible');
        cy.contains(new RegExp(`Relationship:\\s*${data.relationship}`, 'i')).should('be.visible');
        cy.contains(new RegExp(`Condition:\\s*${data.condition}`, 'i')).should('be.visible');
        cy.contains(new RegExp(`Procedure:\\s*${data.procedure}`, 'i')).should('be.visible');
      });
    this.waitForLoaders();
    cy.log("✅ Creation Completed")

  }


  /**
     * Update Family History record
     * @param {string} existingDiagnosis - Diagnosis title of the record to update
     * @param {Object} updatedData - Values to update
     */
  updateFamilyHistory(existingDiagnosis, updatedData) {
    // 1. Locate the latest card by diagnosis and click its text to enter edit mode
    this.familyHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .filter(`:contains("${existingDiagnosis}")`)
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + existingDiagnosis + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 2. Update Diagnosis (if provided)
    if (updatedData.diagnosis) {
      this.familyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="Search"]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.diagnosis, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 30000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 3. Update Relationship (if provided)
    if (updatedData.relationship) {
      this.familyHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="Select relationship"]')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });

      cy.get('li.MuiAutocomplete-option, li[role="option"]', { timeout: 10000 })
        .contains(updatedData.relationship)
        .should('be.visible')
        .click({ force: true });
    }

    // 4. Update Condition (if provided)
    if (updatedData.condition) {
      this.familyHxContainer
        .contains('p', /^Condition$/i)
        .parent()
        .find('input[placeholder*="Search"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.condition, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 5. Update Age & Comment (if provided)
    if (updatedData.age) {
      this.familyHxContainer
        .contains('div, p', /^Age$/i)
        .parent()
        .find('input')
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.age, { force: true });
    }

    if (updatedData.comment) {
      this.familyHxContainer
        .find('input[placeholder*="e.g. around age 40"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.comment, { force: true });
    }

    // 6. Update Outcome (if provided)
    if (updatedData.outcome) {
      this.familyHxContainer
        .contains('div, p', /^Outcome$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updatedData.outcome)
        .should('be.visible')
        .click({ force: true });
    }

    // 7. Update Condition Note (if provided)
    if (updatedData.note) {
      this.familyHxContainer
        .find('input[placeholder*="Note about this condition"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.note, { force: true });
    }

    // 8. Update Procedures Section
    if (updatedData.procedure) {
      cy.get('#family-history-section-procedures')
        .scrollIntoView()
        .within(() => {
          cy.get('input[placeholder*="Search procedure"]')
            .clear({ force: true })
            .type(updatedData.procedure, { delay: 200, force: true });
        });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    if (updatedData.procedureAge) {
      cy.get('#family-history-section-procedures').within(() => {
        cy.contains('div, p', /^Age$/i)
          .parent()
          .find('input')
          .first()
          .clear({ force: true })
          .type(updatedData.procedureAge, { force: true });
      });
    }

    // 9. Update Reasons Section
    if (updatedData.reason) {
      cy.get('#family-history-section-reasons')
        .scrollIntoView()
        .within(() => {
          cy.get('input[placeholder*="Search clinical finding"]')
            .clear({ force: true })
            .type(updatedData.reason, { delay: 200, force: true });
        });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option', { timeout: 15000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 10. Update Personal Details Section
    if (updatedData.relativeName) {
      cy.get('#family-history-section-personal')
        .scrollIntoView()
        .within(() => {
          cy.get('input[placeholder*="Relative name"]')
            .clear({ force: true })
            .type(updatedData.relativeName, { force: true });
        });
    }

    if (updatedData.sex) {
      cy.get('#family-history-section-personal')
        .contains('p', /^Sex$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 10000 })
        .contains(updatedData.sex)
        .should('be.visible')
        .click({ force: true });
    }

    // 11. Save Updated Record (Click Blue Tick Button)
    this.familyHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 12. Verify update toast message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // 13. Verify updated record in summary card
    const targetDiagnosis = updatedData.diagnosis || existingDiagnosis;
    this.familyHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${targetDiagnosis}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains(targetDiagnosis).should('be.visible');
        if (updatedData.relationship) {
          cy.contains(new RegExp(`Relationship:\\s*${updatedData.relationship}`, 'i')).should('be.visible');
        }
      });
    this.waitForLoaders();
    cy.log("✅ Update Completed");
  }

  /**
   * Delete Family History record
   * @param {string} diagnosisTitle - Diagnosis title of the record to delete
   */
  deleteFamilyHistory(diagnosisTitle) {
    // 1. Locate the latest record by diagnosis title and click the red delete button
    this.familyHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${diagnosisTitle}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // 2. Handle SweetAlert Confirmation Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // 3. Verify deleted successfully toast message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
    cy.log("✅ Delete Completed");
  }




  // Selectors for Social History (New Feature)
  get socialHxContainer() { return cy.get("#socialHx"); }

  /**
   * Create Social History record - Initial step up to Method
   * @param {Object} data - Contains observation, startDate, endDate, note, bodySite, method
   */
  createSocialHistory(data) {
    // 1. Scroll to container and click the Add '+' button
    this.socialHxContainer
      .scrollIntoView()
      .should('be.visible')
      .find('.chart-header button.MuiIconButton-colorPrimary, button.MuiIconButton-colorPrimary')
      .last()
      .click({ force: true });

    this.waitForLoaders();

    // 2. Fill Observation (Autocomplete/Dropdown)
    this.socialHxContainer
      .find('table tbody tr')
      .first()
      .find('input[placeholder*="Select or type observation"]')
      .first()
      .should('be.visible')
      .click({ force: true })
      .clear({ force: true })
      .type(data.observation, { delay: 200, force: true });

    cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
      .contains(data.observation)
      .should('be.visible')
      .click({ force: true });

    // 3. Fill Start Date (Target 2nd cell)
    if (data.startDate) {
      this.socialHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(data.startDate, { force: true });
    }

    // 4. Fill End Date (Target 3rd cell)
    if (data.endDate) {
      this.socialHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(2)
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(data.endDate, { force: true });
    }

    // 5. Expand Additional Details
    this.socialHxContainer
      .contains('button', /Show additional details/i)
      .should('be.visible')
      .click({ force: true });

    this.socialHxContainer.contains('button', /Hide additional details/i, { timeout: 30000 }).should('be.visible');

    // 6. Fill Note (Context section)
    if (data.note) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('textarea[placeholder*="Additional context..."], input[placeholder*="Additional context..."]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.note, { force: true });
    }

    // 7. Fill Body site (Autocomplete)
    if (data.bodySite) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search body site"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.bodySite, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 300000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 8. Fill Method (Plain text)
    if (data.method) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Patient-reported, Polymerase chain reaction"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.method, { force: true });
    }

    // 9. Fill Components Section (Code dropdown & Value input)
    if (data.componentCode) {
      this.socialHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Code$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 30000 })
        .contains(data.componentCode)
        .should('be.visible')
        .click({ force: true });
    }

    if (data.componentValue) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="e.g. 20"]')
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(data.componentValue, { force: true });
    }

    // 10. Fill Interpretations (Autocomplete)
    if (data.interpretation) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search and add interpretations..."]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.interpretation, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 11. Fill Performers Section (Type dropdown & Person Autocomplete)
    if (data.performerType) {
      this.socialHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Type$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 30000 })
        .contains(data.performerType)
        .should('be.visible')
        .click({ force: true });
    }

    if (data.performerPerson) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search person..."]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.performerPerson, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 12. Save Social History Record (Click Blue Tick Button)
    this.socialHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 13. Verify creation toast message
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/created.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // 14. Verify newly created Social History record in the summary list
    this.socialHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${data.observation}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains(data.observation).should('be.visible');
      });
  }

  /**
   * Update Social History record
   * @param {string} existingObservation - Observation title of the record to update
   * @param {Object} updatedData - Values to update
   */
  updateSocialHistory(existingObservation, updatedData) {
    // 1. Target the specific Observation text element directly to open edit mode
    this.socialHxContainer
      .find('.MuiAccordionSummary-root', { timeout: 60000 })
      .filter(`:contains("${existingObservation}")`)
      .first()
      .find('div[class*="MuiTypography-body1"], div[aria-label*="' + existingObservation + '"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 2. Update Observation (if provided)
    if (updatedData.observation) {
      this.socialHxContainer
        .find('table tbody tr')
        .first()
        .find('input[placeholder*="Select or type observation"]')
        .first()
        .should('be.visible')
        .click({ force: true })
        .clear({ force: true })
        .type(updatedData.observation, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
        .contains(updatedData.observation)
        .should('be.visible')
        .click({ force: true });
    }

    // 3. Update Start Date (Target 2nd cell)
    if (updatedData.startDate) {
      this.socialHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(1)
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.startDate, { force: true });
    }

    // 4. Update End Date (Target 3rd cell)
    if (updatedData.endDate) {
      this.socialHxContainer
        .find('table tbody tr')
        .first()
        .find('td')
        .eq(2)
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(updatedData.endDate, { force: true });
    }

    // 5. Update Note
    if (updatedData.note) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('textarea[placeholder*="Additional context..."], input[placeholder*="Additional context..."]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.note, { force: true });
    }

    // 6. Update Body site (Autocomplete)
    if (updatedData.bodySite) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search body site"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.bodySite, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 7. Update Method (Plain text)
    if (updatedData.method) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Patient-reported, Polymerase chain reaction"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.method, { force: true });
    }

    // 8. Update Components Section
    if (updatedData.componentCode) {
      this.socialHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Code$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 30000 })
        .contains(updatedData.componentCode)
        .should('be.visible')
        .click({ force: true });
    }

    if (updatedData.componentValue) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="e.g. 20"]')
        .first()
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.componentValue, { force: true });
    }

    // 9. Update Interpretations (Autocomplete)
    if (updatedData.interpretation) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search and add interpretations..."]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.interpretation, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 10. Update Performers Section
    if (updatedData.performerType) {
      this.socialHxContainer
        .find('table tbody tr')
        .contains('div, p', /^Type$/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .scrollIntoView()
        .click({ force: true });

      cy.get('li[role="option"]', { timeout: 30000 })
        .contains(updatedData.performerType)
        .should('be.visible')
        .click({ force: true });
    }

    if (updatedData.performerPerson) {
      this.socialHxContainer
        .find('table tbody tr')
        .find('input[placeholder*="Search person..."]')
        .scrollIntoView()
        .clear({ force: true })
        .type(updatedData.performerPerson, { delay: 200, force: true });

      cy.get('li.MuiAutocomplete-option, li.autocomplete-option, li[role="option"]', { timeout: 30000 })
        .first()
        .should('be.visible')
        .click({ force: true });
    }

    // 11. Save Updated Record (Click Blue Tick Button)
    this.socialHxContainer
      .contains('button', /Hide additional details/i)
      .parent()
      .find('button.MuiIconButton-colorPrimary')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 12. Verify update toast message
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();

    // 13. Verify updated record in the latest accordion card
    const targetObservation = updatedData.observation || existingObservation;
    this.socialHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${targetObservation}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.contains('div[class*="MuiTypography-body1"]', targetObservation)
          .should('be.visible');
      });
  }

  /**
   * Delete Social History record
   * @param {string} observationTitle - Observation title of the record to delete
   */
  deleteSocialHistory(observationTitle) {
    // 1. Locate the latest record by observation title and click the red delete button
    this.socialHxContainer
      .find('.MuiAccordion-root', { timeout: 60000 })
      .filter(`:contains("${observationTitle}")`)
      .first()
      .scrollIntoView()
      .should('be.visible')
      .find('button.MuiIconButton-colorError')
      .should('be.visible')
      .click({ force: true });

    // 2. Handle SweetAlert Confirmation Modal
    cy.get('.swal2-popup', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        cy.contains(/Are you sure\?/i).should('be.visible');
        cy.contains(/You won't be able to revert this!/i).should('be.visible');
        cy.contains('button', 'Yes, delete it!')
          .should('be.visible')
          .click({ force: true });
      });

    this.waitForLoaders();

    // 3. Verify deleted successfully toast message
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('be.visible');
    cy.contains(/deleted.*successfully/i, { timeout: 60000 }).should('not.exist');
    this.waitForLoaders();
  }


  // Selectors for Administrator Notes
  get adminNotesContainer() { return cy.get("#adminNotes"); }
  get addAdminNoteBtn() { return this.adminNotesContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Administrator Notes
   */
  administratorNotesCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialNote = "Admin verification completed ID: " + idCreate;
    const updatedNote = "Priority verification updated ID: " + idUpdate;

    // --- CREATE PART ---
    this.addAdminNoteBtn.click({ force: true });

    this.adminNotesContainer.find("table tbody tr").first().as('adminNewRow').within(() => {
      // Index 0: Date, Index 1: Note content
      cy.get("td").eq(0).find("input").first().type("2026-02-03", { force: true });
      cy.get("td").eq(1).find("input").first().type(initialNote, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#adminNotes tr", idCreate.toString())
      .scrollIntoView()
      .as("adminRowToUpdate");

    // Click to enter edit mode
    cy.get("@adminRowToUpdate").find("td").first().click({ force: true });

    cy.get("@adminRowToUpdate").within(() => {
      // Wait for input fields to render properly after edit trigger
      cy.get("input", { timeout: 120000 }).should("be.visible");
      cy.get("td").eq(1).find("input").first().clear({ force: true }).type(updatedNote, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#adminNotes tr", idUpdate.toString())
      .scrollIntoView()
      .as("adminRowToDelete");

    // Trigger row activation for action buttons
    cy.get("@adminRowToDelete").click({ force: true });

    cy.get("@adminRowToDelete").within(() => {
      cy.get("input", { timeout: 120000 }).should("be.visible");
      // Specific target for red delete icon
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();
  }

  // Selectors for Orders
  get ordersContainer() { return cy.get("#orders"); }
  get addOrderBtn() { return this.ordersContainer.find("button.MuiIconButton-colorPrimary").first(); }

  /**
   * Complete CRUD operation for Medication Order
   */
  medicationOrderCRUD() {
    const medName = "copaxone";
    const initialDuration = "3 days";
    const updatedDuration = "7 days";
    const initialDispense = "120";
    const updatedDispense = "360";

    // --- CREATE PART ---
    cy.log("✅ CREATE OPERATION STARTS")

    this.addOrderBtn.scrollIntoView().click({ force: true });

    // Search for medication
    this.ordersContainer.find('input[placeholder="Add new order"]')
      .first()
      .should("be.enabled")
      .click({ force: true })
      .clear({ force: true })
      .type(medName, { delay: 600, force: true });


    cy.wait(3000);

    cy.get('body').then(($body) => {
      // Logic Fix: Search for the variable 'medName' instead of hardcoded 'COPAXONE'
      const drugRegex = new RegExp(medName, 'i');
      const specificDrug = $body.find('li.autocomplete-option').filter((i, el) => drugRegex.test(el.innerText));

      if (specificDrug.length > 0) {
        cy.log(`>>> Selecting ${medName} from list.`);
        cy.wrap(specificDrug).first().click({ force: true });
      } else {
        cy.log(">>> Specific drug not found. Clicking 'Create as new medicine'.");
        // Improved selector for 'Create as new' option
        cy.contains('li.autocomplete-option', /as a new medicine/i, { timeout: 60000 })
          .should('be.visible')
          .click({ force: true });
      }
    });


    this.waitForLoaders();
    cy.wait(2000);


    // 2. Conditional Logic: Detect if the form is Dose-based (Tablet) or Drops-based (Solution)
    cy.get('body').then(($body) => {

      if ($body.find('span:contains("Dose")').length > 0) {
        // --- SCENARIO A: TABLET/CAPSULE FORM (DOSE BASED) ---
        cy.log(">>> Dose-based medication detected.");

        cy.contains("span", /Dose/i).next().find("input").first().clear({ force: true }).type("40", { force: true });
        cy.get('li[role="option"]').contains("40 mg").click({ force: true });

        cy.contains("span", /Dispense/i).next().find("input").first().type("120", { force: true });

        // Fill Duration
        cy.contains('span', /Duration/i).next().find('input').first()
          .should('be.visible').clear({ force: true }).type("7 days", { force: true });

        cy.contains('span', /Frequency/i).next().find('input').first()
          .should('be.visible').clear({ force: true }).type("Three Times Daily (TID)", { force: true });
      }
      else if ($body.find('span:contains("Drops")').length > 0) {
        // --- SCENARIO B: SOLUTION/EYE DROPS FORM (DROPS BASED) ---
        cy.log(">>> Drops-based medication detected.");

        // Fill Duration
        cy.contains('span', /Duration/i).next().find('input').first()
          .should('be.visible').clear({ force: true }).type("7 days", { force: true });

        cy.contains('span', /Frequency/i).next().find('input').first()
          .should('be.visible').clear({ force: true }).type("Three Times Daily (TID)", { force: true });

        // Fill Total Drops
        cy.contains('span', /Total Drops/i).next().find('input').first()
          .should('be.visible').clear({ force: true }).type("10", { force: true });

        // Fill Bottles
        cy.contains('span', /Bottles/i).next().find('input').first()
          .should('be.visible').clear({ force: true }).type("1", { force: true });


      }
      // 3. Finalize: Click SAVE button
      cy.contains("button", /^SAVE$/i).should("be.enabled").click({ force: true });

      this.waitForLoaders();
      cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("be.visible");
      cy.contains(/ *created.*successfully/i, { timeout: 120000 }).should("not.exist");

      cy.log("✅ CREATE OPERATION ENDS")


    });

    // --- UPDATE PART ---
    cy.log("✅ UPDATE OPERATION STARTS");

    // 1. Target the created order and click to enter edit mode
    cy.contains("#orders div", new RegExp(medName, 'i'), { timeout: 120000 })
      .should("be.visible")
      .click({ force: true });

    this.waitForLoaders();
    cy.wait(2000);

    // 2. Conditional Logic to detect and fill update fields
    cy.get('body').then(($body) => {

      // Duration field is common to both formats
      cy.contains("span", /Duration/i).next().find("input").first()
        .clear({ force: true }).type(updatedDuration, { force: true });

      if ($body.find('span:contains("Dispense")').length > 0) {
        // --- SCENARIO A: DOSE BASED UPDATE ---
        cy.log(">>> Updating Dose-based fields.");
        cy.contains("span", /Dispense/i).next().find("input").first()
          .clear({ force: true }).type(updatedDispense, { force: true });
      }
      else if ($body.find('span:contains("Total Drops")').length > 0) {
        // --- SCENARIO B: DROPS BASED UPDATE ---
        cy.log(">>> Updating Drops-based fields.");

        // Update Total Drops
        cy.contains("span", /Total Drops/i).next().find("input").first()
          .clear({ force: true }).type("20", { force: true }); // Using a new value for update

        // Update Bottles
        cy.contains("span", /Bottles/i).next().find("input").first()
          .clear({ force: true }).type("2", { force: true });
      }
    });

    // 3. Save and Verify
    cy.contains("button", /^SAVE$/i).should('be.visible', { timeout: 120000 }).click({ force: true });

    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("not.exist");

    cy.log("✅ UPDATE OPERATION ENDS");
    this.waitForLoaders();

    // --- DELETE PART ---
    // Ensuring the edit mode is closed (as seen in your logs)
    cy.log("✅ DELETE OPERATION STARTS")

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("CLOSE")').length > 0) {
        cy.contains('button', /CLOSE/i).click({ force: true });
        this.waitForLoaders();
      }
    });

    // Targeting the row again to ensure fresh DOM reference
    cy.contains("#orders div", new RegExp(medName, 'i'), { timeout: 120000 })
      .closest(".MuiPaper-root")
      .filter(`:contains("${updatedDuration}")`)
      .as('medRowToDelete');

    cy.get("@medRowToDelete").within(() => {

      cy.get('svg', { timeout: 120000 })
        .filter((index, el) => {
          const color = Cypress.$(el).css('color') || Cypress.$(el).css('fill');
          return color.includes('rgb(211, 47, 47)') || color.includes('red');
        })
        .first()
        .should('exist')
        .click({ force: true });
    });

    // Handle Confirmation Modal
    cy.contains("Are you sure?", { timeout: 120000 }).should("be.visible");
    cy.contains("button", "Yes, Delete").click({ force: true });

    // Final Success Verification
    cy.contains("medication has been removed.", { timeout: 120000 }).should("be.visible");
    cy.contains("button", "OK").click({ force: true });
    cy.log("✅ DELETE OPERATION ENDS")

    this.waitForLoaders();
  }

  /**
   * Complete Creation and Verification for Image Order (Requisition)
   */
  imageOrderCRUD() {
    const requisitionId = Math.floor(Math.random() * 10000);
    const examName = "Chest " + requisitionId;

    // --- CREATE PART ---
    this.addOrderBtn.scrollIntoView().click({ force: true });
    this.waitForLoaders();

    // Search for x-ray
    this.ordersContainer.find('input[placeholder="Add new order"]')
      .first()
      .clear({ force: true })
      .type("x-ray", { delay: 200, force: true });

    // Select 'Imaging Requisition' from autocomplete
    cy.contains('div', /Imaging Requisition/i, { timeout: 120000 })
      .closest('div[style*="sticky"]')
      .nextAll('li.autocomplete-option')
      .first()
      .should("be.visible")
      .click({ force: true });

    this.waitForLoaders();

    // Fill Exam Requested
    cy.get('input[placeholder="Example: Chest"]')
      .should("be.visible")
      .type(examName, { force: true });

    // Fill History/Medications (Textarea)
    cy.get("textarea")
      .first()
      .type("History of chronic cough. ID: " + requisitionId, { force: true });

    // Fill Specify Site
    cy.contains("span", /Specify Site/i)
      .parent()
      .find("input")
      .first()
      .type("Right Lung", { force: true });

    // Select Priority (Urgent)
    cy.contains("label", /Urgent/i).click({ force: true });

    // Save Requisition
    cy.contains("button", /^SAVE$/i).should("be.enabled").click({ force: true });

    this.waitForLoaders();

    // Verification: Ensure the unique order appears in the list
    cy.contains(examName, { timeout: 120000 }).should("be.visible");


    // --- UPDATE PART ---
    const updatedExamName = "Updated Chest " + requisitionId;

    // 1. Locate the specific order card and scroll to it
    cy.contains("#orders .MuiPaper-root", examName, { timeout: 120000 })
      .scrollIntoView()
      .should("be.visible")
      .as('targetOrderCard');

    // 2. Click the Accordion Header to expand (This is the most stable way)
    // Instead of looking for a specific SVG, we click the entire summary bar
    cy.get('@targetOrderCard').find('.MuiAccordionSummary-root').click({ force: true });

    // 3. Wait for the expansion animation to complete
    cy.wait(2000);

    // 4. Scoping the update actions inside the expanded section
    cy.get('@targetOrderCard').within(() => {
      // Look for the input field which should now be visible
      cy.get('input[placeholder="Example: Chest"]', { timeout: 120000 })
        .should('be.visible')
        .clear({ force: true })
        .type(updatedExamName, { force: true });

      // ... rest of your update code (textarea, priority, save etc.) ...
      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    // 5. Verification
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();
  }


  /**
   * Complete Creation and Verification for Lab Order (Requisition)
   */
  labOrderCRUD() {
    // --- CREATE PART ---
    this.addOrderBtn.scrollIntoView().click({ force: true });
    this.waitForLoaders();

    // Type "lab requisition" in the search input
    this.ordersContainer.find('input[placeholder="Add new order"]')
      .first()
      .clear({ force: true })
      .type("lab requisition", { delay: 200, force: true });

    // Select 'Lab Requisition' from autocomplete
    cy.contains('div', /Lab Requisition/i, { timeout: 120000 })
      .closest('div[style*="sticky"]')
      .nextAll('li.autocomplete-option')
      .first()
      .should("be.visible")
      .click({ force: true });

    this.waitForLoaders();

    // Ensure the laboratory requisition form is loaded
    cy.contains(/LABORATORY REQUISITION/i, { timeout: 60000 }).should("be.visible");

    // Target the specific accordion container and click SAVE
    cy.contains(".MuiAccordion-root", /LABORATORY REQUISITION/i)
      .first()
      .within(() => {
        cy.get("button")
          .contains(/^SAVE$/i)
          .should("exist")
          .click({ force: true });
      });

    this.waitForLoaders();
  }

  /**
   * Complete Creation for Lab Order (Requisition)
   */
  // Selectors for Progress Notes
  get notesContainer() { return cy.get("#notes"); }
  get addNoteBtn() { return this.notesContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Progress Notes (including Versioning)
   */

  progressNoteCRUD() {
    const noteId = Math.floor(Math.random() * 1000);
    const updateId = Math.floor(Math.random() * 1000);

    // --- CREATE PART ---
    this.addNoteBtn.click({ force: true });
    cy.contains("li", /New Progress Note/i, { timeout: 120000 }).click({ force: true });
    this.waitForLoaders();

    // Fill Note Information (Header)
    cy.contains("Note Information").closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000);
    cy.contains("div", /Note Information/i).closest(".MuiBox-root").within(() => {
      cy.get("textarea, input").eq(0).clear({ force: true }).type("Follow-up session " + noteId, { force: true });
      // cy.get("input").eq(1).clear({ force: true }).type("Daily Note " + noteId, { force: true });
      cy.get("input").eq(2).clear({ force: true }).type("2026-02-03", { force: true });
      cy.contains("button", /SAVE/i).click({ force: true });
    });

    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();

    // Write in Monaco Editor
    cy.get(".monaco-editor", { timeout: 120000 }).first().click({ force: true })
      .find("textarea").first().type("Stable condition. Note ID: " + noteId, { force: true, delay: 10 });



    cy.wait(5000);

    // Sign the Note
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SIGN$/i).should("be.visible").click({ force: true });
    });
    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });


    this.waitForLoaders();
    // Verify "Signed" status in table
    this.notesContainer.contains("tr", "Follow-up session " + noteId).within(() => {
      cy.contains("Signed", { timeout: 120000 }).should("be.visible");
    });

    this.waitForLoaders();

    // --- UPDATE ---
    // Click edit icon for the signed note
    this.notesContainer.contains("tr", "Follow-up session " + noteId).find('button[aria-label="edit"]').first().click({ force: true });
    this.waitForLoaders();

    // Trigger versioning
    cy.contains("button", /^PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^EDIT$/i).click({ force: true });
    });
    cy.contains("button", /Confirm/i).click({ force: true });
    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();

    // Update Title for Version 2
    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000);

    cy.contains("span", /Reason of Visit/i).next().find("input").first().clear({ force: true }).type("Updated Progress Reason " + updateId, { force: true });

    cy.contains("div", /Note Information/i).closest(".MuiBox-root").within(() => {


      cy.contains("button", /SAVE/i).click({ force: true });
    })

    this.waitForLoaders();
    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    // Sign Version 2
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    // Final verification of status
    this.notesContainer.contains("tr", "Updated Progress Reason " + updateId).within(() => {
      cy.contains("Unsigned", { timeout: 120000 }).should("be.visible");
    });
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^CLOSE$/i).click({ force: true });
    });
    this.waitForLoaders();


    // --- DELETE PART ---
    // 1. Locate the updated note row in the table
    this.notesContainer.contains("tr", "Updated Progress Reason " + updateId)
      .scrollIntoView()
      .should("be.visible")
      .as('noteRowToDelete');

    // 2. Click the delete icon (trash icon) for this specific note
    cy.get('@noteRowToDelete').within(() => {
      // Targeting the red delete button
      cy.get('button[aria-label="delete"], button[aria-label="Delete"]')
        .filter('.MuiIconButton-colorError')
        .should('be.visible')
        .click({ force: true });
    });

    // 3. Handle the confirmation dialog
    cy.contains("Are you sure?", { timeout: 120000 }).should("be.visible");
    cy.contains("button", "Yes, delete it!").click({ force: true });

    // 4. Verify success message and wait for UI to stabilize
    cy.contains(/deleted.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/deleted.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();

    // 5. Verification: Ensure the deleted note title no longer exists in the table
    this.notesContainer.should('not.contain', "Updated Progress Reason " + updateId);


  }

  consultNoteCRUD() {
    const noteId = Math.floor(Math.random() * 1000);
    const updateId = Math.floor(Math.random() * 1000);

    // --- CREATE PART ---
    cy.log("✅ CREATE OPERATION STARTS")

    this.addNoteBtn.click({ force: true });
    cy.contains("li", /New Consult Note/i, { timeout: 120000 }).click({ force: true });
    this.waitForLoaders();

    // --- FILL REFERRING PROVIDER INFORMATION ---
    // 1. Target the specific Referring Provider Information container
    cy.contains("p", /Referring Provider Information/i)
      .closest(".MuiBox-root")
      .parent()
      .within(() => {
        // 2. Search for the contact
        cy.get('input[placeholder="Search Contact"]')
          .should("be.visible")
          .clear({ force: true })
          .type("mridul", { delay: 200, force: true });
      });

    // 3. Wait for the autocomplete dropdown to appear and select the first option
    cy.get("li.autocomplete-option", { timeout: 120000 })
      .first()
      .should("be.visible")
      .click({ force: true });

    // 4. Click the SAVE button specifically belonging to the Referring Provider section
    cy.contains("p", /Referring Provider Information/i)
      .closest(".MuiBox-root")
      .parent()
      .parent()
      .within(() => {
        cy.contains("button", /^SAVE$/i).click({ force: true });
      });



    // 5. Verification and stability wait
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // Fill Note Information (Header)
    cy.contains("Note Information").closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000); // Wait for modal animation

    cy.contains("div", /Note Information/i).closest(".MuiBox-root").within(() => {
      cy.get("textarea, input").eq(0).clear({ force: true }).type("Follow-up session " + noteId, { force: true });
      cy.get("input").eq(2).clear({ force: true }).type("2026-02-03", { force: true });
      cy.contains("button", /SAVE/i).click({ force: true });
    });

    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();

    // Write in Monaco Editor
    cy.get(".monaco-editor", { timeout: 120000 }).first().click({ force: true })
      .find("textarea").first().type("Stable condition. Note ID: " + noteId, { force: true, delay: 10 });

    cy.wait(5000);

    // Sign the Note
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SIGN$/i).should("be.visible").click({ force: true });
    });
    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();
    // Verify "Signed" status in table
    this.notesContainer.contains("tr", "Follow-up session " + noteId).within(() => {
      cy.contains("Signed", { timeout: 120000 }).should("be.visible");
    });
    cy.log("✅ CREATE OPERATION ENDS")

    this.waitForLoaders();

    // --- UPDATE ---
    cy.log("✅ UPDATE OPERATION STARTS")
    this.notesContainer.contains("tr", "Follow-up session " + noteId).find('button[aria-label="edit"]').first().click({ force: true });
    this.waitForLoaders();

    // Trigger versioning
    cy.contains("button", /^PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^EDIT$/i).click({ force: true });
    });
    cy.contains("button", /Confirm/i).click({ force: true });
    cy.contains(/note.*successfully/i).should("be.visible", { timeout: 120000 });
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    this.waitForLoaders();

    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000);

    // Use .within() to ensure we only interact with this specific section
    cy.contains("p", /Note Information/i)
      .closest(".MuiBox-root")
      .within(() => {
        // Fill updated Reason of Visit
        cy.contains("span", /Reason of Visit/i).next().find("input").first()
          .clear({ force: true })
          .type("Updated Follow-up session " + updateId, { force: true });

        // Click the SAVE button specifically inside this Note Information box
        cy.contains("button", /SAVE/i)
          .should("be.visible")
          .click({ force: true });
      });

    // Verify success for this specific section
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist", { timeout: 120000 });
    cy.log("✅ UPDATE OPERATION ENDS")

    // --- DELETE PART ---
    // 1. Locate the updated consult note row in the table
    cy.log("✅ DELETE OPERATION STARTS")

    this.notesContainer.contains("tr", "Updated Follow-up session " + updateId)
      .scrollIntoView()
      .should("be.visible")
      .as('noteRowToDelete');

    // 2. Click the delete icon (trash icon) for this specific note
    cy.get('@noteRowToDelete').within(() => {
      // Targeting the red delete button
      cy.get('button[aria-label="delete"], button[aria-label="Delete"]')
        .filter('.MuiIconButton-colorError')
        .should('be.visible')
        .click({ force: true });
    });

    // 3. Handle the confirmation dialog
    cy.contains("Are you sure?", { timeout: 120000 }).should("be.visible");
    cy.contains("button", "Yes, delete it!").click({ force: true });

    // 4. Verify success message and wait for UI to stabilize
    cy.contains(/deleted.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/deleted.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();

    // 5. Verification: Ensure the deleted note title no longer exists in the table
    this.notesContainer.should('not.contain', "Updated Follow-up session " + updateId);
    cy.log("✅ DELETE OPERATION ENDS")


  }

  progressNoteCreate(uniqueId) {
    const reasonText = "Follow-up session " + uniqueId;
    const titleText = "Progress Note " + uniqueId;

    // 1. Initiate Note and Click Pencil icon
    this.addNoteBtn.click({ force: true });
    cy.get('li[role="menuitem"]').contains(/New Progress Note/i, { timeout: 120000 }).should('be.visible', { timeout: 120000 }).click({ force: true });
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");

    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    this.waitForLoaders();

    cy.contains('p', /Note Information/i)
      .closest('.MuiBox-root')
      .within(() => {
        cy.contains('button', /^SAVE$/i)
          .should('be.visible');

        cy.contains("span", /Reason of Visit/i).next().find("input").first().clear({ force: true }).type(reasonText, { force: true });
        cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type(titleText, { force: true });

        // 4. Click SAVE button in header
        cy.contains("button", /^SAVE$/i).click({ force: true });
      });

    // 5. Wait for updated successfully toast to disappear
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // 6. Write in Monaco Editor
    cy.get(".monaco-editor", { timeout: 120000 }).first().click({ force: true })
      .find("textarea").first()
      .should('exist')
      .type("Stable condition observed for ID: " + uniqueId, { force: true, delay: 10 });

    // 7. Click the SIGN button (Anchor: SIGN & PRINT and BILLING are nearby)
    cy.contains('button', /^SIGN & PRINT$/i).closest('.MuiBox-root').within(() => {
      cy.contains('button', /^SIGN$/i).should('be.visible').click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    cy.log(">>> Progress Note created and signed: " + titleText);

    cy.get('#notes table tbody tr', { timeout: 200000 })
      .contains(uniqueId)
      .should('be.visible');

    cy.log(">>> Success: Note with ID " + uniqueId + " verified in Clinical Notes table.");

    return titleText;
  }

  progressNoteUpdate(uniqueId) {
    const updatedId = Math.floor(Math.random() * 900) + 100;
    const updatedReason = "Updated Follow-up " + updatedId;
    const updatedTitle = "Updated Title " + updatedId;

    cy.get('#notes table tbody tr').contains(uniqueId)


      .closest('tr')
      .find('button[aria-label="edit"], button[aria-label="Edit"]')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();

    // 2. Wait for the Monaco Editor to be visible on the right panel
    cy.get('.monaco-editor', { timeout: 30000 }).should('be.visible');

    // 3. Verify that EDIT, PRINT, and BILLING buttons appear in the footer area

    cy.contains('button', /^PRINT$/i).should('be.visible');
    cy.contains('button', /^BILLING$/i).should('be.visible');
    cy.contains('button', /^EDIT$/i).should('be.visible').click({ force: true });

    // 2. Handle Versioning Modal: "This will make a new version!"
    cy.contains(/This will make a new version/i, { timeout: 10000 }).should('be.visible');
    cy.contains('button', /Confirm/i).should('be.visible').click({ force: true });

    // 3. Wait for success sync after versioning trigger
    cy.contains(/updated.*successfully/i, { timeout: 30000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 30000 }).should('not.exist');
    this.waitForLoaders();

    // 4. Open Header for editing (Click pencil icon)
    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    this.waitForLoaders();

    // 5. Update Header Information within the scoped container
    cy.contains("p", /Note Information/i).closest(".MuiBox-root").within(() => {
      // Verify Save and Cancel exist as per requirement
      cy.contains('button', /^SAVE$/i).should('be.visible');
      cy.contains('button', /^CANCEL$/i).should('be.visible');

      cy.contains("span", /Reason of Visit/i).next().find("input").first().clear({ force: true }).type(updatedReason, { force: true });
      cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type(updatedTitle, { force: true });

      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    // 6. Sync after header update
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("not.exist");
    this.waitForLoaders();

    // 7. Clear Monaco Editor and write new content
    // We use {selectall}{backspace} as a robust way to clear Monaco content
    cy.get(".monaco-editor", { timeout: 20000 }).first().click({ force: true })
      .find("textarea").first()
      .type('{selectall}{backspace}' + "Modified content for version 2. Updated ID: " + updatedId, { force: true, delay: 10 });

    // 8. Click the SIGN button to finalize the updated version
    cy.contains('button', /^SIGN & PRINT$/i).closest('.MuiBox-root').within(() => {
      cy.contains('button', /^SIGN$/i).should('be.visible').click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("not.exist");
    this.waitForLoaders();


    cy.get('#notes table tbody tr', { timeout: 20000 })
      .contains(updatedId)
      .should('be.visible');

    cy.log(">>> Progress Note version 2 updated and signed: " + updatedTitle);
    return updatedTitle;
  }

  consultNoteCreate(uniqueId) {
    const reasonText = "Consult session " + uniqueId;
    const titleText = "Consult Note " + uniqueId;

    // 1. Initiate Consult Note and Click Pencil icon
    this.addNoteBtn.click({ force: true });
    cy.get('li[role="menuitem"]').contains(/New Consult Note/i).should('be.visible').click({ force: true });
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");

    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    this.waitForLoaders();

    cy.contains('p', /Referring Provider Information/i)
      .closest('.MuiBox-root')
      .parent()
      .within(() => {
        cy.get('input[placeholder="Search Contact"]')
          .should('be.visible')
          .clear({ force: true })
          .type("mridul", { delay: 200, force: true });
      });


    cy.get('li.autocomplete-option', { timeout: 200000 })
      .should('be.visible')
      .first()
      .click({ force: true });
    cy.contains("button", /^SAVE$/i).click({ force: true });
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");

    this.waitForLoaders();


    cy.contains('p', /Note Information/i)
      .closest('.MuiBox-root')
      .within(() => {
        cy.contains('button', /^SAVE$/i).should('be.visible');
        cy.contains("span", /Reason of Visit/i).next().find("input").first().clear({ force: true }).type(reasonText, { force: true });
        cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type(titleText, { force: true });
        cy.contains("button", /^SAVE$/i).click({ force: true });
      });

    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // 2. Write in Monaco Editor
    cy.get(".monaco-editor", { timeout: 120000 }).first().click({ force: true })
      .find("textarea").first().should('exist')
      .type("Consultation stable condition observed for ID: " + uniqueId, { force: true, delay: 10 });

    // 3. Click the SIGN button
    cy.contains('button', /^SIGN & PRINT$/i).closest('.MuiBox-root').within(() => {
      cy.contains('button', /^SIGN$/i).should('be.visible').click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    // 4. Verification in the table
    cy.get('#notes table tbody tr', { timeout: 200000 }).contains(uniqueId).should('be.visible');
    cy.log(">>> Consult Note created and signed: " + titleText);
    return titleText;
  }

  consultNoteUpdate(uniqueId) {
    const updatedId = Math.floor(Math.random() * 900) + 100;
    const updatedReason = "Updated Consult Follow-up " + updatedId;
    const updatedTitle = "Updated Consult Note " + updatedId;

    // 1. Locate row and Click edit
    cy.get('#notes table tbody tr').contains(uniqueId)
      .closest('tr')
      .find('button[aria-label="edit"], button[aria-label="Edit"]')
      .should('be.visible')
      .click({ force: true });

    this.waitForLoaders();
    cy.get('.monaco-editor', { timeout: 30000 }).should('be.visible');

    // 2. Trigger Versioning
    cy.contains('button', /^PRINT$/i).should('be.visible');
    cy.contains('button', /^BILLING$/i).should('be.visible');
    cy.contains('button', /^EDIT$/i).should('be.visible').click({ force: true });

    cy.contains(/This will make a new version/i, { timeout: 10000 }).should('be.visible');
    cy.contains('button', /Confirm/i).should('be.visible').click({ force: true });

    cy.contains(/updated.*successfully/i, { timeout: 30000 }).should('be.visible');
    cy.contains(/updated.*successfully/i, { timeout: 30000 }).should('not.exist');
    this.waitForLoaders();

    // 3. Update Header Info
    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    this.waitForLoaders();

    cy.contains("p", /Note Information/i).closest(".MuiBox-root").within(() => {
      cy.contains('button', /^SAVE$/i).should('be.visible');
      cy.contains("span", /Reason of Visit/i).next().find("input").first().clear({ force: true }).type(updatedReason, { force: true });
      cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type(updatedTitle, { force: true });
      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("not.exist");
    this.waitForLoaders();

    // 4. Update Monaco Editor
    cy.get(".monaco-editor", { timeout: 20000 }).first().click({ force: true })
      .find("textarea").first()
      .type('{selectall}{backspace}' + "Modified consult content for version 2. Updated ID: " + updatedId, { force: true, delay: 10 });

    // 5. Final Sign
    cy.contains('button', /^SIGN & PRINT$/i).closest('.MuiBox-root').within(() => {
      cy.contains('button', /^SIGN$/i).should('be.visible').click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 30000 }).should("not.exist");
    this.waitForLoaders();

    // 6. Verify Updated row in table
    cy.get('#notes table tbody tr', { timeout: 20000 }).contains(updatedId).should('be.visible');
    cy.log(">>> Consult Note updated and signed: " + updatedTitle);
    return updatedTitle;
  }


  createNoteForBilling() {


    // 1. Initiate Note and Click Pencil icon
    this.addNoteBtn.click({ force: true });
    cy.get('li[role="menuitem"]').contains(/New Progress Note/i, { timeout: 120000 }).should('be.visible', { timeout: 120000 }).click({ force: true });
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");

    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    this.waitForLoaders();

    cy.contains('p', /Note Information/i)
      .closest('.MuiBox-root')
      .within(() => {
        cy.contains('button', /^SAVE$/i)
          .should('be.visible');

        // cy.contains("span", /Reason of Visit/i).next().find("input").first().clear({ force: true }).type(reasonText, { force: true });
        // cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type(titleText, { force: true });

        // 4. Click SAVE button in header
        cy.contains("button", /^SAVE$/i).click({ force: true });
      });

    // 5. Wait for updated successfully toast to disappear
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 120000 }).should("not.exist");
    this.waitForLoaders();

    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^BILLING$/i, { timeout: 200000 }).should("be.visible").click({ force: true });
    });

  }

}

export default new ChartPage();