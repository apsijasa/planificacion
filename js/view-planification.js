/**
 * NataPlan - view-planification.js
 * JavaScript para la página de visualización de planificaciones
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la página
    const planNameEl = document.getElementById('planName');
    const planStatusEl = document.getElementById('planStatus');
    const planStartDateEl = document.getElementById('planStartDate');
    const planEndDateEl = document.getElementById('planEndDate');
    const planTotalWeeksEl = document.getElementById('planTotalWeeks');
    const btnEdit = document.getElementById('btnEdit');
    const btnExport = document.getElementById('btnExport');
    const btnPrint = document.getElementById('btnPrint');
    
    // Elementos de las pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Elementos para gráficos y visualizaciones
    const macrocyclesTimeline = document.getElementById('macrocyclesTimeline');
    const mesocyclesTimeline = document.getElementById('mesocyclesTimeline');
    const competitionsList = document.getElementById('competitionsList');
    const testsList = document.getElementById('testsList');
    const volumeChart = document.getElementById('volumeChart');
    
    // Variables para la pestaña mensual
    const monthlyCalendar = document.getElementById('monthlyCalendar');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    
    // Variables para la pestaña semanal
    const weekGrid = document.getElementById('weekGrid');
    const currentWeekEl = document.getElementById('currentWeek');
    const weekMesocycleEl = document.getElementById('weekMesocycle');
    const weekVolumeEl = document.getElementById('weekVolume');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    let currentWeekIndex = 0;
    
    // Obtener el ID de la planificación de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');
    
    // Obtener la planificación
    let planification = null;
    
    // Verificar si tenemos un ID válido
    if (!planId) {
        showError('No se ha especificado una planificación para visualizar');
        return;
    }
    
    // Cargar la planificación
    planification = getPlanificationById(planId);
    
    if (!planification) {
        showError('No se pudo encontrar la planificación especificada');
        return;
    }
    
    // Inicializar la página con los datos
    initializePage();
    
    // ===== Eventos =====
    
    // Eventos de pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Desactivar todas las pestañas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar pestaña seleccionada
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Si es la pestaña de gráficos, inicializar o actualizar los gráficos
            if (tabName === 'charts') {
                initializeCharts();
            }
        });
    });
    
    // Eventos para la navegación mensual
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderMonthlyCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderMonthlyCalendar();
    });
    
    // Eventos para la navegación semanal
    prevWeekBtn.addEventListener('click', function() {
        if (currentWeekIndex > 0) {
            currentWeekIndex--;
            renderWeeklyView();
        }
    });
    
    nextWeekBtn.addEventListener('click', function() {
        if (currentWeekIndex < planification.totalWeeks - 1) {
            currentWeekIndex++;
            renderWeeklyView();
        }
    });
    
    // Eventos para botones de acción
    btnEdit.addEventListener('click', function() {
        window.location.href = `edit-planification.html?id=${planId}`;
    });
    
    btnExport.addEventListener('click', function() {
        exportPlanificationToCSV(planification);
    });
    
    btnPrint.addEventListener('click', function() {
        window.print();
    });
    
    // ===== Funciones =====
    
    /**
     * Inicializa la página con los datos de la planificación
     */
    function initializePage() {
        // Información básica
        planNameEl.textContent = planification.name;
        planStatusEl.textContent = getPlanStatus(planification);
        planStatusEl.className = `plan-status ${getPlanStatusClass(planification)}`;
        planStartDateEl.textContent = formatDate(planification.startDate);
        planEndDateEl.textContent = formatDate(planification.endDate);
        planTotalWeeksEl.textContent = planification.totalWeeks;
        
        // Inicializar la vista general
        initializeOverview();
        
        // Inicializar la vista mensual
        renderMonthlyCalendar();
        
        // Inicializar la vista semanal
        renderWeeklyView();
    }
    
    /**
     * Inicializa la vista general
     */
    function initializeOverview() {
        // Línea de tiempo de macrociclos
        macrocyclesTimeline.innerHTML = '';
        if (planification.macrocycles && planification.macrocycles.length > 0) {
            planification.macrocycles.forEach(macro => {
                const width = ((macro.endWeek - macro.startWeek + 1) / planification.totalWeeks) * 100;
                const item = document.createElement('div');
                item.className = `timeline-item ${macro.type}`;
                item.style.width = `${width}%`;
                item.textContent = macro.name;
                item.title = `${macro.name}: Semanas ${macro.startWeek}-${macro.endWeek}`;
                macrocyclesTimeline.appendChild(item);
            });
        } else {
            macrocyclesTimeline.innerHTML = '<div class="timeline-empty">No hay macrociclos definidos</div>';
        }
        
        // Línea de tiempo de mesociclos
        mesocyclesTimeline.innerHTML = '';
        if (planification.mesocycles && planification.mesocycles.length > 0) {
            planification.mesocycles.forEach(meso => {
                const width = ((meso.endWeek - meso.startWeek + 1) / planification.totalWeeks) * 100;
                const item = document.createElement('div');
                item.className = `timeline-item ${meso.type}`;
                item.style.width = `${width}%`;
                item.textContent = meso.name;
                item.title = `${meso.name}: Semanas ${meso.startWeek}-${meso.endWeek}`;
                mesocyclesTimeline.appendChild(item);
            });
        } else {
            mesocyclesTimeline.innerHTML = '<div class="timeline-empty">No hay mesociclos definidos</div>';
        }
        
        // Lista de competencias
        competitionsList.innerHTML = '';
        if (planification.competitions && planification.competitions.length > 0) {
            const template = document.getElementById('competition-item-template');
            
            planification.competitions.forEach(comp => {
                const clone = document.importNode(template.content, true);
                
                // Configurar clase según el tipo
                const marker = clone.querySelector('.event-marker');
                if (comp.type === 'regional') {
                    marker.style.backgroundColor = '#17a2b8';
                } else if (comp.type === 'nacional') {
                    marker.style.backgroundColor = '#ffc107';
                } else if (comp.type === 'internacional') {
                    marker.style.backgroundColor = '#dc3545';
                }
                
                // Llenar información
                clone.querySelector('.event-name').textContent = comp.name;
                clone.querySelector('.event-date').textContent = formatDate(comp.date);
                clone.querySelector('.event-week').textContent = `Semana ${comp.week}`;
                
                competitionsList.appendChild(clone);
            });
        } else {
            competitionsList.innerHTML = '<div class="empty-message">No hay competencias programadas</div>';
        }
        
        // Lista de tests
        testsList.innerHTML = '';
        if (planification.tests && planification.tests.length > 0) {
            const template = document.getElementById('test-item-template');
            
            planification.tests.forEach(test => {
                const clone = document.importNode(template.content, true);
                
                // Llenar información
                clone.querySelector('.event-name').textContent = test.name;
                clone.querySelector('.event-date').textContent = formatDate(test.date);
                clone.querySelector('.event-week').textContent = `Semana ${test.week}`;
                
                if (test.description) {
                    clone.querySelector('.event-description').textContent = test.description;
                } else {
                    clone.querySelector('.event-description').remove();
                }
                
                testsList.appendChild(clone);
            });
        } else {
            testsList.innerHTML = '<div class="empty-message">No hay tests programados</div>';
        }
        
        // Gráfico de volumen (vista simple)
        renderVolumeChart();
    }
    
    /**
     * Renderiza el gráfico de volumen en la vista general
     */
    function renderVolumeChart() {
        if (!volumeChart) return;
        
        const ctx = volumeChart.getContext('2d');
        
        // Destruir gráfico existente si lo hay
        if (volumeChart.chart) {
            volumeChart.chart.destroy();
        }
        
        // Preparar datos
        const labels = [];
        const data = [];
        
        if (planification.microcycles && planification.microcycles.length > 0) {
            planification.microcycles.forEach(micro => {
                labels.push(`Sem ${micro.weekNumber}`);
                data.push(micro.volumeMeters || 0);
            });
        }
        
        // Crear gráfico
        volumeChart.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Volumen (metros)',
                    data: data,
                    backgroundColor: 'rgba(0, 153, 204, 0.2)',
                    borderColor: 'rgba(0, 153, 204, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Metros'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Semanas'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Inicializa todos los gráficos en la pestaña de gráficos
     */
    function initializeCharts() {
        // Gráfico de volumen semanal
        const weeklyVolumeChart = document.getElementById('weeklyVolumeChart');
        if (weeklyVolumeChart) {
            const ctx = weeklyVolumeChart.getContext('2d');
            
            // Destruir gráfico existente si lo hay
            if (weeklyVolumeChart.chart) {
                weeklyVolumeChart.chart.destroy();
            }
            
            // Preparar datos
            const labels = [];
            const data = [];
            
            if (planification.microcycles && planification.microcycles.length > 0) {
                planification.microcycles.forEach(micro => {
                    labels.push(`Sem ${micro.weekNumber}`);
                    data.push(micro.volumeMeters || 0);
                });
            }
            
            // Crear gráfico
            weeklyVolumeChart.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Volumen (metros)',
                        data: data,
                        backgroundColor: 'rgba(0, 153, 204, 0.7)',
                        borderColor: 'rgba(0, 123, 181, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Metros'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Semanas'
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de volumen por mesociclo
        const mesocycleVolumeChart = document.getElementById('mesocycleVolumeChart');
        if (mesocycleVolumeChart && planification.mesocycles && planification.mesocycles.length > 0) {
            const ctx = mesocycleVolumeChart.getContext('2d');
            
            // Destruir gráfico existente si lo hay
            if (mesocycleVolumeChart.chart) {
                mesocycleVolumeChart.chart.destroy();
            }
            
            // Preparar datos
            const labels = [];
            const data = [];
            const backgroundColors = [];
            
            // Colores por tipo de mesociclo
            const colorMap = {
                'base': 'rgba(179, 229, 252, 0.7)',
                'especifico': 'rgba(187, 222, 251, 0.7)',
                'precompetitivo': 'rgba(255, 249, 196, 0.7)',
                'competitivo': 'rgba(248, 215, 218, 0.7)',
                'transicion': 'rgba(209, 196, 233, 0.7)'
            };
            
            planification.mesocycles.forEach(meso => {
                labels.push(meso.name);
                
                // Calcular volumen total del mesociclo
                let mesoVolume = 0;
                if (planification.microcycles) {
                    planification.microcycles.forEach(micro => {
                        if (micro.weekNumber >= meso.startWeek && micro.weekNumber <= meso.endWeek) {
                            mesoVolume += micro.volumeMeters || 0;
                        }
                    });
                }
                
                data.push(mesoVolume);
                backgroundColors.push(colorMap[meso.type] || 'rgba(0, 153, 204, 0.7)');
            });
            
            // Crear gráfico
            mesocycleVolumeChart.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Volumen Total (metros)',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: 'rgba(0, 123, 181, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Metros'
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de distribución de competencias
        const competitionsChart = document.getElementById('competitionsChart');
        if (competitionsChart && planification.competitions && planification.competitions.length > 0) {
            const ctx = competitionsChart.getContext('2d');
            
            // Destruir gráfico existente si lo hay
            if (competitionsChart.chart) {
                competitionsChart.chart.destroy();
            }
            
            // Contar competencias por tipo
            const competitionCounts = {
                'regional': 0,
                'nacional': 0,
                'internacional': 0
            };
            
            planification.competitions.forEach(comp => {
                if (competitionCounts.hasOwnProperty(comp.type)) {
                    competitionCounts[comp.type]++;
                }
            });
            
            // Crear gráfico
            competitionsChart.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Regional', 'Nacional', 'Internacional'],
                    datasets: [{
                        data: [
                            competitionCounts.regional,
                            competitionCounts.nacional,
                            competitionCounts.internacional
                        ],
                        backgroundColor: [
                            'rgba(23, 162, 184, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(220, 53, 69, 0.7)'
                        ],
                        borderColor: [
                            'rgba(23, 162, 184, 1)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(220, 53, 69, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
        
        // Gráfico de intensidad por semana (intensidad simulada)
        const intensityChart = document.getElementById('intensityChart');
        if (intensityChart) {
            const ctx = intensityChart.getContext('2d');
            
            // Destruir gráfico existente si lo hay
            if (intensityChart.chart) {
                intensityChart.chart.destroy();
            }
            
            // Simular datos de intensidad basados en los mesociclos
            const labels = [];
            const data = [];
            
            // Mapeo de intensidad por tipo de mesociclo (valores simulados)
            const intensityMap = {
                'base': 5,
                'especifico': 7,
                'precompetitivo': 8,
                'competitivo': 9,
                'transicion': 3
            };
            
            // Generar valores de intensidad para cada semana
            for (let week = 1; week <= planification.totalWeeks; week++) {
                labels.push(`Sem ${week}`);
                
                // Encontrar el mesociclo correspondiente a esta semana
                const meso = planification.mesocycles ? 
                    planification.mesocycles.find(m => week >= m.startWeek && week <= m.endWeek) : null;
                
                // Asignar intensidad base según el tipo de mesociclo
                let baseIntensity = meso ? (intensityMap[meso.type] || 5) : 5;
                
                // Añadir variación aleatoria para simular fluctuaciones dentro del mesociclo
                const variation = (Math.random() * 2 - 1); // entre -1 y +1
                const weekIntensity = Math.min(10, Math.max(1, baseIntensity + variation));
                
                data.push(weekIntensity);
            }
            
            // Crear gráfico
            intensityChart.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Intensidad (1-10)',
                        data: data,
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        borderColor: 'rgba(255, 152, 0, 1)',
                        borderWidth: 2,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            max: 10,
                            title: {
                                display: true,
                                text: 'Intensidad'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Semanas'
                            }
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Renderiza el calendario mensual
     */
    function renderMonthlyCalendar() {
        // Actualizar título del mes
        currentMonthYearEl.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
        
        // Limpiar calendario
        monthlyCalendar.innerHTML = '';
        
        // Crear encabezados de días de la semana
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        dayNames.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.textContent = day;
            monthlyCalendar.appendChild(header);
        });
        
        // Obtener el primer día del mes
        const firstDay = new Date(currentYear, currentMonth, 1);
        
        // Obtener el último día del mes
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Días del mes anterior para completar la primera semana
        const firstDayOfWeek = firstDay.getDay();
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day prev-month';
            day.innerHTML = `<div class="day-number">${prevMonthLastDay - i}</div>`;
            monthlyCalendar.appendChild(day);
        }
        
        // Días del mes actual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(currentYear, currentMonth, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // Verificar si la fecha está en el rango de planificación
            const isInPlanRange = currentDate >= new Date(planification.startDate) && 
                                  currentDate <= new Date(planification.endDate);
            
            let dayContent = `<div class="day-number">${day}</div>`;
            
            if (isInPlanRange) {
                // Resaltar el día si está en el rango de planificación
                dayEl.classList.add('in-plan-range');
                
                // Calcular la semana correspondiente a esta fecha
                const weekNumber = calculateWeekNumber(new Date(planification.startDate), currentDate);
                
                // Eventos para este día
                const dayEvents = document.createElement('div');
                dayEvents.className = 'day-events';
                
                // Verificar competencias
                if (planification.competitions) {
                    planification.competitions.forEach(comp => {
                        const compDate = new Date(comp.date);
                        if (compDate.getDate() === day && 
                            compDate.getMonth() === currentMonth && 
                            compDate.getFullYear() === currentYear) {
                            
                            const eventEl = document.createElement('div');
                            eventEl.className = 'day-event competition';
                            eventEl.textContent = comp.name;
                            eventEl.title = `${comp.name} (${comp.type})`;
                            dayEvents.appendChild(eventEl);
                        }
                    });
                }
                
                // Verificar tests
                if (planification.tests) {
                    planification.tests.forEach(test => {
                        const testDate = new Date(test.date);
                        if (testDate.getDate() === day && 
                            testDate.getMonth() === currentMonth && 
                            testDate.getFullYear() === currentYear) {
                            
                            const eventEl = document.createElement('div');
                            eventEl.className = 'day-event test';
                            eventEl.textContent = test.name;
                            eventEl.title = test.name;
                            dayEvents.appendChild(eventEl);
                        }
                    });
                }
                
                dayEl.appendChild(dayEvents);
            }
            
            dayEl.innerHTML = `<div class="day-number">${day}</div>`;
            if (dayEvents) {
                dayEl.appendChild(dayEvents);
            }
            
            monthlyCalendar.appendChild(dayEl);
        }
        
        // Completar los días de la siguiente semana si es necesario
        const remainingCells = 7 - ((firstDayOfWeek + lastDay.getDate()) % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                const day = document.createElement('div');
                day.className = 'calendar-day next-month';
                day.innerHTML = `<div class="day-number">${i}</div>`;
                monthlyCalendar.appendChild(day);
            }
        }
    }
    
    /**
     * Renderiza la vista semanal
     */
    function renderWeeklyView() {
        // Actualizar el título de la semana
        const weekNumber = currentWeekIndex + 1;
        
        // Calcular fecha de inicio y fin de la semana
        const startDate = new Date(planification.startDate);
        startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        currentWeekEl.textContent = `Semana ${weekNumber}: ${formatDate(startDate)} - ${formatDate(endDate)}`;
        
        // Buscar el mesociclo correspondiente a esta semana
        const currentMesocycle = planification.mesocycles ? 
            planification.mesocycles.find(meso => 
                weekNumber >= meso.startWeek && weekNumber <= meso.endWeek
            ) : null;
        
        weekMesocycleEl.textContent = currentMesocycle ? currentMesocycle.name : 'No definido';
        
        // Buscar el volumen para esta semana
        const currentMicrocycle = planification.microcycles ? 
            planification.microcycles.find(micro => micro.weekNumber === weekNumber) : null;
        
        weekVolumeEl.textContent = currentMicrocycle ? 
            `${currentMicrocycle.volumeMeters || 0} m` : '0 m';
        
        // Renderizar la cuadrícula semanal
        weekGrid.innerHTML = '';
        
        // Crear un día para cada día de la semana
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            
            const dayEl = document.createElement('div');
            dayEl.className = 'week-day';
            
            // Encabezado del día
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-day-header';
            dayHeader.innerHTML = `
                <div class="day-name">${getDayName(currentDate.getDay())}</div>
                <div class="day-date">${formatDate(currentDate)}</div>
            `;
            
            // Contenido del día
            const dayContent = document.createElement('div');
            dayContent.className = 'week-day-content';
            
            // Verificar competencias para este día
            if (planification.competitions) {
                planification.competitions.forEach(comp => {
                    const compDate = new Date(comp.date);
                    if (compDate.getDate() === currentDate.getDate() && 
                        compDate.getMonth() === currentDate.getMonth() && 
                        compDate.getFullYear() === currentDate.getFullYear()) {
                        
                        const eventEl = document.createElement('div');
                        eventEl.className = 'day-event competition';
                        eventEl.innerHTML = `
                            <div class="event-title">${comp.name}</div>
                            <div class="event-type">${comp.type.charAt(0).toUpperCase() + comp.type.slice(1)}</div>
                        `;
                        dayContent.appendChild(eventEl);
                    }
                });
            }
            
            // Verificar tests para este día
            if (planification.tests) {
                planification.tests.forEach(test => {
                    const testDate = new Date(test.date);
                    if (testDate.getDate() === currentDate.getDate() && 
                        testDate.getMonth() === currentDate.getMonth() && 
                        testDate.getFullYear() === currentDate.getFullYear()) {
                        
                        const eventEl = document.createElement('div');
                        eventEl.className = 'day-event test';
                        eventEl.innerHTML = `
                            <div class="event-title">${test.name}</div>
                            <div class="event-description">${test.description || ''}</div>
                        `;
                        dayContent.appendChild(eventEl);
                    }
                });
            }
            
            dayEl.appendChild(dayHeader);
            dayEl.appendChild(dayContent);
            weekGrid.appendChild(dayEl);
        }
    }
    
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    function showError(message) {
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = `
            <section class="error-container">
                <div class="container">
                    <div class="error-message">
                        <h2><i class="fas fa-exclamation-triangle"></i> Error</h2>
                        <p>${message}</p>
                        <a href="planifications.html" class="btn btn-primary">Volver a Planificaciones</a>
                    </div>
                </div>
            </section>
        `;
    }
    
    /**
     * Determina el estado de una planificación
     * @param {Object} plan - Objeto de planificación
     * @returns {string} - Estado de la planificación (Activo, Completado, Borrador)
     */
    function getPlanStatus(plan) {
        // Convertir fechas a objetos Date para comparación correcta
        const now = new Date();
        const startDate = new Date(plan.startDate);
        const endDate = new Date(plan.endDate);
        
        // Ajustar para comparar solo fechas sin horas
        now.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        console.log('Fecha actual:', now);
        console.log('Fecha inicio:', startDate);
        console.log('Fecha fin:', endDate);
        
        if (now < startDate) {
            return 'Borrador';
        } else if (now > endDate) {
            return 'Completado';
        } else {
            return 'Activo';
        }
    }
    
    /**
     * Determina la clase CSS para el estado de una planificación
     * @param {Object} plan - Objeto de planificación
     * @returns {string} - Clase CSS para el estado
     */
    function getPlanStatusClass(plan) {
        const status = getPlanStatus(plan);
        
        switch (status) {
            case 'Activo':
                return 'active';
            case 'Completado':
                return 'completed';
            case 'Borrador':
                return 'draft';
            default:
                return '';
        }
    }
});