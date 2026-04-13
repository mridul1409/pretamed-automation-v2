import orgPage from "./pages/OrgPage";
import patientPage from "./pages/PatientPage";

describe("Complete Patient Onboarding Workflow", () => {
    let uniqueId = Date.now();
    let serialNumber = 1;

    const newOrgName = `Mridul Org ${uniqueId}`;
    const newOrgUniqId = `demo-${uniqueId}`;
    const uniquePHN = "9" + Math.floor(100000000 + Math.random() * 900000000);

    const ORG_DATA = {
        type: "Hospital", rooms: "6", beds: "20", country: "Canada",
        address: "3359 Maynard Rd", city: "Vancouver", state: "Nunavut",
        postalCode: "3433", phone: "1 (111) 111-1111", fax: "(222) 222-2222",
        emergencyPhone: "(333) 333-3333", email: "demo@email.com"
    };

    const PATIENT_DATA = {
        country: "Canada", province: "British Columbia", dob: "1990-01-01",
        firstName: "Mehedi", lastName: "Mridul", gender: "male",
        address: "123 Medical Plaza", city: "Vancouver", phone: "6045550199",
        pcp: "Dr. John Smith"
    };

    before(() => {
        cy.task("initOperationReport", {
            title: "Organization and Patient Creation",
            url: Cypress.config().baseUrl + Cypress.env('ORG_PATH'),
            mode: "new"
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

    it("Step 1: Create New Organization", () => {
        orgPage.navigateToOrg();
        orgPage.createOrgBtn.click({ force: true });
        orgPage.fillOrgForm(ORG_DATA, newOrgName, newOrgUniqId);
        orgPage.waitForLoaders();
        const expectedUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env('ORG_PATH');
        cy.url({ timeout: 60000 }).should("eq", expectedUrl);
        orgPage.waitForLoaders();

    });

    it("Step 2: Create New Patient under New Org", () => {
        orgPage.switchOrganization(newOrgName);
        patientPage.waitForLoaders();
        patientPage.waitForPatientPageUrl();
        patientPage.verifyPatientTableContent();
        cy.wait(5000)
        patientPage.waitForLoaders();

        patientPage.openInitialModal();
        patientPage.fillInitialInfo(PATIENT_DATA, uniquePHN);
        patientPage.fillDetailedProfile(PATIENT_DATA, uniqueId);
        cy.contains(/Patient.*successfully/i, { timeout: 30000 }).should('be.visible');
        patientPage.waitForLoaders();

    });
});