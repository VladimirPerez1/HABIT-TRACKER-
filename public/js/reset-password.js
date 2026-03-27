const API_URL = 'http://localhost:3000/api';

// Obtener token de la URL
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get('token');

// Verificar que hay token
if (!resetToken) {
    showAlert('Token de recuperación no válido o expirado', 'danger');
    document.getElementById('resetForm').style.display = 'none';
}

// Función para mostrar alertas
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
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

// Manejar el formulario
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const submitBtn = document.getElementById('submitBtn');

    // Validaciones
    if (!password || !confirmPassword) {
        showAlert('Por favor completa todos los campos');
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
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                token: resetToken,
                password 
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Contraseña cambiada exitosamente. Redirigiendo al login...', 'success');
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showAlert(data.message || 'Error al cambiar la contraseña');
            
            // Restaurar botón
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor');
        
        // Restaurar botón
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
        submitBtn.disabled = false;
    }
});