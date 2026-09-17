import chartPage from "./pages/ChartPage";
import orgPage from "./pages/OrgPage";
import patientPage from "./pages/PatientPage";

describe("Patient Chart Clinical Operations", () => {
    let serialNumber = 1;
    let currentOpInfo = null;

    const TARGET_ORG = Cypress.env("TARGET_ORG");
    const TARGET_PATIENT = Cypress.env("TARGET_PATIENT_NAME");

    const TEST_DATA = {
        targetOrg: "Manu 001",
        targetPatient: "Arif, Test"
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


        const CREATE_MED_ALLERGY = {
            substance: "Penic",
            category: "Medication",
            reaction: "Severe hives",
            clinicalStatus: "Active",
            verificationStatus: "Confirmed",
            criticality: "High"
        };

        const UPDATE_MED_ALLERGY = {
            substance: "Amoxic",
            criticality: "Low"
        };

        chartPage.medicationAllergyCRUD(CREATE_MED_ALLERGY, UPDATE_MED_ALLERGY);
    });

    it("Allergy - Food", () => {
        const CREATE_FOOD_ALLERGY = {
            substance: "Peanut",
            category: "Food",
            reaction: "Hives and vomiting",
            clinicalStatus: "Active",
            verificationStatus: "Confirmed",
            criticality: "High"
        };

        const UPDATE_FOOD_ALLERGY = {
            substance: "Egg",
            criticality: "Low"
        };

        chartPage.foodAllergyCRUD(CREATE_FOOD_ALLERGY, UPDATE_FOOD_ALLERGY);
    });

    it("Allergy - Environmental", () => {
        const CREATE_ENV_ALLERGY = {
            substance: "Dust",
            category: "Environmental",
            reaction: "Sneezing and runny nose",
            clinicalStatus: "Active",
            verificationStatus: "Confirmed",
            criticality: "Low"
        };

        const UPDATE_ENV_ALLERGY = {
            substance: "Pollen",
            criticality: "High"
        };

        chartPage.environmentalAllergyCRUD(CREATE_ENV_ALLERGY, UPDATE_ENV_ALLERGY);
    });

    it("Allergy - Biologic", () => {
        const CREATE_BIO_ALLERGY = {
            substance: "Insulin",
            category: "Biologic",
            reaction: "Local swelling",
            clinicalStatus: "Active",
            verificationStatus: "Confirmed",
            criticality: "High"
        };

        const UPDATE_BIO_ALLERGY = {
            substance: "Vaccine",
            criticality: "Low"
        };

        chartPage.biologicAllergyCRUD(CREATE_BIO_ALLERGY, UPDATE_BIO_ALLERGY);
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

    it("Medical History", () => {
        const INITIAL_MEDICAL_HX_DATA = {
            diagnosis: "Hyper",
            verification: "Confirmed",
            clinicalStatus: "Active",
            onsetAge: "21",
            onsetComment: "Initial onset noticed during routine check.",
            abatementAge: "25",
            abatementComment: "Remission observed after treatment.",
            severity: "Moderate to severe",
            bodySite: "Articular cartilage",
            stage: "Stage I",
            asserter: "Mehedi Hasan"
        };

        const UPDATED_MEDICAL_HX_DATA = {
            diagnosis: "Dia",
            verification: "Refuted",
            clinicalStatus: "Resolved",
            severity: "Mild",
            onsetAge: "30",
            abatementAge: "35"
        };

        // // 1. Create
        chartPage.createMedicalHistory(INITIAL_MEDICAL_HX_DATA);

        // 2. Update
        chartPage.updateMedicalHistory(INITIAL_MEDICAL_HX_DATA.diagnosis, UPDATED_MEDICAL_HX_DATA);

        // 3. Delete
        chartPage.deleteMedicalHistory(UPDATED_MEDICAL_HX_DATA.diagnosis);
    });

    it("Family History", () => {
        const INITIAL_FAMILY_HX_DATA = {
            diagnosis: "Diabetes",
            relationship: "Mother",
            condition: "Gas gangrene",
            age: "23",
            comment: "Started with pain",
            outcome: "Patient condition resolved",
            note: "Automation note",
            procedure: "Faradic nerve",
            procedureAge: "43",
            procedureComment: "Follow up needed",
            reason: "Reaction to repetitive",
            referenceType: "Faradic nerve",
            relativeName: "Jane Doe",
            sex: "Female",
            status: "Completed",
            dataAbsentReason: "Subject unknown",
            personalComment: "Born in 1960",
            note: "General note about relative's medical history"
        };

        const UPDATED_FAMILY_HX_DATA = {
            diagnosis: "Asthma",
            relationship: "Father",
            condition: "Gas gangrene",
            age: "30",
            comment: "Updated pain level",
            relativeName: "John Doe",
            sex: "Male"
        };


        chartPage.createFamilyHistory(INITIAL_FAMILY_HX_DATA);
        chartPage.updateFamilyHistory(INITIAL_FAMILY_HX_DATA.diagnosis, UPDATED_FAMILY_HX_DATA);
        chartPage.deleteFamilyHistory(UPDATED_FAMILY_HX_DATA.diagnosis);

    });

    it("Surgical History", () => {
        const SURGICAL_HX_DATA = {
            surgeryName: "Appendectomy",
            surgeryDate: "05/15/2024",
            profileType: "Surgical (past surgeries)",
            status: "Entered In Error",
            category: "Surgical procedure",
            performedDate: "2024-05-15",
            outcome: "Successful",
            location: "General Hospital OR 3",
            reason: "Appendicitis",
            bodySite: "Appendix",
            complication: "Minor bleeding",
            followUp: "Removal of sutures after 10 days",
            note: "Patient tolerated the procedure well without issues."
        };

        const UPDATED_SURGICAL_HX_DATA = {
            surgeryName: "Glaucoma",
            status: "In Progress",
            outcome: "Successful",
            location: "City Central Clinic OR 2",
            complication: "None reported",
            note: "Updated follow-up clinical note."
        };

        chartPage.createSurgicalHistory(SURGICAL_HX_DATA);


        chartPage.updateSurgicalHistory(SURGICAL_HX_DATA.surgeryName, UPDATED_SURGICAL_HX_DATA);
        chartPage.deleteSurgicalHistory(UPDATED_SURGICAL_HX_DATA.surgeryName);

    })

    it("Social History", () => {
        const SOCIAL_HX_DATA = {
            observation: "Tobacco smoking status",
            startDate: "2024-01-10",
            endDate: "2024-06-15",
            note: "Smoked occasionally during social events",
            bodySite: "Resp",
            method: "Patient-reported",
            componentCode: "Cigarettes smoked per day",
            componentValue: "15",
            interpretation: "Normal",
            performerType: "Practitioner",
            performerPerson: "Mehedi Hasan"
        };

        const UPDATED_SOCIAL_HX_DATA = {
            observation: "Alcohol drinking status",
            note: "Updated social history note",
            method: "Clinic interview",
            componentCode: "Alcoholic drinks per day",
            componentValue: "2"
        };

        chartPage.createSocialHistory(SOCIAL_HX_DATA);


        chartPage.updateSocialHistory(SOCIAL_HX_DATA.observation, UPDATED_SOCIAL_HX_DATA);

        chartPage.deleteSocialHistory(UPDATED_SOCIAL_HX_DATA.observation);

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