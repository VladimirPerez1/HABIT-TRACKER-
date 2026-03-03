
// Verificar autenticación al cargar
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        // No hay sesión, redirigir al login
        window.location.href = '/login';
        return;
    }

    // Mostrar información del usuario
    document.getElementById('userName').textContent = user.fullName || 'Usuario';
    document.getElementById('userEmail').textContent = user.email || 'No disponible';
    
    // Mostrar status del token (primeros y últimos caracteres)
    if (token) {
        const tokenPreview = token.substring(0, 20) + '...' + token.substring(token.length - 20);
        document.getElementById('tokenPreview').textContent = tokenPreview;
    }
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir al login
        window.location.href = '/login';
    }
});

// Copiar token al portapapeles
document.getElementById('copyTokenBtn')?.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    if (token) {
        navigator.clipboard.writeText(token).then(() => {
            alert('Token copiado al portapapeles');
        });
    }
});