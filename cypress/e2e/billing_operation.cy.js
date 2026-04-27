import orgPage from "./pages/OrgPage";
import chartPage from "./pages/ChartPage";
import billingPage from "./pages/BillingPage";
import billingDashboardPage from "./pages/BillingDashboardPage";

describe("Verification of Billing Note Creation", () => {
  let serialNumber = 1;
  const uniqueId = Date.now();

  // Test data for verification
  const TEST_DATA = {
    targetOrg: "ABC",
    targetPatient: "Kidd, James",
  };

  before(() => {
    // Initializing report for this test session
    cy.task("initOperationReport", {
      title: "Billing Note Verification",
      url: Cypress.config().baseUrl + Cypress.env("PATIENT_CHART_PATH"),
      mode: "new",
    });
  });

  afterEach(function () {
    // Writing test status to the report file
    cy.task("writeOperationTableReport", {
      sn: serialNumber++,
      name: this.currentTest.title,
      status: this.currentTest.state.toUpperCase(),
      errorLog: this.currentTest.err
        ? this.currentTest.err.message
        : "No errors detected",
    });
  });

  it("Navigate to Patient Chart", () => {
    // konstrukt list URL and visit
    const listUrl =
      Cypress.config().baseUrl.replace(/\/$/, "") +
      Cypress.env("PATIENT_LIST_PATH");
    cy.visit(listUrl);

    // Switch org and enter patient chart
    orgPage.switchOrganization(TEST_DATA.targetOrg);
    chartPage.navigateToPatientChart(
      TEST_DATA.targetOrg,
      TEST_DATA.targetPatient,
    );
  });

  it("Create a new clinical note for billing", () => {
    // This calls your newly added method in ChartPage.js
    chartPage.createNoteForBilling();

    // Final check: Verify if the 'Start a New Bill' button is visible after the method runs
    cy.contains("button", /Start a New Bill/i, { timeout: 30000 }).should(
      "be.visible",
    );
  });

  it("Billing Operation: Bill To: MSP as FFS", () => {
    const DATA_CENTER = "Data Center 1";
    const PAYEE = "12345 - Dr. Traideas Dev";
    const DIAG_CODE = "432";
    const SERVICE_CODE = "121";
    const BILL_NOTE = "FFS Automated Bill - " + uniqueId;

    // 1. Initiate the billing process (Clicks 'Start a New Bill')
    billingPage.initiateNewBill();

    // 2. Select mandatory basic dropdowns (MSP and FFS)
    billingPage.fillBasicBillingInfo(DATA_CENTER, PAYEE, "MSP", "FFS");

    // 3. Fill specific FFS details (Practitioner, Facility info etc.)
    billingPage.fillFFSDetails();

    // 4. Add a service row in the summary table (Diag Code, Service Code, Units)
    billingPage.addServiceRow(DIAG_CODE, SERVICE_CODE, "1");

    // 5. Write billing note, save the bill and handle final confirmation
    billingPage.saveAndCloseBill(BILL_NOTE);

    billingPage.closeDrawerAndVerifyReturn();
  });

  it("Billing Operation: Bill To: MSP as PBF", () => {
    // Standard data for the PBF billing form
    const DATA_CENTER = "V0081"; // Using the code from your screenshot
    const PAYEE = "12345 - Dr. Traideas Dev";
    const DIAG_CODE = "432";
    const SERVICE_CODE = "121";
    const BILL_NOTE = "PBF Automated Bill - " + uniqueId;

    // 1. Create a fresh note to enable the billing button for this test
    chartPage.createNoteForBilling();

    // 2. Initiate the billing process (Clicks 'Start a New Bill')
    billingPage.initiateNewBill();

    // 3. Select basic dropdowns including 'MSP' as 'PBF'
    // This also handles the 'Service Location Code' internally
    billingPage.fillBasicBillingInfo(DATA_CENTER, PAYEE, "MSP", "PBF");

    billingPage.fillFFSDetails();

    // 4. Add a service row in the summary table (Diag Code, Service Code, Units)
    // Note: PBF mode usually doesn't require filling 'More Billing Details'
    billingPage.addServiceRow(DIAG_CODE, SERVICE_CODE, "1");

    // 5. Write billing note, save the bill and handle final confirmation
    billingPage.saveAndCloseBill(BILL_NOTE);

    // 6. Final cleanup: Close the drawer and return to chart view
    billingPage.closeDrawerAndVerifyReturn();
  });

  it("Billing Operation: Bill To: MSP as PP", () => {
    // Standard data for the PP billing form
    const DATA_CENTER = "V0081";
    const PAYEE = "12345 - Dr. Traideas Dev";
    const DIAG_CODE = "432";
    const SERVICE_CODE = "121";
    const BILL_NOTE = "PP Automated Bill - " + uniqueId;
    const PP_ADDRESS = "123 Medical Plaza, Vancouver, BC";
    const PP_POSTAL = "V6B 1A1";

    // 1. Create a note and initiate bill
    chartPage.createNoteForBilling();
    billingPage.initiateNewBill();

    // 2. Fill basic info as PP
    billingPage.fillBasicBillingInfo(DATA_CENTER, PAYEE, "MSP", "PP");

    // 3. Fill PP specific Address fields
    billingPage.fillPPAddress(PP_ADDRESS, PP_POSTAL);

    // 4. Expand and fill additional Practitioner details (FFS style)
    billingPage.fillFFSDetails();

    // 5. Add service row and finalize
    billingPage.addServiceRow(DIAG_CODE, SERVICE_CODE, "1");
    billingPage.saveAndCloseBill(BILL_NOTE);

    // 6. Close and verify return to chart
    billingPage.closeDrawerAndVerifyReturn();
  });

  it("Billing Operation: Bill To: MSP as IN", () => {
    // Standard data for the IN billing form
    const DATA_CENTER = "V0081";
    const PAYEE = "12345 - Dr. Traideas Dev";
    const DIAG_CODE = "432";
    const SERVICE_CODE = "121";
    const BILL_NOTE = "IN Automated Bill - " + uniqueId;
    const IN_ADDRESS = "123 Medical Plaza, Vancouver, BC";
    const IN_POSTAL = "V6B 1A1";
    const INST_NUMBER = "123";

    // 1. Setup and Initialization
    chartPage.createNoteForBilling();
    billingPage.initiateNewBill();

    // 2. Fill basic info as Institutional (IN)
    billingPage.fillBasicBillingInfo(DATA_CENTER, PAYEE, "MSP", "IN");

    // 3. Fill IN specific fields (Address + Institution No)
    billingPage.fillINFields(IN_ADDRESS, IN_POSTAL, INST_NUMBER);

    // 4. Expand and fill additional Practitioner details
    billingPage.fillFFSDetails();

    // 5. Add service row and finalize
    billingPage.addServiceRow(DIAG_CODE, SERVICE_CODE, "1");
    billingPage.saveAndCloseBill(BILL_NOTE);

    // 6. Verification and Cleanup
    billingPage.closeDrawerAndVerifyReturn();
  });

  it("Billing Operation: Bill To: ICBC", () => {
    // Standard data for the ICBC billing form
    const DATA_CENTER = "V0081";
    const PAYEE = "12345 - Dr. Traideas Dev";
    const DIAG_CODE = "432";
    const SERVICE_CODE = "121";
    const BILL_NOTE = "ICBC Automated Bill - " + uniqueId;
    const ICBC_CLAIM = "ICBC-" + Math.floor(Math.random() * 1000000);

    // 1. Create a note to enable billing button
    chartPage.createNoteForBilling();

    // 2. Initiate the billing process
    billingPage.initiateNewBill();

    // 3. Fill basic info as ICBC (Selecting ICBC from dropdown)
    billingPage.fillBasicBillingInfo(DATA_CENTER, PAYEE, "ICBC", "FFS");

    // 4. Fill ICBC specific Claim Number
    billingPage.fillICBCClaim(ICBC_CLAIM);

    // 5. Expand and fill additional Practitioner details (FFS style)
    billingPage.fillFFSDetails();

    // 6. Add service row and finalize the bill
    billingPage.addServiceRow(DIAG_CODE, SERVICE_CODE, "1");
    billingPage.saveAndCloseBill(BILL_NOTE);

    // 7. Cleanup and verification
    billingPage.closeDrawerAndVerifyReturn();
  });

  it("Billing Operation: Bill To: WSBC", () => {
    // Standard data for the WSBC billing form
    const DATA_CENTER = "V0081";
    const PAYEE = "12345 - Dr. Traideas Dev";
    const DIAG_CODE = "432";
    const SERVICE_CODE = "121";
    const BILL_NOTE = "WSBC Automated Bill - " + uniqueId;
    const WSBC_CLAIM = "WSBC-" + Math.floor(Math.random() * 1000000);
    const INJURY_DATE = "2026-02-01";

    // 1. Setup: Create a note for billing
    chartPage.createNoteForBilling();
    billingPage.initiateNewBill();

    // 2. Fill basic info as WSBC
    billingPage.fillBasicBillingInfo(DATA_CENTER, PAYEE, "WSBC", "FFS");

    // 3. Fill WSBC specific fields
    billingPage.fillWSBCFields(WSBC_CLAIM, INJURY_DATE);

    // 4. Expand and fill additional Practitioner details (FFS style)
    billingPage.fillFFSDetails();

    // 5. Add service row in the summary table
    billingPage.addServiceRow(DIAG_CODE, SERVICE_CODE, "1");

    // 6. Save and finalize
    billingPage.saveAndCloseBill(BILL_NOTE);

    // 7. Cleanup and verify return to chart
    billingPage.closeDrawerAndVerifyReturn();
  });

  it("Teleplan Settings: Run Login Test", () => {
    // 1. Navigate to Dashboard using POM
    billingDashboardPage.navigateToDashboard();

    // 2. Execute Login Test flow and verify success
    billingDashboardPage.runTeleplanLoginTest();

    cy.log(">>> Teleplan Login Test completed successfully.");
  });

  after(() => {
    cy.log(">>> BILLING NOTE VERIFICATION COMPLETED! ✅");
  });
});
