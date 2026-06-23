class PerformanceHelper {
    constructor() {
        this.apiCalls = [];
        this.pageStartTime = 0;
        this.pageName = "";
        this.pageUrl = "";
        this.primaryLoadTime = 0;
    }

    // Inside PerformanceHelper.js -> startTracking
    startTracking(name, url) {
        // Resetting the array and all variables to ensure NO cumulative data
        this.apiCalls = [];
        this.primaryLoadTime = 0;
        this.pageStartTime = 0;
        this.pageName = name;
        this.pageUrl = url;

        cy.then(() => {
            this.pageStartTime = performance.now();
        });

        // Global Interceptor with specific logic to capture only needed data
        cy.intercept("**", (req) => {
            const requestStartTime = performance.now();
            req.continue((res) => {
                const duration = Math.round(performance.now() - requestStartTime);
                this.apiCalls.push({
                    url: req.url,
                    duration: duration,
                    status: res.statusCode
                });
            });
        }).as(`${name}_network`);
    }

    capturePrimaryLoad() {
        // Must be called inside a .then() block in the spec file
        this.primaryLoadTime = Math.round(performance.now() - this.pageStartTime);
    }

    sendReport() {
        cy.then(() => {
            const fullLoadTime = Math.round(performance.now() - this.pageStartTime);

            const backendApis = this.apiCalls.filter(api => {
                const url = api.url.toLowerCase();

                // 1. Strict Regex Patterns for Polling and Noise
                // These will catch URLs even if they have extra IDs or query parameters
                const forbiddenRegex = [
                    /actvusr\/alive/i,
                    /faxsrv\/inbxrf/i,
                    /fx\/multi\/auto/i,
                    /ntfctn\/unread/i,
                    /socket\.io/i,
                    /google-analytics/i,
                    /googleapis/i,
                    /collect\?v=2/i
                ];

                // Check if the current URL matches ANY of the regex patterns
                const isForbidden = forbiddenRegex.some(regex => regex.test(url));

                // 2. Domain check
                const isBackend = url.includes("dev.api.pretamed.com");

                // 3. Asset check
                const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|woff2|ico)$/i.test(url);

                // LOGIC: Return true ONLY if it is a Backend API AND NOT Forbidden AND NOT an Asset
                return isBackend && !isForbidden && !isAsset;
            });

            // Reporting logic
            cy.task("writePerformanceText", {
                page: this.pageName,
                url: this.pageUrl,
                primaryLoadTime: this.primaryLoadTime || fullLoadTime,
                fullLoadTime: fullLoadTime
            });

            cy.task("writeBottleneckReport", {
                allApis: backendApis.sort((a, b) => b.duration - a.duration),
                failedApis: backendApis.filter(api => api.status >= 400)
            });
        });
    }
}

export default new PerformanceHelper();