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

// Verificar si ya hay sesión activa
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Ya hay sesión, redirigir al dashboard
        window.location.href = '/dashboard';
    }
});

// Manejar el formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const loginBtn = document.getElementById('loginBtn');

    // Validaciones básicas
    if (!email || !password) {
        showAlert('Por favor completa todos los campos');
        return;
    }

    // Mostrar spinner
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    loginBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar token y usuario en localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Mostrar mensaje de exito
            showAlert('¡Login exitoso! Redirigiendo...', 'success');

            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            // Mostrar error
            showAlert(data.message || 'Credenciales inválidas');
            
            // Restaurar boton
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor. Verifica que el servidor esté corriendo en http://localhost:3000');
        
        // Restaurar botón
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
        loginBtn.disabled = false;
    }
});

// Permitir login con Enter
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});