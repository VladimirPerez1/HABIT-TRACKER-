const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = '/login';

document.getElementById('userName').textContent = user.fullName || 'Usuario';

let allHabits = [];
let categories = [];
let editingHabitId = null;
let deletingHabitId = null;
let currentFilter = 'all';

// Mostrar alerta
function showAlert(message, type = 'danger') {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) { alert.classList.remove('show'); setTimeout(() => container.innerHTML = '', 150); }
    }, 4000);
}

function showModalAlert(message, type = 'danger') {
    document.getElementById('modalAlert').innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
}

// Cargar categorías
async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            categories = data.data;
            populateCategorySelect();
            populateCategoryFilters();
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

function populateCategorySelect() {
    const select = document.getElementById('habitCategory');
    select.innerHTML = '<option value="">Sin categoría</option>';
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

function populateCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    container.innerHTML = categories.map(cat => `
        <button class="filter-btn" onclick="filterHabits('category-${cat.id}')" 
                style="border-color: ${cat.color}20; color: ${cat.color}">
            ${cat.name}
        </button>
    `).join('');
}

// Cargar hábitos
async function loadHabits() {
    try {
        const res = await fetch(`${API_URL}/habits`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            allHabits = data.data;
            renderHabits(allHabits);
        }
    } catch (error) {
        console.error('Error cargando hábitos:', error);
    }
}

// Renderizar hábitos
function renderHabits(habits) {
    const grid = document.getElementById('habitsGrid');

    if (habits.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <h5>No tienes hábitos todavía</h5>
                <p>¡Crea tu primer hábito y empieza a construir mejores rutinas!</p>
            </div>`;
        return;
    }

    grid.innerHTML = habits.map(habit => `
        <div class="habit-card" style="border-left-color: ${habit.category_color || '#667eea'}">
            <div class="habit-card-header">
                <div class="habit-card-name">${habit.name}</div>
                <div class="habit-card-actions">
                    <button class="btn-icon edit" onclick="editHabit(${habit.id})" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="deleteHabit(${habit.id}, '${habit.name}')" title="Eliminar">🗑️</button>
                </div>
            </div>
            ${habit.description ? `<div class="habit-card-desc">${habit.description}</div>` : ''}
            <div class="habit-card-footer">
                <div class="habit-category-badge">
                    <span class="category-dot" style="background: ${habit.category_color || '#6366f1'}"></span>
                    ${habit.category_name || 'Sin categoría'}
                </div>
                <span class="habit-frequency">
                    ${habit.frequency === 'daily' ? '📅 Diario' : habit.frequency === 'weekly' ? '📆 Semanal' : '⚙️ Custom'}
                </span>
            </div>
        </div>
    `).join('');
}

// Filtrar hábitos
function filterHabits(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let filtered = allHabits;
    if (filter === 'daily') filtered = allHabits.filter(h => h.frequency === 'daily');
    else if (filter === 'weekly') filtered = allHabits.filter(h => h.frequency === 'weekly');
    else if (filter.startsWith('category-')) {
        const catId = parseInt(filter.split('-')[1]);
        filtered = allHabits.filter(h => h.category_id === catId);
    }

    renderHabits(filtered);
}

// Abrir modal para crear
document.getElementById('habitModal').addEventListener('show.bs.modal', (e) => {
    if (!editingHabitId) {
        document.getElementById('modalTitle').textContent = 'Nuevo Hábito';
        document.getElementById('habitName').value = '';
        document.getElementById('habitDesc').value = '';
        document.getElementById('habitCategory').value = '';
        document.getElementById('habitFrequency').value = 'daily';
        document.getElementById('habitReminder').value = '';
        document.getElementById('modalAlert').innerHTML = '';
    }
});

document.getElementById('habitModal').addEventListener('hidden.bs.modal', () => {
    editingHabitId = null;
});

// Editar hábito
function editHabit(id) {
    const habit = allHabits.find(h => h.id === id);
    if (!habit) return;

    editingHabitId = id;
    document.getElementById('modalTitle').textContent = 'Editar Hábito';
    document.getElementById('habitName').value = habit.name;
    document.getElementById('habitDesc').value = habit.description || '';
    document.getElementById('habitCategory').value = habit.category_id || '';
    document.getElementById('habitFrequency').value = habit.frequency;
    document.getElementById('habitReminder').value = habit.reminder_time
        ? habit.reminder_time.substring(0, 5) : '';
    document.getElementById('modalAlert').innerHTML = '';

    new bootstrap.Modal(document.getElementById('habitModal')).show();
}

// Guardar hábito
async function saveHabit() {
    const name = document.getElementById('habitName').value.trim();
    const description = document.getElementById('habitDesc').value.trim();
    const categoryId = document.getElementById('habitCategory').value;
    const frequency = document.getElementById('habitFrequency').value;
    const reminderTime = document.getElementById('habitReminder').value;

    if (!name) {
        showModalAlert('El nombre del hábito es requerido');
        return;
    }

    const body = {
        name,
        description: description || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        frequency,
        reminderTime: reminderTime || undefined
    };

    try {
        const url = editingHabitId
            ? `${API_URL}/habits/${editingHabitId}`
            : `${API_URL}/habits`;
        const method = editingHabitId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('habitModal')).hide();
            showAlert(data.message, 'success');
            loadHabits();
        } else {
            showModalAlert(data.message || 'Error al guardar');
        }
    } catch (error) {
        showModalAlert('Error de conexión');
    }
}

// Eliminar hábito
function deleteHabit(id, name) {
    deletingHabitId = id;
    document.getElementById('deleteHabitName').textContent = name;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function confirmDelete() {
    try {
        const res = await fetch(`${API_URL}/habits/${deletingHabitId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            showAlert('Hábito eliminado exitosamente', 'success');
            loadHabits();
        } else {
            showAlert(data.message || 'Error al eliminar');
        }
    } catch (error) {
        showAlert('Error de conexión');
    }
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
});

// Inicializar
loadCategories();
loadHabits();