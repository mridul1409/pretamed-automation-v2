class FaxPage {
  // Selectors
  get loaderSelectors() {
    return ".MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root";
  }
  get accountIcon() {
    return cy.get('button[aria-label="account of current user"]', {
      timeout: 30000,
    });
  }
  get faxContactMenu() {
    return cy.contains("li, div, p", /Fax Contact/i);
  }
  get addNewBtn() {
    return cy.contains("button", /ADD NEW/i);
  }
  get refreshBtn() {
    return cy.get('button[aria-label="Refresh"]');
  }
  get inboxTab() {
    return cy.get('div[aria-label="INBOX"]');
  }
  get queuedTab() {
    return cy.get('div[aria-label="QUEUED"]');
  }
  get cancelBtn() {
    return cy.contains("button", /CANCEL/i);
  }

  // Actions
  waitForLoaders() {
    cy.get(this.loaderSelectors, { timeout: 300000 }).should("not.exist");
  }

  checkAndCloseDayAgenda() {
    cy.get("body").then(($body) => {
      if (
        $body.find('button:contains("Day")').length > 0 &&
        $body.find('button:contains("Agenda")').length > 0
      ) {
        // Implementation for closing if selector is known
      }
    });
  }

  navigateToFax() {
    const inboxUrl =
      Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("INBOX_PATH");
    cy.visit(inboxUrl);
    this.waitForLoaders();
  }

  openFaxContactModal() {
    cy.get("body").should("be.visible");

    this.accountIcon.should("be.visible").first().click({ force: true });

    this.faxContactMenu.should("be.visible").click({ force: true });
    this.waitForLoaders();
  }

  fillContactForm(data, uniqueFax) {
    cy.contains("span", /Fax Number/i)
      .parent()
      .find("input")
      .first()
      .type(uniqueFax, { force: true });
    cy.contains("span", /Name/i)
      .parent()
      .find("input")
      .first()
      .type(data.name, { force: true });
    cy.contains("span", /Email/i)
      .parent()
      .find("input")
      .first()
      .type(data.email, { force: true });
    cy.contains("span", /MSP/i)
      .parent()
      .find("input")
      .first()
      .type(data.msp, { force: true });
    cy.contains("span", /Phone/i)
      .parent()
      .find("input")
      .first()
      .type(data.phone, { force: true });
    cy.contains("span", /Address/i)
      .parent()
      .find("textarea, input")
      .first()
      .type(data.address, { force: true });

    cy.contains("button", /^ADD$/i).should("be.enabled").click({ force: true });
  }

  verifyContactVisible(uniqueFax, name) {
    cy.contains("h2", /Fax Contact/i)
      .closest(".MuiPaper-root")
      .within(() => {
        cy.get('input[placeholder="Search Contact"]')
          .clear({ force: true })
          .type(uniqueFax, { delay: 100, force: true });
      });
    this.waitForLoaders();
    cy.contains("h2", /Fax Contact/i)
      .closest(".MuiPaper-root")
      .find(".MuiTable-root")
      .contains("th", name)
      .should("be.visible");
  }

  closeModal() {
    cy.get("body").then(($body) => {
      if ($body.find(".MuiDialog-root").length > 0) {
        cy.get(".MuiDialog-root")
          .contains("button", /CANCEL/i)
          .filter(":visible")
          .click({ force: true });
        cy.get(".MuiDialog-root").should("not.exist");
      }
    });
  }

  // Selectors for Task Manager
  get taskTab() {
    return cy.get('div[aria-label="TASK"]');
  }
  get createTaskBtn() {
    return cy.contains("button", /CREATE TASK/i);
  }

  /**
   * Switches to the Task Manager view within the current Fax module
   */
  navigateToTasks() {
    // Clicking the TASK tab on the left sidebar
    this.taskTab.should("be.visible").click({ force: true });

    // Waiting for initial tasks to load
    this.waitForLoaders();

    // Confirming that the Task Manager UI is ready
    this.createTaskBtn.should("be.visible", { timeout: 30000 });
    this.waitForLoaders();
  }

  /**
   * Clicks Create Task and waits for the form to appear
   */
  openCreateTaskForm() {
    this.createTaskBtn.should("be.visible").click({ force: true });
    this.waitForLoaders();

    // Wait for the specific text to confirm form is loaded
    cy.contains("Create New Task", { timeout: 30000 }).should("be.visible");
    this.waitForLoaders();
  }

  /**
   * Fills the task creation form and clicks CREATE
   */
  fillTaskFormAndCreate(taskData) {
    // 1. Fill Title
    cy.contains("p", /Title \*/i)
      .parent()
      .find("input")
      .should("be.visible")
      .type(taskData.title, { force: true });

    // 2. Fill Description - FIXED: Added .first() to handle multiple elements
    cy.contains("p", /Description/i)
      .parent()
      .find("input, textarea")
      .should("be.visible")
      .first() // Ensures only the visible input/textarea is targeted
      .type(taskData.description, { force: true });

    // 3. Select Priority
    cy.contains("p", /^Priority$/i)
      .parent() // Targets the container holding the Priority label and buttons
      .contains("button", /High/i) // Finds the 'High' button within that specific container
      .click({ force: true });

    // Select Status from the form
    // Select Status from the form
    // 1. Find the button containing the text 'Todo' within the Status section and click it
    cy.contains("p", /^Status$/i)
      .parent()
      .find("button")
      .contains(/Todo/i)
      .click({ force: true });

    // 2. Select 'Discussion' from the appearing menu options
    cy.get('li[role="menuitem"]', { timeout: 10000 })
      .contains(/Discussion/i)
      .should("be.visible")
      .click({ force: true });

    // Select Duration as 1M
    // We anchor to the 'Duration' label to isolate the button group in the form
    cy.contains("p", /^Duration$/i)
      .parent() // Targets the container holding the Duration label and buttons
      .contains("button", /^1M$/) // Finds the exact '1M' button
      .should("be.visible")
      .click({ force: true });

    // 4. Search and Select Assignee
    cy.get('input[placeholder="Search assignee..."]')
      .should("be.visible")
      .type(taskData.assignee, { delay: 100, force: true });

    cy.get(".autocomplete-option", { timeout: 15000 })
      .first()
      .should("be.visible")
      .click({ force: true });

    // 5. Search and Select Patient
    cy.get('input[placeholder="Search patient (optional)"]')
      .should("be.visible")
      .type(taskData.patient, { delay: 100, force: true });

    cy.get(".autocomplete-option", { timeout: 15000 })
      .first()
      .should("be.visible")
      .click({ force: true });

    // 6. Click the CREATE button
    cy.contains("button", /^CREATE$/i)
      .should("be.enabled")
      .click({ force: true });

    this.waitForLoaders();
    // 7. Verification: Check if the new task title is visible in the task table
    cy.get("table tbody", { timeout: 30000 })
      .contains("p", taskData.title)
      .scrollIntoView()
      .should("be.visible");

    cy.log(">>> Task stored and verified in table: " + taskData.title);
  }
}

export default new FaxPage();
