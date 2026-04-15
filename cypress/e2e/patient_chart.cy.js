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
        targetPatient: "remon, Roy"
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

    it("Step 1: Navigate and Search Patient", () => {
        // Construct the patient list URL from config
        const listUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("PATIENT_LIST_PATH");

        cy.visit(listUrl);
        patientPage.waitForLoaders();
        patientPage.waitForPatientPageUrl();
        patientPage.verifyPatientTableContent();
        orgPage.switchOrganization(TEST_DATA.targetOrg);
        chartPage.navigateToPatientChart(TEST_DATA.targetOrg, TEST_DATA.targetPatient);
    });

    it("Visual Acuity", () => {
        currentOpInfo = { name: "Visual Acuity", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#vAcuity").length > 0 && $body.find("#vAcuity").is(':visible')) {
                chartPage.visualAcuityCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Visual Acuity section is missing. Skipping...");
            }
        });
    });

    it("Intraocular Pressure", () => {
        currentOpInfo = { name: "Intraocular Pressure", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#iPressure").length > 0 && $body.find("#iPressure").is(':visible')) {
                chartPage.intraocularPressureCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Intraocular Pressure section is missing. Skipping...");
            }
        });
    });

    it("Level of Care", () => {
        currentOpInfo = { name: "Level of Care", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#levelOfCare").length > 0 && $body.find("#levelOfCare").is(':visible')) {
                chartPage.levelOfCareCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Level of Care section is missing. Skipping...");
            }
        });
    });
});