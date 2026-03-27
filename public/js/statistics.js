const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = '/login';

document.getElementById('userName').textContent = user.fullName || 'Usuario';

// Cargar todas las estadísticas
async function loadStats() {
    try {
        const [dashRes, monthlyRes] = await Promise.all([
            fetch(`${API_URL}/stats/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/stats/monthly`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const dashData = await dashRes.json();
        const monthlyData = await monthlyRes.json();

        if (dashData.success) {
            const { general, weekly, topHabits, successRate, mood } = dashData.data;
            displayGeneralStats(general);
            displayWeeklyChart(weekly);
            displayTopHabits(topHabits);
            displaySuccessRate(successRate);
            displayMoodStats(mood);
        }

        if (monthlyData.success) {
            displayMonthlyStats(monthlyData.data);
        }

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Stats generales
function displayGeneralStats(general) {
    document.getElementById('totalHabits').textContent = general.total_habits || 0;
    document.getElementById('totalCompletions').textContent = general.total_completions || 0;
    document.getElementById('currentStreak').textContent = general.current_streak || 0;
    document.getElementById('totalRoutines').textContent = general.total_routines || 0;
}

// Gráfico semanal
function displayWeeklyChart(weekly) {
    const container = document.getElementById('weeklyChart');

    if (!weekly || weekly.data.length === 0) {
        container.innerHTML = `
            <div class="empty-state w-100">
                <div class="empty-icon">📅</div>
                <p>Sin datos esta semana</p>
            </div>`;
        return;
    }

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const start = new Date(weekly.range.start);
    const today = new Date().toISOString().split('T')[0];
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = weekly.data.find(d => d.completed_date.split('T')[0] === dateStr);
        const pct = dayData ? (dayData.completed_count / dayData.total_habits) * 100 : 0;
        weekDays.push({
            day: days[date.getDay()],
            pct: Math.min(pct, 100),
            isToday: dateStr === today
        });
    }

    const maxPct = Math.max(...weekDays.map(d => d.pct), 1);

    container.innerHTML = weekDays.map(d => `
        <div class="week-bar-container">
            <div class="week-bar ${d.isToday ? 'today' : ''}" 
                 style="height: ${(d.pct / maxPct) * 100}%"></div>
            <div class="week-label ${d.isToday ? 'today' : ''}">${d.day}</div>
        </div>
    `).join('');
}

// Top hábitos
function displayTopHabits(habits) {
    const container = document.getElementById('topHabits');

    if (!habits || habits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏆</div>
                <p>Completa hábitos para ver el ranking</p>
            </div>`;
        return;
    }

    const rankClasses = ['gold', 'silver', 'bronze'];

    container.innerHTML = habits.map((habit, i) => `
        <div class="top-habit-item">
            <div class="top-habit-rank ${rankClasses[i] || ''}">${i + 1}</div>
            <div class="top-habit-info">
                <div class="top-habit-name">${habit.name}</div>
                <div class="top-habit-category">
                    <span style="color: ${habit.category_color || '#6366f1'}">●</span>
                    ${habit.category_name || 'Sin categoría'}
                </div>
            </div>
            <div class="top-habit-count">${habit.total_completions} veces</div>
        </div>
    `).join('');
}

// Tasa de éxito
function displaySuccessRate(habits) {
    const container = document.getElementById('successRate');

    if (!habits || habits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p>Sin datos disponibles</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="row">
            ${habits.map(habit => `
                <div class="col-md-6">
                    <div class="habit-rate-item">
                        <div class="habit-rate-header">
                            <div class="habit-rate-name">
                                <span style="color: ${habit.category_color || '#6366f1'}">●</span>
                                ${habit.name}
                            </div>
                            <div class="habit-rate-pct">${habit.success_rate}%</div>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" style="width: ${habit.success_rate}%"></div>
                        </div>
                        <small style="color: #6b7280; font-size: 0.78rem;">
                            ${habit.total_completions} completados en ${habit.days_since_created} días
                        </small>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Estado de ánimo
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
            <span style="font-size: 1.8rem; font-weight: bold; color: #1f2937;">
                ${mood.average_mood ? mood.average_mood.toFixed(1) : '0'} / 5
            </span>
            <br><small style="color: #6b7280;">Promedio general (${total} registros)</small>
        </div>
        ${moods.map(m => `
            <div class="mood-stat-item">
                <div class="mood-emoji">${m.emoji}</div>
                <div class="mood-info">
                    <div class="mood-label">${m.label}</div>
                    <div class="mood-bar-container">
                        <div class="mood-bar" style="width: ${total > 0 ? (m.count/total*100) : 0}%; background: ${m.color}"></div>
                    </div>
                </div>
                <div class="mood-count">${m.count}</div>
            </div>
        `).join('')}
    `;
}

// Resumen mensual
function displayMonthlyStats(monthly) {
    const container = document.getElementById('monthlyStats');

    if (!monthly || monthly.data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📆</div>
                <p>Sin datos este mes todavía</p>
            </div>`;
        return;
    }

    const totalDays = monthly.data.length;
    const totalCompleted = monthly.data.reduce((sum, d) => sum + d.completed_count, 0);
    const avgPerDay = totalDays > 0 ? (totalCompleted / totalDays).toFixed(1) : 0;

    container.innerHTML = `
        <div class="row text-center g-3">
            <div class="col-4">
                <div style="font-size: 1.8rem; font-weight: bold; color: #667eea">${totalDays}</div>
                <div style="font-size: 0.8rem; color: #6b7280">Días activos</div>
            </div>
            <div class="col-4">
                <div style="font-size: 1.8rem; font-weight: bold; color: #10b981">${totalCompleted}</div>
                <div style="font-size: 0.8rem; color: #6b7280">Completados</div>
            </div>
            <div class="col-4">
                <div style="font-size: 1.8rem; font-weight: bold; color: #f59e0b">${avgPerDay}</div>
                <div style="font-size: 0.8rem; color: #6b7280">Promedio/día</div>
            </div>
        </div>
        <div class="mt-3" style="font-size: 0.85rem; color: #6b7280; text-align: center;">
            Mes: ${monthly.range.start} — ${monthly.range.end}
        </div>
    `;
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
loadStats();