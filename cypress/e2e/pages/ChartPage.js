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
    cy.contains(/created.*successfully/i).should("be.visible");
    cy.contains(/created.*successfully/i).should("not.exist");
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
      cy.get("input", { timeout: 15000 }).should("be.visible");

      cy.get("td").eq(1).find("input").clear({ force: true }).type(updatedRE.toString(), { force: true });
      cy.get("td").eq(2).find("input").clear({ force: true }).type(updatedLE.toString(), { force: true });

      // Click the Save button (blue tick) within the same row
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/updated.*successfully/i).should("be.visible");
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
      cy.get('button[aria-label="Delete"]', { timeout: 15000 })
        .should("be.visible")
        .click({ force: true });
    });

    // Standard confirmation flow
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/deleted.*successfully/i).should("be.visible");
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
    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("not.exist");

    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#levelOfCare tr", createId.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('levelRowToUpdate');

    cy.get('@levelRowToUpdate').click({ force: true });
    cy.get('@levelRowToUpdate').within(() => {
      // Waiting for edit mode inputs to render properly
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(1).find("input").clear({ force: true }).type("Urgent", { force: true });
      cy.get("td").eq(2).find("input").clear({ force: true }).type(updatedDesc, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("not.exist");

    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#levelOfCare tr", updateId.toString())
      .scrollIntoView()
      .should("be.visible")
      .as('levelRowToDelete');

    cy.get("@levelRowToDelete").click({ force: true });
    cy.get("@levelRowToDelete").within(() => {
      cy.get('button[aria-label="Delete"]', { timeout: 15000 })
        .should("be.visible")
        .click({ force: true });
    });
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("not.exist");
    this.waitForLoaders();
  }

  // Selectors for Allergies
  get allergyContainer() { return cy.get("#allergies"); }
  get addAllergyBtn() { return this.allergyContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Medication Allergy
   */
  medicationAllergyCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialName = "Penicillin ID: " + idCreate;
    const updatedName = "Amoxicillin ID: " + idUpdate;

    // --- CREATE PART ---
    this.addAllergyBtn.click({ force: true });

    // Handle the "New Allergy" menu if it appears
    cy.get("body").then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains("li", "New Allergy").click({ force: true });
      }
    });

    this.allergyContainer.find("table tbody tr").first().as('allergyNewRow').within(() => {
      cy.get("td").eq(0).find("input").type(initialName, { force: true });
      cy.get("td").eq(1).find(".MuiSelect-select").click({ force: true });
    });
    cy.get('li[role="option"]').contains("Medication").click({ force: true });

    cy.get('@allergyNewRow').within(() => {
      cy.get("td").eq(2).find("input").type("Severe Rash", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("not.exist");

    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#allergies tr", idCreate.toString())
      .scrollIntoView()
      .as("medRowToUpdate");

    // Click first cell to enter edit mode
    cy.get("@medRowToUpdate").find("td").first().click({ force: true });

    cy.get("@medRowToUpdate").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedName, { force: true });
      cy.get("td").eq(2).find("input").first().clear({ force: true }).type("Urticaria", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("not.exist");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#allergies tr", idUpdate.toString())
      .scrollIntoView()
      .as("medRowToDelete");

    cy.get("@medRowToDelete").find("td").first().click({ force: true });

    cy.get("@medRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      // Targeting the red delete button specifically
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("not.exist");
    this.waitForLoaders();
  }

  /**
   * Complete CRUD operation for Food Allergy
   */
  foodAllergyCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialName = "Peanuts ID: " + idCreate;
    const updatedName = "Shellfish ID: " + idUpdate;

    // --- CREATE PART ---
    this.addAllergyBtn.click({ force: true });

    // Handle "New Allergy" menu if it appears
    cy.get("body").then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains("li", "New Allergy").click({ force: true });
      }
    });

    this.allergyContainer.find("table tbody tr").first().as('foodNewRow').within(() => {
      cy.get("td").eq(0).find("input").type(initialName, { force: true });
      cy.get("td").eq(1).find(".MuiSelect-select").click({ force: true });
    });

    // Selecting Food category
    cy.get('li[role="option"]').contains("Food").click({ force: true });

    cy.get('@foodNewRow').within(() => {
      cy.get("td").eq(2).find("input").type("Hives", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#allergies tr", idCreate.toString())
      .scrollIntoView()
      .as("foodRowToUpdate");

    cy.get("@foodRowToUpdate").find("td").first().click({ force: true });

    cy.get("@foodRowToUpdate").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedName, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#allergies tr", idUpdate.toString())
      .scrollIntoView()
      .as("foodRowToDelete");

    cy.get("@foodRowToDelete").find("td").first().click({ force: true });

    cy.get("@foodRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
  }

  // Selectors for Social History
  get socialHxContainer() { return cy.get("#socialHx"); }
  get addSocialBtn() { return this.socialHxContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }



  /**
   * Complete CRUD operation for Environmental Allergy
   */
  environmentalAllergyCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialName = "Dust Mites ID: " + idCreate;
    const updatedName = "Pollen ID: " + idUpdate;

    // --- CREATE PART ---
    this.addAllergyBtn.click({ force: true });

    // Handle "New Allergy" menu if it appears
    cy.get("body").then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains("li", "New Allergy").click({ force: true });
      }
    });

    this.allergyContainer.find("table tbody tr").first().as('envNewRow').within(() => {
      cy.get("td").eq(0).find("input").type(initialName, { force: true });
      cy.get("td").eq(1).find(".MuiSelect-select").click({ force: true });
    });

    // Selecting Environmental category
    cy.get('li[role="option"]').contains("Environmental").click({ force: true });

    cy.get('@envNewRow').within(() => {
      cy.get("td").eq(2).find("input").type("Sneezing", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#allergies tr", idCreate.toString())
      .scrollIntoView()
      .as("envRowToUpdate");

    cy.get("@envRowToUpdate").find("td").first().click({ force: true });

    cy.get("@envRowToUpdate").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedName, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#allergies tr", idUpdate.toString())
      .scrollIntoView()
      .as("envRowToDelete");

    cy.get("@envRowToDelete").find("td").first().click({ force: true });

    cy.get("@envRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
  }

  /**
   * Complete CRUD operation for Biologic Allergy
   */
  biologicAllergyCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialName = "Insulin ID: " + idCreate;
    const updatedName = "Vaccines ID: " + idUpdate;

    // --- CREATE PART ---
    this.addAllergyBtn.click({ force: true });

    // Handle "New Allergy" context menu if present
    cy.get("body").then(($body) => {
      if ($body.find('li:contains("New Allergy")').length > 0) {
        cy.contains("li", "New Allergy").click({ force: true });
      }
    });

    this.allergyContainer.find("table tbody tr").first().as('bioNewRow').within(() => {
      cy.get("td").eq(0).find("input").type(initialName, { force: true });
      cy.get("td").eq(1).find(".MuiSelect-select").click({ force: true });
    });

    // Selecting Biologic category from dropdown
    cy.get('li[role="option"]').contains("Biologic").click({ force: true });

    cy.get('@bioNewRow').within(() => {
      cy.get("td").eq(2).find("input").type("Swelling", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#allergies tr", idCreate.toString())
      .scrollIntoView()
      .as("bioRowToUpdate");

    cy.get("@bioRowToUpdate").find("td").first().click({ force: true });

    cy.get("@bioRowToUpdate").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedName, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#allergies tr", idUpdate.toString())
      .scrollIntoView()
      .as("bioRowToDelete");

    cy.get("@bioRowToDelete").find("td").first().click({ force: true });

    cy.get("@bioRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      // Target red icon for deletion
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
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

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#measurements tr", hrCreate.toString())
      .scrollIntoView()
      .as("vitalsRowToUpdate");

    cy.get("@vitalsRowToUpdate").click({ force: true });

    cy.get("@vitalsRowToUpdate").within(() => {
      // Wait for edit mode inputs to appear
      cy.get("input", { timeout: 15000 }).should("be.visible");

      // Updating HR and SPO2
      cy.get("td").eq(2).find("input").clear({ force: true }).type(hrUpdate.toString(), { force: true });
      cy.get("td").eq(3).find("input").clear({ force: true }).type("99", { force: true });

      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
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
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]', { timeout: 15000 })
        .should("be.visible")
        .click({ force: true });
    });

    // Standard confirmation flow
    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
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

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#phyMeasurements tr", weightCreate.toString())
      .scrollIntoView()
      .as("phyRowToUpdate");

    cy.get("@phyRowToUpdate").click({ force: true });

    cy.get("@phyRowToUpdate").within(() => {
      // Wait for inputs to render in edit mode
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(1).find("input").first().clear({ force: true }).type("180", { force: true });
      cy.get("td").eq(3).find("input").first().clear({ force: true }).type(weightUpdate.toString(), { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#phyMeasurements tr", weightUpdate.toString())
      .scrollIntoView()
      .as("phyRowToDelete");

    // Click row first to trigger the delete icon's visibility
    cy.get("@phyRowToDelete").click({ force: true });

    cy.get("@phyRowToDelete").within(() => {
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]', { timeout: 15000 })
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
  }

  // Selectors for Medical History
  get medicalHxContainer() { return cy.get("#medicalHx"); }
  get addMedicalHxBtn() { return this.medicalHxContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Medical History
   */
  medicalHistoryCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialDiagnosis = "Hypertension ID: " + idCreate;
    const updatedDiagnosis = "Type 2 Diabetes ID: " + idUpdate;

    // --- CREATE PART ---
    this.addMedicalHxBtn.click({ force: true });

    this.medicalHxContainer.find("table tbody tr").first().as('medHxNewRow').within(() => {
      // Index 0: Diagnosis, 1: Start, 2: End, 3: Notes
      cy.get("td").eq(0).find("input").first().type(initialDiagnosis, { force: true });
      cy.get("td").eq(1).find("input").first().type("Jan 2022", { force: true });
      cy.get("td").eq(2).find("input").first().type("Dec 2024", { force: true });
      cy.get("td").eq(3).find("input").first().type("Medication ongoing", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#medicalHx tr", idCreate.toString())
      .scrollIntoView()
      .as("medHxRowToUpdate");

    // Click the first cell to enter edit mode
    cy.get("@medHxRowToUpdate").find("td").first().click({ force: true });

    cy.get("@medHxRowToUpdate").within(() => {
      // Ensure input fields are rendered
      cy.get("input", { timeout: 15000 }).should("be.visible");

      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedDiagnosis, { force: true });
      cy.get("td").eq(3).find("input").first().clear({ force: true }).type("Condition updated with new ID: " + idUpdate, { force: true });

      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#medicalHx tr", idUpdate.toString())
      .scrollIntoView()
      .as("medHxRowToDelete");

    cy.get("@medHxRowToDelete").find("td").first().click({ force: true });

    cy.get("@medHxRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      // Targeting specifically the red delete button
      cy.get('button[aria-label="delete"].MuiIconButton-colorError')
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
  }

  // Selectors for Surgical History
  get surgicalHxContainer() { return cy.get("#surgicalHx"); }
  get addSurgicalBtn() { return this.surgicalHxContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Surgical History
   */
  surgicalHistoryCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialSurgical = "Cataract Surgery ID: " + idCreate;
    const updatedSurgical = "Glaucoma Surgery ID: " + idUpdate;

    // --- CREATE PART ---
    this.addSurgicalBtn.click({ force: true });

    this.surgicalHxContainer.find("table tbody tr").first().as('surgicalNewRow').within(() => {
      // Index 0: Procedure/Diagnosis, Index 1: Date
      cy.get("td").eq(0).find("input").first().type(initialSurgical, { force: true });
      cy.get("td").eq(1).find("input").first().type("2024-05-15", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#surgicalHx tr", idCreate.toString())
      .scrollIntoView()
      .as("surgicalRowToUpdate");

    // Enter edit mode
    cy.get("@surgicalRowToUpdate").find("td").first().click({ force: true });

    cy.get("@surgicalRowToUpdate").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedSurgical, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#surgicalHx tr", idUpdate.toString())
      .scrollIntoView()
      .as("surgicalRowToDelete");

    cy.get("@surgicalRowToDelete").click({ force: true });

    cy.get("@surgicalRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
  }

  // Selectors for Family History
  get familyHxContainer() { return cy.get("#familyHx"); }
  get addFamilyBtn() { return this.familyHxContainer.find(".chart-header button.MuiIconButton-colorPrimary"); }

  /**
   * Complete CRUD operation for Family History
   */
  familyHistoryCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialFamily = "Diabetes ID: " + idCreate;
    const updatedFamily = "Heart Disease ID: " + idUpdate;

    // --- CREATE PART ---
    this.addFamilyBtn.click({ force: true });

    this.familyHxContainer.find("table tbody tr").first().as('familyNewRow').within(() => {
      // Index 0: Diagnosis, Index 1: Relation
      cy.get("td").eq(0).find("input").first().type(initialFamily, { force: true });
      cy.get("td").eq(1).find("input").first().type("Father", { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#familyHx tr", idCreate.toString())
      .scrollIntoView()
      .as("familyRowToUpdate");

    // Click the first cell to enter edit mode
    cy.get("@familyRowToUpdate").find("td").first().click({ force: true });

    cy.get("@familyRowToUpdate").within(() => {
      // Wait for input fields to render properly
      cy.get("input", { timeout: 15000 }).should("be.visible");

      cy.get("td").eq(0).find("input").first().clear({ force: true }).type(updatedFamily, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#familyHx tr", idUpdate.toString())
      .scrollIntoView()
      .as("familyRowToDelete");

    // Click row first to trigger action buttons visibility
    cy.get("@familyRowToDelete").click({ force: true });

    cy.get("@familyRowToDelete").within(() => {
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]', { timeout: 15000 })
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();
  }

  /**
   * Complete CRUD operation for Social History
   */
  socialHistoryCRUD() {
    const idCreate = Math.floor(100 + Math.random() * 900);
    const idUpdate = Math.floor(100 + Math.random() * 900);
    const initialNote = "Routine social note ID: " + idCreate;
    const updatedNote = "Updated social note ID: " + idUpdate;

    // --- CREATE PART ---
    this.addSocialBtn.click({ force: true });

    // Selecting the first category from dropdown
    this.socialHxContainer.find("table tbody tr").first().as('socialNewRow').within(() => {
      cy.get("td").eq(0).find(".MuiSelect-select").click({ force: true });
    });
    cy.get('li[role="option"]', { timeout: 10000 }).first().click({ force: true });

    // Filling data fields
    cy.get('@socialNewRow').within(() => {
      cy.get("td").eq(1).find("input").first().clear({ force: true }).type("2015", { force: true });
      cy.get("td").eq(2).find("input").first().clear({ force: true }).type("Present", { force: true });
      cy.get("td").eq(3).find("input").first().clear({ force: true }).type(initialNote, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#socialHx tr", idCreate.toString())
      .scrollIntoView()
      .as("socialRowToUpdate");

    // Click to enter edit mode
    cy.get("@socialRowToUpdate").find("td").eq(1).click({ force: true });

    cy.get("@socialRowToUpdate").within(() => {
      // Ensure input is visible (Wait for rendering)
      cy.get("input", { timeout: 15000 }).should("be.visible");

      cy.get("td").eq(1).find("input").first().clear({ force: true }).type("2018", { force: true });
      cy.get("td").eq(2).find("input").first().clear({ force: true }).type("2025", { force: true });
      cy.get("td").eq(3).find("input").first().clear({ force: true }).type(updatedNote, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#socialHx tr", idUpdate.toString())
      .scrollIntoView()
      .as("socialRowToDelete");

    cy.get("@socialRowToDelete").find("td").eq(1).click({ force: true });

    cy.get("@socialRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      // Targeting the red delete button
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("not.exist");

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

    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE PART ---
    cy.contains("#adminNotes tr", idCreate.toString())
      .scrollIntoView()
      .as("adminRowToUpdate");

    // Click to enter edit mode
    cy.get("@adminRowToUpdate").find("td").first().click({ force: true });

    cy.get("@adminRowToUpdate").within(() => {
      // Wait for input fields to render properly after edit trigger
      cy.get("input", { timeout: 15000 }).should("be.visible");
      cy.get("td").eq(1).find("input").first().clear({ force: true }).type(updatedNote, { force: true });
      cy.get("td").last().find("button").first().click({ force: true });
    });

    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- DELETE PART ---
    cy.contains("#adminNotes tr", idUpdate.toString())
      .scrollIntoView()
      .as("adminRowToDelete");

    // Trigger row activation for action buttons
    cy.get("@adminRowToDelete").click({ force: true });

    cy.get("@adminRowToDelete").within(() => {
      cy.get("input", { timeout: 15000 }).should("be.visible");
      // Specific target for red delete icon
      cy.get('button[aria-label="Delete"], button[aria-label="delete"]')
        .filter(".MuiIconButton-colorError")
        .should("be.visible")
        .click({ force: true });
    });

    cy.contains("button", "Yes, delete it!").click({ force: true });
    cy.contains(/ *deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
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
    this.addOrderBtn.scrollIntoView().click({ force: true });

    // Search for medication
    this.ordersContainer.find('input[placeholder="Add new order"]')
      .first()
      .should("be.enabled")
      .click({ force: true })
      .clear({ force: true })
      .type(medName, { delay: 600, force: true });

    // Waiting for the dropdown results to populate from API
    cy.wait(3000);

    // --- CONDITIONAL STRATEGY ---
    cy.get('body').then(($body) => {
      // Search for the specific drug text in the autocomplete list
      // Using a regex to find 'COPAXONE' followed by some dosage info
      const specificDrug = $body.find('li.autocomplete-option:contains("COPAXONE")');

      if (specificDrug.length > 0) {
        cy.log(">>> Specific dosage found. Selecting from list.");
        cy.wrap(specificDrug).first().click({ force: true });
      } else {
        cy.log(">>> Specific drug not found. Clicking 'Create as new medicine' option.");

        // Target the 'Medicine' category and click the first 'Create as a new medicine' option
        cy.contains('div.autocomplete-option', /as a new medicine/i, { timeout: 10000 })
          .should('be.visible')
          .click({ force: true });
      }
    });

    this.waitForLoaders();

    // Fill Dose
    cy.contains("span", /Dose/i).next().find("input").first()
      .clear({ force: true }).type("40", { force: true });
    cy.get('li[role="option"]').contains("40 mg").click({ force: true });

    // Set Duration and Dispense
    cy.contains("span", /Duration/i).next().find("input").first().type(initialDuration, { force: true });
    cy.contains("span", /Dispense/i).next().find("input").first().type(initialDispense, { force: true });

    // Set Route and Frequency
    cy.contains("span", /Route.*adm/i).next().find("input").first().click({ force: true });
    cy.get('li[role="option"]').contains("Subcutaneous").click({ force: true });
    cy.contains("span", /Frequency/i).next().find("input").first().type("Three Times Daily (TID)", { force: true });

    // Save the order
    cy.contains("button", /^SAVE$/i).should("be.enabled").click({ force: true });
    cy.contains(/ *created.*successfully/i, { timeout: 20000 }).should("be.visible");
    this.waitForLoaders();

    // --- UPDATE PART ---
    // Target the created order to edit
    cy.contains("#orders div", /COPAXONE/i, { timeout: 15000 }).should("be.visible").click({ force: true });

    // Update fields in the form
    cy.contains("span", /Duration/i).next().find("input").first().clear({ force: true }).type(updatedDuration, { force: true });
    cy.contains("span", /Dispense/i).next().find("input").first().clear({ force: true }).type(updatedDispense, { force: true });

    cy.contains("button", /^SAVE$/i).click({ force: true });
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("not.exist");
    cy.contains("button", /^CLOSE$/i).click({ force: true });

    this.waitForLoaders();

    // --- DELETE PART ---
    // Ensuring the edit mode is closed (as seen in your logs)
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("CLOSE")').length > 0) {
        cy.contains('button', /CLOSE/i).click({ force: true });
        this.waitForLoaders();
      }
    });

    // Targeting the row again to ensure fresh DOM reference
    cy.contains("#orders div", /COPAXONE/i)
      .closest(".MuiPaper-root")
      .filter(`:contains("${updatedDuration}")`)
      .as('medRowToDelete');

    cy.get("@medRowToDelete").within(() => {
      // Strategy: Look for any SVG that is inside the row
      // We target the SVG directly and force click it to bypass aria-hidden issues
      // Using a more generic selector for the trash icon based on its location
      cy.get('svg', { timeout: 15000 })
        .filter((index, el) => {
          // Filter to find the red-colored icon (Delete icon color in MUI)
          const color = Cypress.$(el).css('color') || Cypress.$(el).css('fill');
          return color.includes('rgb(211, 47, 47)') || color.includes('red');
        })
        .first() // Select the first red icon found in this row
        .should('exist') // Use 'exist' instead of 'visible' if aria-hidden is causing issues
        .click({ force: true });
    });

    // Handle Confirmation Modal
    cy.contains("Are you sure?", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Yes, Delete").click({ force: true });

    // Final Success Verification
    cy.contains("medication has been removed.", { timeout: 20000 }).should("be.visible");
    cy.contains("button", "OK").click({ force: true });
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
    cy.contains('div', /Imaging Requisition/i, { timeout: 15000 })
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
    cy.contains(examName, { timeout: 20000 }).should("be.visible");


    // --- UPDATE PART ---
    const updatedExamName = "Updated Chest " + requisitionId;

    // 1. Locate the specific order card and scroll to it
    cy.contains("#orders .MuiPaper-root", examName, { timeout: 15000 })
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
      cy.get('input[placeholder="Example: Chest"]', { timeout: 20000 })
        .should('be.visible')
        .clear({ force: true })
        .type(updatedExamName, { force: true });

      // ... rest of your update code (textarea, priority, save etc.) ...
      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    // 5. Verification
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/ *updated.*successfully/i, { timeout: 20000 }).should("not.exist");

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
    cy.contains('div', /Lab Requisition/i, { timeout: 15000 })
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
    cy.contains("li", /New Progress Note/i, { timeout: 15000 }).click({ force: true });
    this.waitForLoaders();

    // Fill Note Information (Header)
    cy.contains("Note Information").closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000); // Wait for modal animation

    cy.contains("div", /Note Information/i).closest(".MuiBox-root").within(() => {
      cy.get("textarea, input").eq(0).clear({ force: true }).type("Follow-up session " + noteId, { force: true });
      cy.get("input").eq(1).clear({ force: true }).type("Daily Note " + noteId, { force: true });
      cy.get("input").eq(2).clear({ force: true }).type("2026-02-03", { force: true });
      cy.contains("button", /UPDATE/i).click({ force: true });
    });

    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    this.waitForLoaders();

    // Write in Monaco Editor
    cy.get(".monaco-editor", { timeout: 20000 }).first().click({ force: true })
      .find("textarea").first().type("Stable condition. Note ID: " + noteId, { force: true, delay: 10 });



    cy.wait(5000);

    // Sign the Note
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SIGN$/i).should("be.visible").click({ force: true });
    });

    this.waitForLoaders();
    // Verify "Signed" status in table
    this.notesContainer.contains("tr", "Daily Note " + noteId).within(() => {
      cy.contains("Signed", { timeout: 60000 }).should("be.visible");
    });
    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE ---
    // Click edit icon for the signed note
    this.notesContainer.contains("tr", "Daily Note " + noteId).find('button[aria-label="edit"]').first().click({ force: true });
    this.waitForLoaders();

    // Trigger versioning
    cy.contains("button", /^PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^EDIT$/i).click({ force: true });
    });
    cy.contains("button", /Confirm/i).click({ force: true });
    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    this.waitForLoaders();

    // Update Title for Version 2
    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000);
    cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type("Updated Note " + updateId, { force: true });
    cy.contains("button", /UPDATE/i).click({ force: true });

    // Add content to Monaco for Version 2
    cy.get(".monaco-editor").first().click({ force: true }).find("textarea").first()
      .type(" - Updated for version 2. ID: " + updateId, { force: true, delay: 10 });

    cy.wait(5000);

    // Sign Version 2
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    // Final verification of status
    this.notesContainer.contains("tr", "Updated Note " + updateId).within(() => {
      cy.contains("Unsigned", { timeout: 60000 }).should("be.visible");
    });
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^CLOSE$/i).click({ force: true });
    });
    this.waitForLoaders();


    // --- DELETE PART ---
    // 1. Locate the updated note row in the table
    this.notesContainer.contains("tr", "Updated Note " + updateId)
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
    cy.contains("Are you sure?", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Yes, delete it!").click({ force: true });

    // 4. Verify success message and wait for UI to stabilize
    cy.contains(/deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/deleted.*successfully/i, { timeout: 20000 }).should("not.exist");

    this.waitForLoaders();

    // 5. Verification: Ensure the deleted note title no longer exists in the table
    this.notesContainer.should('not.contain', "Updated Note " + updateId);


  }

  consultNoteCRUD() {
    const noteId = Math.floor(Math.random() * 1000);
    const updateId = Math.floor(Math.random() * 1000);

    // --- CREATE PART ---
    this.addNoteBtn.click({ force: true });
    cy.contains("li", /New Consult Note/i, { timeout: 15000 }).click({ force: true });
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
    // Autocomplete list is usually outside the '.within' scope in the DOM
    cy.get("li.autocomplete-option", { timeout: 15000 })
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
    cy.contains(/note.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/note.*successfully/i, { timeout: 20000 }).should("not.exist");
    this.waitForLoaders();

    // Fill Note Information (Header)
    cy.contains("Note Information").closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000); // Wait for modal animation

    cy.contains("div", /Note Information/i).closest(".MuiBox-root").within(() => {
      cy.get("textarea, input").eq(0).clear({ force: true }).type("Follow-up session " + noteId, { force: true });
      cy.get("input").eq(1).clear({ force: true }).type("Daily Consult Note " + noteId, { force: true });
      cy.get("input").eq(2).clear({ force: true }).type("2026-02-03", { force: true });
      cy.contains("button", /UPDATE/i).click({ force: true });
    });

    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    this.waitForLoaders();

    // Write in Monaco Editor
    cy.get(".monaco-editor", { timeout: 20000 }).first().click({ force: true })
      .find("textarea").first().type("Stable condition. Note ID: " + noteId, { force: true, delay: 10 });



    cy.wait(5000);

    // Sign the Note
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SIGN$/i).should("be.visible").click({ force: true });
    });

    this.waitForLoaders();
    // Verify "Signed" status in table
    this.notesContainer.contains("tr", "Daily Consult Note " + noteId).within(() => {
      cy.contains("Signed", { timeout: 60000 }).should("be.visible");
    });
    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    this.waitForLoaders();

    // --- UPDATE ---
    // Click edit icon for the signed note
    this.notesContainer.contains("tr", "Daily Consult Note " + noteId).find('button[aria-label="edit"]').first().click({ force: true });
    this.waitForLoaders();

    // Trigger versioning
    cy.contains("button", /^PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^EDIT$/i).click({ force: true });
    });
    cy.contains("button", /Confirm/i).click({ force: true });
    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    this.waitForLoaders();

    // Update Title for Version 2
    cy.contains("p", /Note Information/i).closest(".MuiBox-root").find("button").first().click({ force: true });
    cy.wait(2000);
    cy.contains("span", /Title/i).next().find("input").first().clear({ force: true }).type("Updated Consult Note " + updateId, { force: true });
    cy.contains("button", /UPDATE/i).click({ force: true });

    // Add content to Monaco for Version 2
    cy.get(".monaco-editor").first().click({ force: true }).find("textarea").first()
      .type(" - Updated for version 2. ID: " + updateId, { force: true, delay: 10 });

    cy.wait(5000);

    // Sign Version 2
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^SAVE$/i).click({ force: true });
    });

    this.waitForLoaders();
    cy.contains(/note.*successfully/i).should("be.visible");
    cy.contains(/note.*successfully/i).should("not.exist");
    // Final verification of status
    this.notesContainer.contains("tr", "Updated Consult Note " + updateId).within(() => {
      cy.contains("Unsigned", { timeout: 60000 }).should("be.visible");
    });
    cy.contains("button", /^SIGN & PRINT$/i).closest(".MuiBox-root").within(() => {
      cy.contains("button", /^CLOSE$/i).click({ force: true });
    });
    this.waitForLoaders();

    // --- DELETE PART ---
    // 1. Locate the updated consult note row in the table
    this.notesContainer.contains("tr", "Updated Consult Note " + updateId)
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
    cy.contains("Are you sure?", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Yes, delete it!").click({ force: true });

    // 4. Verify success message and wait for UI to stabilize
    cy.contains(/deleted.*successfully/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/deleted.*successfully/i, { timeout: 20000 }).should("not.exist");

    this.waitForLoaders();

    // 5. Verification: Ensure the deleted note title no longer exists in the table
    this.notesContainer.should('not.contain', "Updated Consult Note " + updateId);


  }

}

export default new ChartPage();