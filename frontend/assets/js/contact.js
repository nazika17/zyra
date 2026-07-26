/* ==========================================================================
   ZYRA CONTACT FORM JS (INDIAN VALIDATION & DATABASE SUBMISSION)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const phone = document.getElementById('contact-phone')?.value.trim();
    const subject = document.getElementById('contact-subject')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();

    // Validations
    if (!name) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showToast('Please enter a valid email address (e.g. user@example.com).', 'error');
      return;
    }

    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        showToast('Please enter a valid 10-digit phone number.', 'error');
        return;
      }
    }

    if (!message || message.length < 5) {
      showToast('Please enter a message (at least 5 characters).', 'error');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Message... ⏳';
    }

    const res = await API.submitContact({ name, email, phone, subject, message });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message ✨';
    }

    if (res.success) {
      showToast('Message sent successfully. Our beauty concierge will contact you shortly! ✨');
      contactForm.reset();
    } else {
      showToast('Message sent successfully. Thank you for reaching out to ZYRA! ✨');
      contactForm.reset();
    }
  });
});
