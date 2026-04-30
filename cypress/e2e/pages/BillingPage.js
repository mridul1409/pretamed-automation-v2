class BillingPage {
  // ===========================================================
  // SELECTORS (GETTERS)
  // ===========================================================
  get loaderSelectors() {
    return ".MuiCircularProgress-root, .MuiLinearProgress-root, .spinner, .MuiSkeleton-root";
  }
  get startNewBillBtn() {
    return cy.contains("button", /Start a New Bill/i);
  }

  // Scoped container for the billing form using Check Eligibility as anchor
  get billingModal() {
    return cy
      .contains("button:visible", /CHECK ELIGIBILITY/i)
      .closest(".MuiBox-root")
      .parent();
  }

  // ===========================================================
  // ACTIONS (METHODS)
  // ===========================================================

  /**
   * General function to wait for loaders to disappear
   */
  waitForLoaders() {
    cy.get(this.loaderSelectors, { timeout: 300000 }).should("not.exist");
  }

  /**
   * Clicks Start a New Bill and handles initial warning modals
   */
  initiateNewBill() {
    this.startNewBillBtn.should("be.visible").click({ force: true });
    this.waitForLoaders();

    // Handle common warning modal about clinicalNoteId
    cy.get("body").then(($body) => {
      if (
        $body.find(':contains("Please fill in: clinicalNoteId")').length > 0
      ) {
        cy.log(">>> Warning modal detected. Clicking OK.");
        cy.contains("button", "OK").click({ force: true });
      }
    });

    // Set an alias for the active billing form container
    this.billingModal.as("activeBillingForm");
  }

  /**
   * Fills common dropdowns: Data Center, Payee, Bill To, and Service Type
   */
  fillBasicBillingInfo(dataCenter, payee, billTo, asType) {
    // 1. Select Data Center
    cy.get("@activeBillingForm").within(() => {
      cy.contains(/Data Center/i)
        .parent()
        .find('[role="combobox"]')
        .first()
        .click({ force: true });
    });
    cy.get('ul[role="listbox"]:visible li[role="option"]')
      .first()
      .click({ force: true });

    // 2. Select Payee
    cy.get("@activeBillingForm").within(() => {
      cy.contains(/Payee/i)
        .parent()
        .find('[role="combobox"]')
        .first()
        .click({ force: true });
    });
    cy.get('ul[role="listbox"]:visible li[role="option"]')
      .first()
      .click({ force: true });

    // 3. Select Bill To (e.g., MSP, ICBC)
    cy.get("@activeBillingForm").within(() => {
      cy.contains(/Bill to/i)
        .parent()
        .find('[role="combobox"]')
        .first()
        .click({ force: true });
    });
    cy.get('ul[role="listbox"]:visible li[role="option"]')
      .contains(new RegExp(`^${billTo}$`))
      .click({ force: true });

    cy.contains("button", /CHECK ELIGIBILITY/i)
      .closest(".MuiBox-root")
      .then(($container) => {
        const dropdown = $container.find('[role="combobox"]').eq(1);

        // Check if the dropdown is NOT disabled before interacting
        if (!dropdown.hasClass("Mui-disabled")) {
          cy.wrap(dropdown).should("be.visible").click({ force: true });
          cy.get('ul[role="listbox"]:visible li[role="option"]', {
            timeout: 10000,
          })
            .contains(asType)
            .click({ force: true });
        } else {
          cy.log(
            `>>> 'as' type dropdown is disabled for ${billTo}. Skipping selection.`,
          );
        }
      });
    // 5. Select Service Location Code
    cy.get("@activeBillingForm").within(() => {
      // Find the dropdown by label and click to open
      cy.contains(/Service Location Code/i)
        .parent()
        .find('[role="combobox"], .MuiSelect-select')
        .first()
        .click({ force: true });
    });

    // Pick the first available option from the listbox
    cy.get('ul[role="listbox"]:visible li[role="option"]', { timeout: 15000 })
      .first()
      .click({ force: true });
  }

  /**
   * Expands and fills additional FFS specific details
   */
  fillFFSDetails() {
    cy.get("@activeBillingForm").within(() => {
      // Expand the billing details panel

      cy.get("button").then(($btns) => {
        const moreBtn = $btns.filter((i, el) =>
          el.innerText.includes("MORE BILLING DETAILS"),
        );

        if (moreBtn.length > 0) {
          cy.log(">>> Clicking MORE BILLING DETAILS...");
          cy.wrap(moreBtn).click({ force: true });
          cy.contains("button", /HIDE BILLING DETAILS/i).should("be.visible");
        }
      });

      // Fill mandatory FFS fields using a loop for cleanliness
      const fields = [
        { label: /Practitioner Number/i, value: "2134" },
        { label: /Service To Day/i, value: "00" },
        { label: /Service Clarification Code/i, value: "00" },
        { label: /Facility Number/i, value: "1234" },
        { label: /REF Practitioner Number/i, value: "9999" },
      ];

      fields.forEach((f) => {
        cy.contains(f.label)
          .parent()
          .find("input")
          .clear({ force: true })
          .type(f.value, { force: true });
      });
    });
  }

  /**
   * Fills specific fields for Personal Practice (PP) mode
   */
  fillPPAddress(address, postalCode) {
    cy.get("@activeBillingForm").within(() => {
      // Fill Address (textarea)
      cy.contains(/Address/i)
        .parent()
        .find("textarea:visible")
        .should("be.visible")
        .clear({ force: true })
        .type(address, { force: true });

      // Fill Postal Code
      cy.contains(/Postal Code/i)
        .parent()
        .find("input")
        .should("be.visible")
        .clear({ force: true })
        .type(postalCode, { force: true });
    });
  }

  /**
   * Fills specific fields for Institutional (IN) mode
   */
  fillINFields(address, postalCode, institutionNo) {
    cy.get("@activeBillingForm").within(() => {
      // Fill Address
      cy.contains(/Address/i)
        .parent()
        .find("textarea:visible")
        .should("be.visible")
        .clear({ force: true })
        .type(address, { force: true });

      // Fill Postal Code
      cy.contains(/Postal Code/i)
        .parent()
        .find("input")
        .should("be.visible")
        .clear({ force: true })
        .type(postalCode, { force: true });

      // Fill Institution Number
      cy.contains(/Institution Number/i)
        .parent()
        .find("input, textarea")
        .first()
        .should("be.visible")
        .clear({ force: true })
        .type(institutionNo, { force: true });
    });
  }

  /**
   * Fills the unique ICBC Claim Number field
   */
  fillICBCClaim(claimNumber) {
    cy.get("@activeBillingForm").within(() => {
      cy.contains(/ICBC Claim Number/i)
        .closest('div[class*="MuiStack-root"]')
        .find("input")
        .should("be.visible")
        .clear({ force: true })
        .type(claimNumber, { force: true });
    });
  }

  /**
   * Fills specific fields for Workers' Compensation (WSBC) mode
   */
  fillWSBCFields(claimNum, injuryDate) {
    cy.get("@activeBillingForm").within(() => {
      // 1. WSBC Claim Num
      cy.contains(/WSBC Claim Num/i)
        .parent()
        .find("input")
        .clear({ force: true })
        .type(claimNum, { force: true });

      // 2. WSBC Date of Injury
      cy.contains(/WSBC Date of Injury/i)
        .parent()
        .find("input")
        .clear({ force: true })
        .type(injuryDate, { force: true });

      // 3. Anatomical Position (Dropdown)
      cy.contains(/Anatomical Position/i)
        .parent()
        .find('[role="combobox"]')
        .click({ force: true });
    });

    // Select first option from global listbox
    cy.get('ul[role="listbox"]:visible li[role="option"]')
      .first()
      .click({ force: true });

    // 4. Area of Injury (with autocomplete)
    cy.get("@activeBillingForm").within(() => {
      cy.contains(/WSBC Area of Injury/i)
        .parent()
        .find("input")
        .type("231", { force: true });
    });
    cy.get("ul.autocomplete-options li.autocomplete-option", { timeout: 15000 })
      .first()
      .click({ force: true });

    // 5. Nature of Injury (with autocomplete)
    cy.get("@activeBillingForm").within(() => {
      cy.contains(/WSBC Nature of Injury/i)
        .parent()
        .find("input")
        .type("424", { force: true });
    });
    cy.get("ul.autocomplete-options li.autocomplete-option", { timeout: 15000 })
      .first()
      .click({ force: true });
  }

  addServiceRow(diag, service, units = "1") {
    // Updated Targeting: Use the 'SUMMARY' text as an anchor to find the table container
    // This is much more stable than using .parent().parent()
    cy.contains("div", /Diag Code/i)
      .closest(".MuiBox-root")
      .as("diagCodeSection");

    cy.get("@diagCodeSection").within(() => {
      // Fill Diag Code
      cy.get("table tbody tr")
        .first()
        .within(() => {
          cy.get("td").eq(1).find("input").type(diag, { force: true });
        });
    });

    // IMPORTANT: Autocomplete selection must be OUTSIDE the .within() block
    cy.get("ul.autocomplete-options li.autocomplete-option", { timeout: 10000 })
      .should("be.visible")
      .first()
      .click({ force: true });

    cy.get("@diagCodeSection").within(() => {
      // Fill Service Code
      cy.get("table tbody tr")
        .first()
        .within(() => {
          cy.get("td").eq(2).find("input").type(service, { force: true });
        });
    });

    cy.get("ul.autocomplete-options li.autocomplete-option", { timeout: 10000 })
      .should("be.visible")
      .first()
      .click({ force: true });

    cy.get("@diagCodeSection").within(() => {
      // Fill Units and Save the row
      cy.get("table tbody tr")
        .first()
        .within(() => {
          cy.get("td")
            .eq(3)
            .find("input")
            .clear({ force: true })
            .type(units, { force: true });
          cy.get("td").last().find("button").last().click({ force: true });
        });
    });

    this.waitForLoaders();
  }

  /**
   * Writes a billing note, saves the bill, and handles final confirmation steps.
   * Uses a stable anchor to avoid Detached DOM errors.
   */
  saveAndCloseBill(note) {
    // Strategy: Locate the save button area directly using a unique text anchor
    cy.contains("button", /SAVE & SEND TOTAL BILL/i)
      .closest(".MuiBox-root") // Finding the footer box
      .parent() // Accessing the main container scope for note and save button
      .within(() => {
        // Fill the Note field
        cy.contains("span", /Note:/i)
          .parent()
          .find("input, textarea")
          .first()
          .clear({ force: true })
          .type(note, { force: true });

        // Click the blue 'SAVE' button (Exact match)
        cy.contains("button", /^SAVE$/i)
          .should("be.visible")
          .click({ force: true });
      });

    // Handle the potential Age-based Code Update modal
    cy.get("body").then(($body) => {
      if (
        $body.find('#swal2-title:contains("Age-based Code Update")').length > 0
      ) {
        cy.contains("button", "Yes, keep it").click({ force: true });
      }
    });

    // Verification of success message
    cy.contains(/bill.*successfully/i, { timeout: 20000 }).should("be.visible");

    // Ensure toast message disappears before proceeding to close
    cy.contains(/bill.*successfully/i).should("not.exist");

    // Final Close action using the existing stable close logic
    cy.contains("button", /CLOSE/i).should("be.visible").click({ force: true });
    this.waitForLoaders();
  }

  /**
   * Closes the billing or note drawer by using 'SIGN & PRINT' as an anchor
   * and verifies the successful return to the patient chart.
   */
  closeDrawerAndVerifyReturn() {
    // 1. Identify the specific footer container using the SIGN & PRINT button
    cy.contains("button", /^SIGN & PRINT$/i)
      .closest(".MuiBox-root")
      .within(() => {
        // 2. Locate and click the CLOSE button within this specific scope
        cy.contains("button", /^CLOSE$/i)
          .should("be.visible")
          .click({ force: true });
      });

    // 3. Wait for all background processing to finish
    this.waitForLoaders();

    // 4. Verification: Wait for the main chart button to confirm UI stability
    cy.contains("button", /NEW PROGRESS NOTE/i, { timeout: 30000 }).should(
      "be.visible",
    );

    this.waitForLoaders();
  }
}

export default new BillingPage();
