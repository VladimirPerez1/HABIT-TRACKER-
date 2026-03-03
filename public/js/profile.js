
const API_URL = 'http://localhost:3000/api';
let currentUser = null;

// Función para mostrar alertas
function showAlert(message, type = 'danger', containerId = 'alertContainer') {
    const alertContainer = document.getElementById(containerId);
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

// Verificar autenticación y cargar datos del usuario
async function loadUserProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.data;
            displayUserProfile(currentUser);
            loadUserStats();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar el perfil');
    }
}

// Mostrar información del perfil
function displayUserProfile(user) {
    // Header
    document.getElementById('userName').textContent = user.full_name;
    document.getElementById('userNameNav').textContent = user.full_name;
    document.getElementById('userEmail').textContent = user.email;
    
    // Avatar (iniciales si no hay foto)
    const avatarImg = document.getElementById('profileAvatar');
    const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    avatarImg.alt = initials;
    
    // Si hay foto guardada en localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        avatarImg.src = savedAvatar;
    } else {
        // Crear avatar con iniciales
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        // Fondo gradiente
        const gradient = ctx.createLinearGradient(0, 0, 150, 150);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 150, 150);
        
        // Iniciales
        ctx.fillStyle = 'white';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 75, 75);
        
        avatarImg.src = canvas.toDataURL();
    }
    
    // Formulario de información personal
    document.getElementById('editFullName').value = user.full_name;
    document.getElementById('editEmail').value = user.email;
}

// Cargar estadísticas del usuario
async function loadUserStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/habits`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('totalHabits').textContent = data.count || 0;
            // Aquí puedes agregar más estadísticas
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Actualizar información personal
document.getElementById('personalInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('editFullName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const token = localStorage.getItem('token');

    if (!fullName || !email) {
        showAlert('Todos los campos son requeridos', 'danger', 'personalInfoAlert');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fullName, email })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Información actualizada exitosamente', 'success', 'personalInfoAlert');
            
            // Actualizar datos en localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.fullName = fullName;
            user.email = email;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Recargar perfil
            await loadUserProfile();
        } else {
            showAlert(data.message || 'Error al actualizar información', 'danger', 'personalInfoAlert');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger', 'personalInfoAlert');
    }
});

// Cambiar contraseña
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = localStorage.getItem('token');

    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Todos los campos son requeridos', 'danger', 'passwordAlert');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('La nueva contraseña debe tener al menos 6 caracteres', 'danger', 'passwordAlert');
        return;
    }

    if (!/\d/.test(newPassword)) {
        showAlert('La contraseña debe contener al menos un número', 'danger', 'passwordAlert');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'danger', 'passwordAlert');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Contraseña cambiada exitosamente', 'success', 'passwordAlert');
            document.getElementById('passwordForm').reset();
        } else {
            showAlert(data.message || 'Error al cambiar contraseña', 'danger', 'passwordAlert');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión', 'danger', 'passwordAlert');
    }
});

// Validar coincidencia de contraseñas en tiempo real
document.getElementById('confirmPassword').addEventListener('input', (e) => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = e.target.value;
    const indicator = document.getElementById('passwordMatchIndicator');

    if (confirmPassword.length === 0) {
        indicator.textContent = '';
        return;
    }

    if (newPassword === confirmPassword) {
        indicator.textContent = '✓ Las contraseñas coinciden';
        indicator.className = 'password-match-indicator text-success';
    } else {
        indicator.textContent = '✗ Las contraseñas no coinciden';
        indicator.className = 'password-match-indicator text-danger';
    }
});

// Subir foto de perfil
document.getElementById('avatarInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        showAlert('Por favor selecciona una imagen válida', 'danger', 'avatarAlert');
        return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('La imagen no debe superar 5MB', 'danger', 'avatarAlert');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
        const img = document.getElementById('profileAvatar');
        img.src = event.target.result;
        
        // Guardar en localStorage
        localStorage.setItem('userAvatar', event.target.result);
        
        showAlert('Foto de perfil actualizada', 'success', 'avatarAlert');
    };
    
    reader.readAsDataURL(file);
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userAvatar');
        window.location.href = '/login';
    }
});

// Cargar perfil al iniciar
window.addEventListener('load', loadUserProfile);