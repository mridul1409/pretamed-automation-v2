import faxPage from "./pages/FaxPage";

describe("Fax Operations Workflow", () => {
  let serialNumber = 1;
  const uniqueFax = "1" + Math.floor(100000000 + Math.random() * 900000000);

  const CONTACT_INFO = {
    name: "Mridul",
    email: "mridul.test@pretamed.com",
    msp: "12345",
    phone: "16045550199",
    address: "Vancouver, Canada",
  };

  before(() => {
    cy.task("initOperationReport", {
      title: "Fax Page",
      url: Cypress.config().baseUrl + Cypress.env("INBOX_PATH"),
      mode: "new",
    });
  });

  afterEach(function () {
    cy.task("writeOperationTableReport", {
      sn: serialNumber++,
      name: this.currentTest.title,
      status: this.currentTest.state,
      errorLog: this.currentTest.err
        ? this.currentTest.err.message
        : "No errors detected",
    });
  });

  it("Step 1: Navigate to Fax Inbox Page", () => {
    faxPage.navigateToFax();
    cy.url().should("include", "/inbox");
    cy.contains("button", /COMPOSE/i, { timeout: 30000 }).should("be.visible");
    faxPage.waitForLoaders();
  });

  it("Step 2: Create Fax Contact via User Profile", () => {
    faxPage.openFaxContactModal();
    faxPage.addNewBtn.click({ force: true });

    // Fill form with unique fax data
    faxPage.fillContactForm(CONTACT_INFO, uniqueFax);

    // Verification
    cy.contains(/ *created.*successfully/i, { timeout: 30000 }).should(
      "be.visible",
    );
    faxPage.verifyContactVisible(uniqueFax, CONTACT_INFO.name);
    faxPage.waitForLoaders();
  });

  it("Step 3: Verify Inbox and Queued Tabs", () => {
    faxPage.closeModal();

    // Check Inbox
    faxPage.inboxTab.click({ force: true });
    faxPage.refreshBtn.click({ force: true });
    faxPage.waitForLoaders();
    cy.contains("From Fax").should("be.visible");

    // Check Queued
    faxPage.queuedTab.click({ force: true });
    faxPage.refreshBtn.click({ force: true });
    faxPage.waitForLoaders();
    cy.contains("Recipient").should("be.visible");
    faxPage.waitForLoaders();
  });

it("Step 4: Navigate to Task Manager within Fax Module", () => {
    // 1. Define the data to be used for task creation
    const TASK_DATA = {
        title: "Automated Task " + Date.now(),
        description: "Testing task creation via Cypress automation.",
        assignee: "mridul", // Name to search in assignee dropdown
        patient: "remon"    // Name to search in patient dropdown
    };

    // 2. Switching to Task Manager view
    faxPage.navigateToTasks();
    cy.log(">>> Task Manager loaded.");

    // 3. Clicking CREATE TASK button and waiting for the form header
    faxPage.openCreateTaskForm();
    cy.log(">>> Create New Task form is now visible.");

    // 4. Entering all information and clicking CREATE
    // Now TASK_DATA is defined and can be passed as an argument
    faxPage.fillTaskFormAndCreate(TASK_DATA);

    // 5. Success verification
    cy.log(">>> Task created successfully and verified.");

  });

  after(() => {
    cy.log(">>> FAX OPERATIONS JOURNEY COMPLETED! ✅");
  });
});
