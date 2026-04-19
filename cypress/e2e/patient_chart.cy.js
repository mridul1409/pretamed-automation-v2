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

    it("Allergy - Medication", () => {
        currentOpInfo = { name: "Allergy: Medication", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#allergies").length > 0 && $body.find("#allergies").is(':visible')) {
                chartPage.medicationAllergyCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Allergy section is missing. Skipping...");
            }
        });
    });

    it("Allergy - Food", () => {
        currentOpInfo = { name: "Allergy: Food", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#allergies").length > 0 && $body.find("#allergies").is(':visible')) {
                chartPage.foodAllergyCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Food Allergy section is missing. Skipping...");
            }
        });
    });

    it("Allergy - Environmental", () => {
        currentOpInfo = { name: "Allergy: Environmental", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#allergies").length > 0 && $body.find("#allergies").is(':visible')) {
                chartPage.environmentalAllergyCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Environmental Allergy section is missing. Skipping...");
            }
        });
    });

    it("Allergy - Biologic", () => {
        currentOpInfo = { name: "Allergy: Biologic", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#allergies").length > 0 && $body.find("#allergies").is(':visible')) {
                chartPage.biologicAllergyCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Biologic Allergy section is missing. Skipping...");
            }
        });
    });

    it("Vital Measurements", () => {
        currentOpInfo = { name: "Vital Measurements", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#measurements").length > 0 && $body.find("#measurements").is(':visible')) {
                chartPage.vitalMeasurementsCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Vital Measurements section is missing. Skipping...");
            }
        });
    });

    it("Body Measurements", () => {
        currentOpInfo = { name: "Body Measurements", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#phyMeasurements").length > 0 && $body.find("#phyMeasurements").is(':visible')) {
                chartPage.bodyMeasurementsCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Body Measurements section is missing. Skipping...");
            }
        });
    });

    it("Social History", () => {
        currentOpInfo = { name: "Social History", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#socialHx").length > 0 && $body.find("#socialHx").is(':visible')) {
                chartPage.socialHistoryCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Social History section is missing. Skipping...");
            }
        });
    });

    it("Medical History", () => {
        currentOpInfo = { name: "Medical History", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#medicalHx").length > 0 && $body.find("#medicalHx").is(':visible')) {
                chartPage.medicalHistoryCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Medical History section is missing. Skipping...");
            }
        });
    });

    it("Surgical History", () => {
        currentOpInfo = { name: "Surgical History", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#surgicalHx").length > 0 && $body.find("#surgicalHx").is(':visible')) {
                chartPage.surgicalHistoryCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Surgical History section is missing. Skipping...");
            }
        });
    });

    it("Surgical History", () => {
        currentOpInfo = { name: "Surgical History", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#surgicalHx").length > 0 && $body.find("#surgicalHx").is(':visible')) {
                chartPage.surgicalHistoryCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Surgical History section is missing. Skipping...");
            }
        });
    });

    it("Family History", () => {
        currentOpInfo = { name: "Family History", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#familyHx").length > 0 && $body.find("#familyHx").is(':visible')) {
                chartPage.familyHistoryCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Family History section is missing. Skipping...");
            }
        });
    });

    it("Administrator Notes", () => {
        currentOpInfo = { name: "Administrator Notes", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#adminNotes").length > 0 && $body.find("#adminNotes").is(':visible')) {
                chartPage.administratorNotesCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Administrator Notes section is missing. Skipping...");
            }
        });
    });

    it("Order - Medication", () => {
        currentOpInfo = { name: "Order: Medication", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#orders").length > 0 && $body.find("#orders").is(':visible')) {
                chartPage.medicationOrderCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Orders section is missing. Skipping...");
            }
        });
    });

    it("Order - Image", () => {
        currentOpInfo = { name: "Order: Image", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#orders").length > 0 && $body.find("#orders").is(':visible')) {
                chartPage.imageOrderCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Imaging Requisition section is missing. Skipping...");
            }
        });
    });

    it("Order - Lab", () => {
        currentOpInfo = { name: "Order: Lab", status: "PENDING" };

        cy.get('body').then(($body) => {
            if ($body.find("#orders").length > 0 && $body.find("#orders").is(':visible')) {
                chartPage.labOrderCRUD();
                currentOpInfo.status = "PASSED";
            } else {
                currentOpInfo.status = "MISSING";
                cy.log(">>> Lab Requisition section is missing. Skipping...");
            }
        });
    });


});