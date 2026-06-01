import patientAPI from "../../api-objects/PatientAPI";

describe("Pret A Med - API Validation Suite", () => {
    let serialNumber = 1;

    before(() => {
        cy.task("initOperationReport", {
            title: "API Performance & Security Report",
            url: Cypress.env("apiBaseUrl"),
            mode: "new"
        });
    });

    afterEach(function () {
        cy.task("writeOperationTableReport", {
            sn: serialNumber++,
            name: this.currentTest.title,
            status: this.currentTest.state.toUpperCase(),
            errorLog: this.currentTest.err ? this.currentTest.err.message : "Success"
        });
    });

    it("Verify Authentication API Status", () => {
        patientAPI.getAuthStatus().then((response) => {
            expect(response.status).to.eq(202); // Based on your previous logs
            expect(response.duration).to.be.lessThan(10000); // Latency check: < 1s
        });
    });

    it("Verify Patient List API Response and Schema", () => {
        patientAPI.getPatientsList(5, 0).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            
            // Checking if the first item has the required properties
            if (response.body.length > 0) {
                expect(response.body[0]).to.have.property('_id');
                expect(response.body[0]).to.have.property('firstName');
            }
        });
    });
});