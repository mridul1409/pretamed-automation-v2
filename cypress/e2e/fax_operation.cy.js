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

it("Step 4: Task Manager CRUD operation", () => {
    const uniqueId = Date.now();
    const initialTitle = "Automated Task " + uniqueId;
    const updatedTitle = "Updated Title " + uniqueId;
    
    const TASK_DATA = {
        title: initialTitle,
        description: "Testing full task lifecycle.",
        assignee: "mridul",
        patient: "remon"
    };

    // 1. Creation
    faxPage.navigateToTasks();
    faxPage.openCreateTaskForm();
    faxPage.fillTaskFormAndCreate(TASK_DATA);

    // 2. Update (Status and Priority)
    faxPage.updateTaskTitle(initialTitle, updatedTitle);

    // 3. DELETE OPERATION (New logic)
    // Deleting the task using its updated title
    faxPage.deleteTask(updatedTitle);

    cy.log(">>> Full Task Lifecycle (Create -> Update -> Delete) completed successfully.");
  });

  after(() => {
    // Wrapping in cy.then to ensure the previous chain is finished
    cy.then(() => {
      cy.log(">>> FAX OPERATIONS JOURNEY COMPLETED! ✅");
    });
  });
});
