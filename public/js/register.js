
const API_URL = 'http://localhost:3000/api';

// Función para mostrar alertas
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alertContainer.innerHTML = '', 150);
        }
    }, 5000);
}

// Validar fortaleza de contraseña
document.getElementById('password').addEventListener('input', (e) => {
    const password = e.target.value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    strengthBar.style.width = (strength * 25) + '%';
    
    if (strength === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = 'La contraseña debe tener al menos 6 caracteres y un número';
        strengthText.className = 'text-muted small';
    } else if (strength <= 1) {
        strengthBar.className = 'password-strength-bar strength-weak';
        strengthText.textContent = 'Contraseña débil';
        strengthText.className = 'text-danger small';
    } else if (strength <= 2) {
        strengthBar.className = 'password-strength-bar strength-medium';
        strengthText.textContent = 'Contraseña media';
        strengthText.className = 'text-warning small';
    } else {
        strengthBar.className = 'password-strength-bar strength-strong';
        strengthText.textContent = 'Contraseña fuerte';
        strengthText.className = 'text-success small';
    }
});

// Manejar el formulario de registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const registerBtn = document.getElementById('registerBtn');

    // Validaciones
    if (!fullName || !email || !password || !confirmPassword) {
        showAlert('Por favor completa todos los campos');
        return;
    }

    if (!terms) {
        showAlert('Debes aceptar los términos y condiciones');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (!/\d/.test(password)) {
        showAlert('La contraseña debe contener al menos un número');
        return;
    }

    // Mostrar spinner
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    registerBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar token y usuario en localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Mostrar mensaje de éxito
            showAlert('¡Cuenta creada exitosamente! Redirigiendo...', 'success');

            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            // Mostrar error
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(err => err.message).join('<br>');
                showAlert(errorMessages);
            } else {
                showAlert(data.message || 'Error al crear la cuenta');
            }
            
            // Restaurar botón
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
            registerBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor. Verifica que el servidor esté corriendo en http://localhost:3000');
        
        // Restaurar botón
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
        registerBtn.disabled = false;
    }
});