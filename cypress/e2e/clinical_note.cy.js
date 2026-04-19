import chartPage from "./pages/ChartPage";
import orgPage from "./pages/OrgPage";
import patientPage from "./pages/PatientPage";

describe("Patient Chart Clinical Operations", () => {
    let serialNumber = 1;
    let currentOpInfo = null;

    const TARGET_ORG = Cypress.env("TARGET_ORG");
    const TARGET_PATIENT = Cypress.env("TARGET_PATIENT_NAME");

    const TEST_DATA = {
        targetOrg: "ABC",
        targetPatient: "Kidd, James"
    };

    before(() => {
        cy.task("initOperationReport", {
            title: "Patient Chart CRUD",
            url: Cypress.config().baseUrl + Cypress.env("PATIENT_CHART_PATH"),
            mode: "new"
        });
    });

    afterEach(function () {
        let finalStatus = this.currentTest.state.toUpperCase();
        if (currentOpInfo && currentOpInfo.status !== "PENDING") {
            finalStatus = currentOpInfo.status;
        }

        cy.task("writeOperationTableReport", {
            sn: serialNumber++,
            name: this.currentTest.title,
            status: finalStatus,
            errorLog: finalStatus === "MISSING" ? "Section omitted in chart customization" : (this.currentTest.err ? this.currentTest.err.message : "No errors detected"),
        });
    });

    it("Navigate and Search Patient", () => {
        // Construct the patient list URL from config
        const listUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("PATIENT_LIST_PATH");

        cy.visit(listUrl);
        patientPage.waitForLoaders();
        patientPage.waitForPatientPageUrl();
        patientPage.verifyPatientTableContent();
        orgPage.switchOrganization(TEST_DATA.targetOrg);
        chartPage.navigateToPatientChart(TEST_DATA.targetOrg, TEST_DATA.targetPatient);
    });


    it("Progress Notes", () => {
        currentOpInfo = { name: "Progress Notes", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#notes").length > 0 && $body.find("#notes").is(':visible')) {
                chartPage.progressNoteCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Progress Notes section is missing. Skipping...");
            }
        });
    });


    it("Consult Notes", () => {
        currentOpInfo = { name: "Consult Notes", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#notes").length > 0 && $body.find("#notes").is(':visible')) {
                chartPage.consultNoteCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Consult Notes section is missing. Skipping...");
            }
        });
    });

});