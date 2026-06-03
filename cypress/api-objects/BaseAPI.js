class BaseAPI {
    /**
     * Constructs the full headers including the session cookie
     */
    getHeaders() {
        const cookie = Cypress.env("sessionCookie");
        return {
            "Content-Type": "application/json",
            "Cookie": `connect.sid=${cookie}`,
            "Accept": "application/json"
        };
    }

    /**
     * A stable wrapper for cy.request
     */
    sendRequest(options) {
        let baseUrl = Cypress.env("apiBaseUrl");
        
        // Safety: Add https:// if it's missing in the config file
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }

        const requestOptions = {
            url: `${baseUrl}${options.endpoint}`,
            method: options.method || 'GET',
            headers: this.getHeaders(),
            body: options.body || null,
            failOnStatusCode: false, // Prevents Cypress from crashing on 4xx/5xx errors
            timeout: 30000
        };

        return cy.request(requestOptions);
    }
}

export default BaseAPI;