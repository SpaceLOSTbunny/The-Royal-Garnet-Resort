

(() => {
  "use strict";

  const GOOGLE_APPS_SCRIPT_URL = "";

  const form = document.querySelector("#reservation-form");
  const statusMessage = document.querySelector("#form-status");

 
  if (!form || !statusMessage) return;

  const checkInField = form.querySelector('[name="checkIn"]');
  const checkOutField = form.querySelector('[name="checkOut"]');
  const submitButton = form.querySelector('button[type="submit"]');

  
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const today = getTodayDate();

 
  if (checkInField) checkInField.min = today;
  if (checkOutField) checkOutField.min = today;

 
  if (checkInField && checkOutField) {
    checkInField.addEventListener("change", () => {
      if (!checkInField.value) return;

      checkOutField.min = checkInField.value;
      if (checkOutField.value && checkOutField.value <= checkInField.value) {
        checkOutField.value = "";
      }
    });
  }

 
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `form-status ${type ? `is-${type}` : ""}`.trim();
  }

  function removeInvalidFieldMarks() {
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute("aria-invalid");
    });
  }

  
  function validateEnquiry() {
    removeInvalidFieldMarks();
    let firstInvalidField = null;

    form.querySelectorAll("[required]").forEach((field) => {
      if (!field.checkValidity()) {
        field.setAttribute("aria-invalid", "true");
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (
      checkInField &&
      checkOutField &&
      checkInField.value &&
      checkOutField.value
    ) {
      if (checkOutField.value <= checkInField.value) {
        checkOutField.setAttribute("aria-invalid", "true");
        if (!firstInvalidField) firstInvalidField = checkOutField;
      }
    }

    if (firstInvalidField) {
      firstInvalidField.focus();

      const datesAreWrong =
        checkInField &&
        checkOutField &&
        checkInField.value &&
        checkOutField.value &&
        checkOutField.value <= checkInField.value;

      showStatus(
        datesAreWrong
          ? "Please choose a check-out date after your check-in date."
          : "Please review the highlighted fields and enter valid details.",
        "error",
      );
      return false;
    }

    return true;
  }


  form.addEventListener("input", (event) => {
    if (event.target.matches('[aria-invalid="true"]')) {
      event.target.removeAttribute("aria-invalid");
    }

    if (statusMessage.classList.contains("is-error")) {
      showStatus("", "");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showStatus("", "");

  
    const hiddenWebsiteField = form.querySelector('[name="website"]');
    if (hiddenWebsiteField && hiddenWebsiteField.value.trim()) {
      form.reset();
      showStatus(
        "Thank you. If you need assistance, please contact the hotel directly.",
        "success",
      );
      return;
    }

    if (!validateEnquiry()) return;

   
    const validAppsScriptUrl =
      /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/;
    if (!validAppsScriptUrl.test(GOOGLE_APPS_SCRIPT_URL)) {
      showStatus(
        "The form is ready, but Google Sheets is not connected yet. Follow the Google Sheets steps in README.md, then add your Web App URL to js/reservations.js.",
        "error",
      );
      return;
    }

    
    const enquiryData = Object.fromEntries(new FormData(form).entries());
    delete enquiryData.website; // Do not send the anti-spam field to the Sheet.
    enquiryData.source = "The Royal Garnet website";
    enquiryData.submittedAtClient = new Date().toISOString();

    submitButton.disabled = true;
    const originalButtonContent = submitButton.innerHTML;
    submitButton.textContent = "Sending enquiry...";

    try {
     
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(enquiryData),
      });

      form.reset();
      if (checkInField) checkInField.min = today;
      if (checkOutField) checkOutField.min = today;
      showStatus(
        "Your enquiry request was sent from this browser. Please await a reply from the hotel team. This is not a confirmed reservation.",
        "success",
      );
    } catch (error) {
      console.error("Could not send the hotel enquiry:", error);
      showStatus(
        "We could not send your enquiry. Please try again or contact the hotel directly.",
        "error",
      );
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonContent;
    }
  });
})();
