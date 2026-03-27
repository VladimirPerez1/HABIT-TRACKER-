const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = '/login';

document.getElementById('userName').textContent = user.fullName || 'Usuario';

let allRoutines = [];
let allHabits = [];
let editingRoutineId = null;
let deletingRoutineId = null;
let addingHabitToRoutineId = null;

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

function showModalAlert(containerId, message, type = 'danger') {
    document.getElementById(containerId).innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
}

// Cargar rutinas
async function loadRoutines() {
    try {
        const res = await fetch(`${API_URL}/routines`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            allRoutines = data.data;
            renderRoutines(allRoutines);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar hábitos disponibles
async function loadHabits() {
    try {
        const res = await fetch(`${API_URL}/habits`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) allHabits = data.data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Renderizar rutinas
function renderRoutines(routines) {
    const grid = document.getElementById('routinesGrid');

    if (routines.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔄</div>
                <h5>No tienes rutinas todavía</h5>
                <p>¡Crea una rutina y agrupa tus hábitos!</p>
            </div>`;
        return;
    }

    grid.innerHTML = routines.map(routine => `
        <div class="routine-card ${routine.is_active ? '' : 'inactive'}">
            <div class="routine-card-header">
                <div class="routine-card-name">${routine.name}</div>
                <div class="routine-card-actions">
                    <button class="btn-icon toggle" onclick="toggleRoutine(${routine.id})" title="${routine.is_active ? 'Desactivar' : 'Activar'}">
                        ${routine.is_active ? '⏸️' : '▶️'}
                    </button>
                    <button class="btn-icon edit" onclick="editRoutine(${routine.id})" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="deleteRoutine(${routine.id}, '${routine.name}')" title="Eliminar">🗑️</button>
                </div>
            </div>
            ${routine.description ? `<div class="routine-card-desc">${routine.description}</div>` : ''}
            <div class="routine-card-meta">
                <div class="routine-time">
                    ${routine.time_schedule ? '🕐 ' + new Date(routine.time_schedule).toLocaleTimeString('es', {hour: '2-digit', minute:'2-digit'}) : '⏰ Sin horario'}
                </div>
                <span class="routine-status ${routine.is_active ? 'active' : 'inactive'}">
                    ${routine.is_active ? 'Activa' : 'Inactiva'}
                </span>
            </div>
            <div class="routine-habits-list">
                <small style="color: #6b7280; font-weight: 600;">
                    ${routine.habit_count || 0} hábito(s)
                </small>
            </div>
            <button class="routine-add-habit" onclick="openAddHabit(${routine.id})">
                + Agregar Hábito
            </button>
        </div>
    `).join('');
}

// Modal crear/editar
document.getElementById('routineModal').addEventListener('hidden.bs.modal', () => {
    editingRoutineId = null;
});

function editRoutine(id) {
    const routine = allRoutines.find(r => r.id === id);
    if (!routine) return;

    editingRoutineId = id;
    document.getElementById('modalTitle').textContent = 'Editar Rutina';
    document.getElementById('routineName').value = routine.name;
    document.getElementById('routineDesc').value = routine.description || '';
    document.getElementById('routineTime').value = routine.time_schedule
        ? new Date(routine.time_schedule).toLocaleTimeString('es', {hour: '2-digit', minute:'2-digit'})
        : '';
    document.getElementById('modalAlert').innerHTML = '';

    new bootstrap.Modal(document.getElementById('routineModal')).show();
}

async function saveRoutine() {
    const name = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDesc').value.trim();
    const timeSchedule = document.getElementById('routineTime').value;

    if (!name) {
        showModalAlert('modalAlert', 'El nombre es requerido');
        return;
    }

    const body = {
        name,
        description: description || undefined,
        timeSchedule: timeSchedule || undefined
    };

    try {
        const url = editingRoutineId
            ? `${API_URL}/routines/${editingRoutineId}`
            : `${API_URL}/routines`;
        const method = editingRoutineId ? 'PUT' : 'POST';

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
            bootstrap.Modal.getInstance(document.getElementById('routineModal')).hide();
            showAlert(data.message, 'success');
            loadRoutines();
        } else {
            showModalAlert('modalAlert', data.message || 'Error al guardar');
        }
    } catch (error) {
        showModalAlert('modalAlert', 'Error de conexión');
    }
}

// Toggle activo/inactivo
async function toggleRoutine(id) {
    try {
        const res = await fetch(`${API_URL}/routines/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            showAlert(data.message, 'success');
            loadRoutines();
        }
    } catch (error) {
        showAlert('Error de conexión');
    }
}

// Eliminar rutina
function deleteRoutine(id, name) {
    deletingRoutineId = id;
    document.getElementById('deleteRoutineName').textContent = name;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function confirmDelete() {
    try {
        const res = await fetch(`${API_URL}/routines/${deletingRoutineId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            showAlert('Rutina eliminada', 'success');
            loadRoutines();
        }
    } catch (error) {
        showAlert('Error de conexión');
    }
}

// Agregar hábito a rutina
function openAddHabit(routineId) {
    addingHabitToRoutineId = routineId;
    const select = document.getElementById('habitSelect');
    select.innerHTML = allHabits.length === 0
        ? '<option value="">No tienes hábitos creados</option>'
        : allHabits.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
    document.getElementById('addHabitAlert').innerHTML = '';
    new bootstrap.Modal(document.getElementById('addHabitModal')).show();
}

async function confirmAddHabit() {
    const habitId = parseInt(document.getElementById('habitSelect').value);
    if (!habitId) return;

    try {
        const res = await fetch(`${API_URL}/routines/${addingHabitToRoutineId}/habits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ habitId })
        });
        const data = await res.json();
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('addHabitModal')).hide();
            showAlert('Hábito agregado a la rutina', 'success');
            loadRoutines();
        } else {
            showModalAlert('addHabitAlert', data.message || 'Error al agregar');
        }
    } catch (error) {
        showModalAlert('addHabitAlert', 'Error de conexión');
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
loadRoutines();
loadHabits();