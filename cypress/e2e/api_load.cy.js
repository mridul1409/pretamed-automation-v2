import perfHelper from "../utils/PerformanceHelper";
import orgPage from "./pages/OrgPage";
import patientPage from "./pages/PatientPage";
import chartPage from "./pages/ChartPage";
import schedulePage from "./pages/SchedulePage";
import faxPage from "./pages/FaxPage";
import billingDashboardPage from "./pages/BillingDashboardPage";

describe("Pret A Med - Performance Benchmarking", () => {
    
    before(() => {
        cy.task("initReport", { mode: "new" });
    });

    const getUrl = (pathKey) => {
        const baseUrl = Cypress.config().baseUrl.replace(/\/$/, "");
        const path = Cypress.env(pathKey) || "";
        return baseUrl + path;
    };

    it("Measure: Home Page Performance", () => {
        perfHelper.startTracking("Home Page", getUrl());
        cy.visit("/");

        // CRITICAL: Every timing capture must be inside a .then() block
        cy.get(".MuiList-root", { timeout: 30000 }).should("be.visible").then(() => {
            perfHelper.capturePrimaryLoad();
        });

        cy.get('li[aria-label="Organization"]').should("be.visible");
        cy.wait(2000); // Wait for background sync
        perfHelper.sendReport();
    });

    it("Measure: Patient List Performance", () => {
        perfHelper.startTracking("Patient List", getUrl("PATIENT_LIST_PATH"));
        
        patientPage.navigateToPatientList();
        cy.contains(/All Patients/i, {timeout: 30000}).should("be.visible").then(() => {
            perfHelper.capturePrimaryLoad();
        });

        patientPage.verifyPatientTableContent();
        cy.wait(2000);
        perfHelper.sendReport();
    });

    it("Measure: Patient Chart Performance", () => {
        const patientName = "remon, Roy"; 
        perfHelper.startTracking("Patient Chart", getUrl("PATIENT_CHART_PATH"));
        
        chartPage.navigateToPatientChart("ABC", patientName);
        chartPage.chartRefreshBtn.should("be.visible").then(() => {
            perfHelper.capturePrimaryLoad();
        });

        cy.wait(2000);
        perfHelper.sendReport();
    });

    it("Measure: Organization Page Performance", () => {
        perfHelper.startTracking("Organization Page", getUrl("ORG_PATH"));
        
        orgPage.navigateToOrg();
        // Capture Primary Load when the main text is visible
        cy.contains("Incoming Request to join the Organization", { timeout: 30000 })
          .should("be.visible")
          .then(() => {
            perfHelper.capturePrimaryLoad();
          });

        orgPage.createOrgBtn.should("be.visible");
        cy.wait(2000); 
        perfHelper.sendReport();
    });

    it("Measure: Schedule Page Performance", () => {
        perfHelper.startTracking("Schedule Page", getUrl("SCHEDULE_PATH"));
        
        schedulePage.navigateToSchedule();
        // Capture Primary Load when 'Add Event' button appears
        schedulePage.addEventBtn.should("be.visible").then(() => {
            perfHelper.capturePrimaryLoad();
        });

        cy.wait(2000);
        perfHelper.sendReport();
    });

    it("Measure: Fax Inbox Performance", () => {
        perfHelper.startTracking("Fax Inbox", getUrl("INBOX_PATH"));
        
        faxPage.navigateToFax();
        // Capture Primary Load when COMPOSE button is visible
        cy.contains("button", /COMPOSE|CREATE TASK/i, { timeout: 30000 })
          .should("be.visible")
          .then(() => {
            perfHelper.capturePrimaryLoad();
          });

        cy.wait(2000);
        perfHelper.sendReport();
    });

    it("Measure: Bill Manager Dashboard Performance", () => {
        perfHelper.startTracking("Bill Manager Dashboard", getUrl("BILLING_PATH"));
        
        billingDashboardPage.navigateToDashboard();
        // Capture Primary Load when Dashboard sidebar text is visible
        cy.contains("Dashboard", { timeout: 30000 }).should("be.visible").then(() => {
            perfHelper.capturePrimaryLoad();
        });

        cy.wait(2000);
        perfHelper.sendReport();
    });
});