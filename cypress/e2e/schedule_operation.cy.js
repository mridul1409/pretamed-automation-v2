import schedulePage from "./pages/SchedulePage";

describe("Schedule Page Performance and Navigation Workflow", () => {
  let serialNumber = 1;

  const today = new Date();
  const dynamicToday = `${today.getDate().toString().padStart(2, '0')}/${today.toLocaleString('default', { month: 'short' })}/${today.getFullYear()}`;

  const INPUT_DATA = {
    patientSearch: "remon",
    patientFullName: "remon, Roy",
    targetDate: dynamicToday,
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    eventType: "New",
    visitReason: "Regular follow-up session",
    referringProvider: "Mridul"
  };

  before(() => {
    cy.task("initOperationReport", {
      title: "Schedule Page Operation",
      url: Cypress.config().baseUrl + Cypress.env("SCHEDULE_PATH")
    });
  });

  afterEach(function () {
    cy.task("writeOperationTableReport", {
      sn: serialNumber++,
      name: this.currentTest.title,
      status: this.currentTest.state,
      errorLog: this.currentTest.err ? this.currentTest.err.message : "No errors detected",
    });
  });

  it("Step 1: Navigate to Schedule Page", () => {
    schedulePage.navigateToSchedule();
    schedulePage.waitForLoaders();
    schedulePage.addEventBtn.should('be.visible');
  });

  it("Step 2: Create Schedule (Without Referral Provider)", () => {
    schedulePage.openAddEventForm();
    schedulePage.fillPatientDetails(INPUT_DATA.patientSearch, INPUT_DATA.patientFullName);
    schedulePage.fillDateTime(INPUT_DATA.targetDate, INPUT_DATA.startTime, INPUT_DATA.endTime);
    schedulePage.selectEventType(INPUT_DATA.eventType);

    cy.contains('p', /Reason for visit/i).parent().find('input').type(INPUT_DATA.visitReason, { force: true });

    schedulePage.handleDuplicateAndSave();
  });

  it("Step 3: Create Schedule (With Referral Provider)", () => {
    schedulePage.openAddEventForm();
    schedulePage.fillPatientDetails(INPUT_DATA.patientSearch, INPUT_DATA.patientFullName);
    schedulePage.fillDateTime(INPUT_DATA.targetDate, INPUT_DATA.startTime, INPUT_DATA.endTime);
    schedulePage.selectEventType(INPUT_DATA.eventType);

    // Visit Reason
    cy.contains('p', /Reason for visit/i).parent().find('input').type(INPUT_DATA.visitReason, { force: true });

    // Add Referring Provider
    schedulePage.fillReferringProvider(INPUT_DATA.referringProvider);

    schedulePage.handleDuplicateAndSave();
  });

  after(() => {
    cy.log(">>> SCHEDULE PAGE WORKFLOW COMPLETED! ✅");
  });
});