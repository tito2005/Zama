// Authentication JavaScript functionality

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPasswordToggles();
        this.setupFormValidation();
        this.setupSocialAuth();
    }

    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const input = toggle.parentElement.querySelector('input');
                const icon = toggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'icon-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'icon-eye';
                }
            });
        });
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Additional validation for registration form
        if (form.querySelector('input[name="confirm_password"]')) {
            const password = form.querySelector('input[name="password"]');
            const confirmPassword = form.querySelector('input[name="confirm_password"]');
            
            if (password.value !== confirmPassword.value) {
                this.showFieldError(confirmPassword, 'Passwords do not match');
                isValid = false;
            }
        }

        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const name = input.name;

        // Clear previous errors
        this.clearFieldError(input);

        // Required field validation
        if (input.hasAttribute('required') && !value) {
            this.showFieldError(input, 'This field is required');
            return false;
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(input, 'Please enter a valid email address');
                return false;
            }
        }

        // Password validation
        if (name === 'password' && value) {
            if (value.length < 8) {
                this.showFieldError(input, 'Password must be at least 8 characters long');
                return false;
            }
        }

        return true;
    }

    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorElement = formGroup.querySelector('.field-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.add('error');
    }

    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.classList.remove('error');
    }

    setupSocialAuth() {
        const socialButtons = document.querySelectorAll('.btn-social');
        socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = button.textContent.trim().toLowerCase();
                this.handleSocialAuth(provider);
            });
        });
    }

    handleSocialAuth(provider) {
        // Mock social authentication
        console.log(`Initiating ${provider} authentication...`);
        
        // In a real implementation, this would redirect to the OAuth provider
        window.zamaApp?.showNotification(
            `${provider} authentication is not implemented in this demo`,
            'info'
        );
    }
}

// Password toggle function (global for inline onclick)
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.className = 'icon-eye-slash';
    } else {
        input.type = 'password';
        toggle.className = 'icon-eye';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});