/**
 * ============================================================================
 * QUIZ.JS - Логика квиза с localStorage и Google Sheets
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const QUIZ_CONFIG = {
  googleScriptUrl: 'YOUR_GOOGLE_SCRIPT_URL_HERE',
  storageKey: 'quiz_data',
  successPage: 'thank-you.html',
};

(function initConfig() {
  const body = document.body;
  if (body.dataset.quizStorageKey) {
    QUIZ_CONFIG.storageKey = body.dataset.quizStorageKey;
  }
  if (body.dataset.quizGoogleScript) {
    QUIZ_CONFIG.googleScriptUrl = body.dataset.quizGoogleScript;
  }
  if (body.dataset.quizSuccessPage) {
    QUIZ_CONFIG.successPage = body.dataset.quizSuccessPage;
  }
})();

// ============================================================================
// QUIZ DATA MANAGEMENT
// ============================================================================

function initQuizData() {
  const existingData = getQuizData();
  if (!existingData) {
    const initialData = {
      answers: {},
      startTime: new Date().toISOString(),
      currentStep: 1,
    };
    saveQuizDataToStorage(initialData);
  }
}

function getQuizData() {
  try {
    const data = localStorage.getItem(QUIZ_CONFIG.storageKey);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading quiz data:', e);
    return null;
  }
}

function saveQuizDataToStorage(data) {
  try {
    localStorage.setItem(QUIZ_CONFIG.storageKey, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving quiz data:', e);
  }
}

function saveQuizAnswer(questionId, answer) {
  const data = getQuizData() || {
    answers: {},
    startTime: new Date().toISOString(),
  };

  data.answers[questionId] = answer;
  data.lastUpdated = new Date().toISOString();
  saveQuizDataToStorage(data);

  console.log(`Saved answer for ${questionId}: ${answer}`);
}

function clearQuizData() {
  try {
    localStorage.removeItem(QUIZ_CONFIG.storageKey);
  } catch (e) {
    console.error('Error clearing quiz data:', e);
  }
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

function submitQuizForm(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!validateForm(form)) {
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
  }

  const formData = {
    name: form.querySelector('#form-name')?.value || '',
    email: form.querySelector('#form-email')?.value || '',
    phone: form.querySelector('#form-phone')?.value || '',
    availability: form.querySelector('#form-availability')?.value || '',
    privacy: form.querySelector('#form-privacy')?.checked || false,
    timestamp: new Date().toISOString(),
  };

  const quizData = getQuizData();
  if (quizData && quizData.answers) {
    formData.quizAnswers = quizData.answers;
    formData.quizStartTime = quizData.startTime;
  }

  submitToGoogleSheets(formData)
    .then(() => {
      console.log('Form submitted successfully');
      clearQuizData();
      window.location.href = QUIZ_CONFIG.successPage;
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      alert('Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut.');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Jetzt Gutschein sichern!';
      }
    });

  return false;
}

async function submitToGoogleSheets(data) {
  if (QUIZ_CONFIG.googleScriptUrl === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
    console.log('Google Script URL not configured. Form data:', data);
    console.log('Quiz answers:', data.quizAnswers);
    return Promise.resolve();
  }

  const payload = {
    timestamp: data.timestamp,
    name: data.name,
    email: data.email,
    phone: data.phone,
    availability: data.availability,
    privacy_accepted: data.privacy ? 'Ja' : 'Nein',

    q1: data.quizAnswers?.q1 || '',
    q2: data.quizAnswers?.q2 || '',
    q3r: data.quizAnswers?.q3 || '',
    q4: data.quizAnswers?.q4 || '',
    q5: data.quizAnswers?.q5 || '',
    q6: data.quizAnswers?.q6 || '',
    
    quiz_start_time: data.quizStartTime || '',
  };

  const response = await fetch(QUIZ_CONFIG.googleScriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response;
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

function validateForm(form) {
  let isValid = true;

  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach((field) => {
    if (field.type === 'checkbox') {
      if (!field.checked) {
        isValid = false;
        highlightError(field);
      } else {
        removeError(field);
      }
    } else if (!field.value.trim()) {
      isValid = false;
      highlightError(field);
    } else {
      removeError(field);
    }
  });

  const emailField = form.querySelector('#form-email');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      isValid = false;
      highlightError(emailField);
    }
  }

  return isValid;
}

function highlightError(field) {
  field.style.borderColor = '#ff4444';
  field.style.boxShadow = '0 0 0 2px rgba(255, 68, 68, 0.2)';
}

function removeError(field) {
  field.style.borderColor = '';
  field.style.boxShadow = '';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
  initQuizData();

  const formInputs = document.querySelectorAll(
    '.quiz-form__input, .quiz-form__checkbox',
  );
  formInputs.forEach((input) => {
    input.addEventListener('input', () => removeError(input));
    input.addEventListener('change', () => removeError(input));
  });
});

// Экспорт функций для использования в HTML
window.saveQuizAnswer = saveQuizAnswer;
window.submitQuizForm = submitQuizForm;
window.getQuizData = getQuizData;
window.clearQuizData = clearQuizData;
