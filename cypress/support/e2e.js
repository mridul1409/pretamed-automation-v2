import "./commands";

Cypress.on("uncaught:exception", (err) => {
  const ignorable = ["AxiosError", "404", "socket.io", "hydration", "querySelectorAll"];
  if (ignorable.some(msg => err?.message?.includes(msg))) {
    return false;
  }
  return false;
});

beforeEach(() => {
  const cookieValue = Cypress.env("sessionCookie");
  const options = Cypress.env("cookieOptions");

  if (cookieValue) {
    // Set cookie dynamically from the loaded config file
    cy.setCookie("connect.sid", cookieValue, options);

    // Ensure clean state for local storage
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  }
});