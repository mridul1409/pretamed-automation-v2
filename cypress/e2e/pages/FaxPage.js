class FaxPage {
    // Selectors
    get loaderSelectors() { return '.MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root'; }
    get accountIcon() {
        return cy.get('button[aria-label="account of current user"]', { timeout: 30000 });
    } get faxContactMenu() { return cy.contains('li, div, p', /Fax Contact/i); }
    get addNewBtn() { return cy.contains('button', /ADD NEW/i); }
    get refreshBtn() { return cy.get('button[aria-label="Refresh"]'); }
    get inboxTab() { return cy.get('div[aria-label="INBOX"]'); }
    get queuedTab() { return cy.get('div[aria-label="QUEUED"]'); }
    get cancelBtn() { return cy.contains('button', /CANCEL/i); }

    // Actions
    waitForLoaders() {
        cy.get(this.loaderSelectors, { timeout: 300000 }).should('not.exist');
    }

    checkAndCloseDayAgenda() {
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Day")').length > 0 && $body.find('button:contains("Agenda")').length > 0) {
                // Implementation for closing if selector is known
            }
        });
    }

    navigateToFax() {
        const inboxUrl = Cypress.config().baseUrl.replace(/\/$/, "") + Cypress.env("INBOX_PATH");
        cy.visit(inboxUrl);
        this.waitForLoaders();
    }

    openFaxContactModal() {
        cy.get('body').should('be.visible');

        this.accountIcon.should('be.visible').first().click({ force: true });

        this.faxContactMenu.should('be.visible').click({ force: true });
        this.waitForLoaders();
    }

    fillContactForm(data, uniqueFax) {
        cy.contains("span", /Fax Number/i).parent().find("input").first().type(uniqueFax, { force: true });
        cy.contains("span", /Name/i).parent().find("input").first().type(data.name, { force: true });
        cy.contains("span", /Email/i).parent().find("input").first().type(data.email, { force: true });
        cy.contains("span", /MSP/i).parent().find("input").first().type(data.msp, { force: true });
        cy.contains("span", /Phone/i).parent().find("input").first().type(data.phone, { force: true });
        cy.contains("span", /Address/i).parent().find("textarea, input").first().type(data.address, { force: true });

        cy.contains("button", /^ADD$/i).should("be.enabled").click({ force: true });
    }

    verifyContactVisible(uniqueFax, name) {
        cy.contains("h2", /Fax Contact/i).closest(".MuiPaper-root").within(() => {
            cy.get('input[placeholder="Search Contact"]').clear({ force: true }).type(uniqueFax, { delay: 100, force: true });
        });
        this.waitForLoaders();
        cy.contains("h2", /Fax Contact/i).closest(".MuiPaper-root").find(".MuiTable-root").contains("th", name).should("be.visible");
    }

    closeModal() {
        cy.get('body').then(($body) => {
            if ($body.find('.MuiDialog-root').length > 0) {
                cy.get('.MuiDialog-root').contains('button', /CANCEL/i).filter(':visible').click({ force: true });
                cy.get('.MuiDialog-root').should('not.exist');
            }
        });
    }
}

export default new FaxPage();