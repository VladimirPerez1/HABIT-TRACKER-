const API_URL = 'http://localhost:3000/api';

// Verificar autenticación
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = '/login';
}

// Mostrar fecha actual
function displayDate() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    document.getElementById('dateDay').textContent = now.getDate();
    document.getElementById('dateMonth').textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Cargar dashboard completo
async function loadDashboard() {
    try {
        document.getElementById('userName').textContent = user.fullName || 'Usuario';
        document.getElementById('welcomeTitle').textContent = `¡Bienvenido, ${user.fullName?.split(' ')[0]}! 👋`;

        const [trackingRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/tracking/today`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/stats/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const trackingData = await trackingRes.json();
        const statsData = await statsRes.json();

        if (trackingData.success) {
            displayTodayHabits(trackingData.data);
        }

        if (statsData.success) {
            displayStats(statsData.data);
            displayTopHabits(statsData.data.topHabits);
            displayWeeklyProgress(statsData.data.weekly);
            displayMoodStats(statsData.data.mood);
        }

    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

// Mostrar hábitos de hoy
function displayTodayHabits(data) {
    const { habits, summary } = data;

    // Actualizar progreso
    document.getElementById('progressText').textContent = `${summary.completed} de ${summary.total} completados`;
    document.getElementById('progressPercent').textContent = `${summary.percentage}%`;
    document.getElementById('progressBar').style.width = `${summary.percentage}%`;
    document.getElementById('completedToday').textContent = summary.completed;

    // Subtitle
    document.getElementById('welcomeSubtitle').textContent =
        summary.percentage === 100
            ? '¡Completaste todos tus hábitos hoy! 🎉'
            : `${summary.percentage}% de tus hábitos completados hoy`;

    // Lista de hábitos
    const habitsList = document.getElementById('habitsList');

    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No tienes hábitos todavía.<br>
                <a href="/habits">¡Crea tu primer hábito!</a></p>
            </div>`;
        return;
    }

    habitsList.innerHTML = habits.map(habit => `
        <div class="habit-item ${habit.completed_today ? 'completed' : ''}" 
             onclick="toggleHabit(${habit.id}, ${habit.completed_today})">
            <div class="habit-checkbox ${habit.completed_today ? 'checked' : ''}">
                ${habit.completed_today ? '✓' : ''}
            </div>
            <div class="habit-info">
                <div class="habit-name ${habit.completed_today ? 'completed' : ''}">${habit.name}</div>
                <div class="habit-category">
                    <span class="category-dot" style="background: ${habit.category_color || '#6366f1'}"></span>
                    ${habit.category_name || 'Sin categoría'}
                </div>
            </div>
        </div>
    `).join('');
}

// Marcar/desmarcar hábito
async function toggleHabit(habitId, isCompleted) {
    try {
        const endpoint = isCompleted ? 'uncomplete' : 'complete';
        const body = isCompleted ? {} : { moodRating: 5 };

        const res = await fetch(`${API_URL}/tracking/${habitId}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.success) {
            loadDashboard();
        }
    } catch (error) {
        console.error('Error toggling hábito:', error);
    }
}

// Mostrar estadísticas generales
function displayStats(data) {
    const { general } = data;
    document.getElementById('totalHabits').textContent = general.total_habits || 0;
    document.getElementById('currentStreak').textContent = general.current_streak || 0;
    document.getElementById('totalCompletions').textContent = general.total_completions || 0;
    document.getElementById('streakNumber').textContent = general.current_streak || 0;
}

// Mostrar top hábitos
function displayTopHabits(habits) {
    const container = document.getElementById('topHabitsList');

    if (!habits || habits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏆</div>
                <p>Completa hábitos para ver tu ranking</p>
            </div>`;
        return;
    }

    container.innerHTML = habits.map((habit, index) => `
        <div class="top-habit-item">
            <div class="top-habit-rank">${index + 1}</div>
            <div class="top-habit-name">${habit.name}</div>
            <div class="top-habit-count">${habit.total_completions} veces</div>
        </div>
    `).join('');
}

// Mostrar progreso semanal
function displayWeeklyProgress(weekly) {
    const container = document.getElementById('weeklyProgress');

    if (!weekly || weekly.data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>No hay datos esta semana todavía</p>
            </div>`;
        return;
    }

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekDays = [];

    // Generar todos los días de la semana
    const start = new Date(weekly.range.start);
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = weekly.data.find(d => d.completed_date.split('T')[0] === dateStr);
        weekDays.push({
            day: days[date.getDay()],
            completed: dayData ? dayData.completed_count : 0,
            total: dayData ? dayData.total_habits : 0,
            isToday: dateStr === new Date().toISOString().split('T')[0]
        });
    }

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-end" style="height: 80px; gap: 4px;">
            ${weekDays.map(d => {
                const pct = d.total > 0 ? (d.completed / d.total) * 100 : 0;
                return `
                    <div class="d-flex flex-column align-items-center flex-fill">
                        <div style="
                            width: 100%;
                            height: ${Math.max(pct * 0.6, 4)}px;
                            background: ${d.isToday ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb'};
                            border-radius: 4px;
                            margin-bottom: 4px;
                            min-height: 4px;
                        "></div>
                        <small style="font-size: 0.7rem; color: ${d.isToday ? '#667eea' : '#6b7280'}; font-weight: ${d.isToday ? 'bold' : 'normal'}">
                            ${d.day}
                        </small>
                    </div>`;
            }).join('')}
        </div>
        <div class="text-center mt-2" style="font-size: 0.8rem; color: #6b7280;">
            Semana del ${weekly.range.start} al ${weekly.range.end}
        </div>
    `;
}

// Mostrar estado de ánimo
function displayMoodStats(mood) {
    const container = document.getElementById('moodStats');

    if (!mood || mood.total_mood_entries === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😊</div>
                <p>Registra tu estado de ánimo al completar hábitos</p>
            </div>`;
        return;
    }

    const total = mood.total_mood_entries;
    const moods = [
        { emoji: '😄', label: 'Excelente', count: mood.excellent, color: '#10b981' },
        { emoji: '😊', label: 'Bien', count: mood.good, color: '#3b82f6' },
        { emoji: '😐', label: 'Neutral', count: mood.neutral, color: '#f59e0b' },
        { emoji: '😕', label: 'Mal', count: mood.bad, color: '#f97316' },
        { emoji: '😞', label: 'Terrible', count: mood.terrible, color: '#ef4444' }
    ];

    container.innerHTML = `
        <div class="text-center mb-3">
            <span style="font-size: 1.5rem; font-weight: bold; color: #1f2937;">
                ${mood.average_mood ? mood.average_mood.toFixed(1) : '0'} / 5
            </span>
            <span style="font-size: 0.85rem; color: #6b7280;"> promedio</span>
        </div>
        ${moods.map(m => `
            <div class="mood-item">
                <div class="mood-emoji">${m.emoji}</div>
                <div class="mood-bar-container">
                    <div class="mood-bar" style="width: ${total > 0 ? (m.count / total * 100) : 0}%; background: ${m.color}"></div>
                </div>
                <div class="mood-count">${m.count}</div>
            </div>
        `).join('')}
    `;
}

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

// Inicializar
displayDate();
loadDashboard();