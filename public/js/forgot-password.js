
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
    
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alertContainer.innerHTML = '', 150);
        }
    }, 5000);
}

// Mostrar pantalla de éxito
function showSuccess(email) {
    document.getElementById('forgotForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('successEmail').textContent = email;
}

// Manejar el formulario
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const submitBtn = document.getElementById('submitBtn');

    if (!email) {
        showAlert('Por favor ingresa tu correo electrónico');
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor ingresa un correo electrónico válido');
        return;
    }

    // Mostrar spinner
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            // Mostrar mensaje de éxito
            showSuccess(email);
        } else {
            showAlert(data.message || 'Error al procesar la solicitud');
            
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