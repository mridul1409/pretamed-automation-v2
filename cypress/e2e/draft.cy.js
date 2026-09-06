import orgPage from "./pages/OrgPage";
import patientPage from "./pages/PatientPage";

describe("Complete Patient Onboarding Workflow", () => {
    let uniqueId = Math.floor(Math.random() * 900) + 100;

    let serialNumber = 1;
    const torg = "Alpha Clinic";

    const newOrgName = `Test Org ${uniqueId}`;
    const newOrgUniqId = `demo-${uniqueId}`;
    const uniquePHN = "9" + Math.floor(100000000 + Math.random() * 900000000);

    const ORG_DATA = {
        type: "Hospital", rooms: "6", beds: "20", country: "Canada",
        address: "3359 Maynard Rd", city: "Vancouver", state: "Nunavut",
        postalCode: "3433", phone: "1 (111) 111-1111", fax: "(222) 222-2222",
        emergencyPhone: "(333) 333-3333", email: "demo@email.com",
        phone: "16045550111",
        fax: "16045550222",
        emergencyPhone: "16045550333",
        email: "demo@email.com"
    };

    const PATIENT_DATA = {
        country: "Canada",
        province: "British Columbia",
        dob: "1990-01-01",
        firstName: "Mehedi",
        lastName: "Mridul",
        gender: "male",
        address: "123 Medical Plaza",
        city: "Vancouver",
        postalCode: "V6B 1A1",
        phone: "16045550199",
        pcp: "mridul",
        referralProvider: "limon",
        emergencyName: "Emergency Hasan",
        emergencyPhone: "16041112222",
        emergencyEmail: `em.${uniqueId}@test.com`,
        emergencyRelationship: "Brother"
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

    // it("Step 1: Create New Organization", () => {
    //             cy.intercept('POST', '**/orgntzn/crt').as('createOrgApi');

    //     orgPage.navigateToOrg();
    //     orgPage.createOrgBtn.click({ force: true });
    //     orgPage.fillOrgForm(ORG_DATA, newOrgName, newOrgUniqId);
    //     cy.wait('@createOrgApi').then((interception) => {
    //         // Path based on your screenshot: response -> body -> data -> organizationId
    //         const orgId = interception.response.body.data.organizationId;

    //         cy.log(">>> Successfully extracted Org ID from API: " + orgId);

    //         // Basic assertion to ensure we have a valid ID before proceeding
    //         expect(orgId).to.be.a('string');
    //         expect(orgId).to.have.length.gt(0);

    //         // 4. Final Verification using the extracted ID and href attribute
    //         orgPage.verifyOrgByHrefId(orgId);
    //     });
    //     orgPage.verifyOrgCreated(newOrgName);
    // });

    it("Step 2: Create New Patient under New Org", () => {
        orgPage.navigateToOrg();
        cy.intercept('POST', '**/patient').as('createPatientApi');

        orgPage.switchOrganization(torg);
        patientPage.waitForLoaders();
        patientPage.waitForPatientPageUrl();
        patientPage.verifyPatientTableContent();
        cy.wait(5000)
        patientPage.waitForLoaders();

        cy.intercept('POST', '**/patient/srcphn').as('srcPhnApi');
        cy.intercept('POST', '**/frntndrr/crt').as('logApi');

        patientPage.openInitialModal();
        patientPage.fillInitialInfo(PATIENT_DATA, uniquePHN);
        cy.wait('@srcPhnApi').its('response.statusCode').should('eq', 200);
        cy.wait('@logApi').then((interception) => {
            // Verify that the error log confirms 'No Patient Found' (which is a success for creation)
            expect(interception.response.statusCode).to.be.oneOf([200, 201]);
            expect(interception.response.body.message).to.include("Frontend error log created successfully");
        });

        cy.url({ timeout: 20000 }).should("include", "/patient-create");
        cy.contains("Create Patient", { timeout: 30000 })
        cy.wait(3000)

        patientPage.fillDetailedProfile(PATIENT_DATA, uniqueId);
        cy.wait('@createPatientApi').then((interception) => {
            const patientId = interception.response.body._id;
            expect(patientId).to.be.a('string');
            expect(patientId).to.have.length.gt(0);

            patientPage.verifyPatientChartOpened(patientId);
        });

        cy.contains(/Patient.*successfully/i, { timeout: 30000 }).should('be.visible');
        patientPage.waitForLoaders();

    });
});