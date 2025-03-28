/**
 * NataPlan - main.js
 * JavaScript principal para la aplicación de planificación de natación
 */

document.addEventListener('DOMContentLoaded', function () {
    // Comprobación inicial para ver si hay almacenamiento local disponible
    if (storageAvailable('localStorage')) {
        console.log('Almacenamiento local disponible');
        // Verificamos si es la primera vez que el usuario visita la web
        if (!localStorage.getItem('nataplan_visited')) {
            showWelcomeMessage();
            localStorage.setItem('nataplan_visited', 'true');
        }
    } else {
        console.warn('Almacenamiento local no disponible - algunas funcionalidades pueden no funcionar');
    }

    // Inicializar componentes
    initializeNavigation();
});

/**
 * Verifica si el almacenamiento local está disponible
 * @param {string} type - El tipo de almacenamiento a verificar
 * @returns {boolean} - True si está disponible, false en caso contrario
 */
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * Muestra un mensaje de bienvenida para nuevos usuarios
 */
function showWelcomeMessage() {
    console.log('Usuario nuevo - Se podría mostrar un tutorial o mensaje de bienvenida aquí');
    // Aquí se podría implementar un modal de bienvenida o tutorial
}

/**
 * Inicializa la navegación y eventos del menú
 */
function initializeNavigation() {
    // Resaltar la página actual en el menú
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage ||
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Formatea una fecha en el formato DD/MM/YYYY
 * @param {Date} date - La fecha a formatear
 * @returns {string} - La fecha formateada
 */
function formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
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

/**
 * Función para guardar una planificación en el localStorage
 * @param {Object} planification - El objeto de planificación a guardar
 */
function savePlanification(planification) {
    try {
        if (!storageAvailable('localStorage')) {
            throw new Error('Almacenamiento local no disponible');
        }

        // Obtener planificaciones existentes
        let planifications = [];
        try {
            planifications = JSON.parse(localStorage.getItem('nataplan_planifications') || '[]');
        } catch (e) {
            console.error("Error al leer planificaciones:", e);
            planifications = [];
        }

        // Si la planificación ya existe (actualización), actualizarla
        const existingIndex = planifications.findIndex(p => p.id === planification.id);

        if (existingIndex >= 0) {
            planifications[existingIndex] = planification;
        } else {
            // Es una nueva planificación, asignar ID y agregar
            planification.id = generateUUID();
            planification.createdAt = new Date().toISOString();
            planifications.push(planification);
        }

        // Actualizar timestamp
        planification.updatedAt = new Date().toISOString();

        // Guardar en localStorage con manejo de errores
        try {
            localStorage.setItem('nataplan_planifications', JSON.stringify(planifications));
            return true;
        } catch (e) {
            console.error("Error al guardar en localStorage:", e);
            throw new Error('No se pudo guardar en localStorage: ' + e.message);
        }
    } catch (error) {
        console.error("Error en savePlanification:", error);
        alert("Error al guardar: " + error.message);
        return false;
    }
}

/**
 * Función para obtener todas las planificaciones almacenadas
 * @returns {Array} - Array de objetos de planificación
 */
function getPlanifications() {
    if (!storageAvailable('localStorage')) {
        console.warn('No se pueden obtener planificaciones: almacenamiento local no disponible');
        return [];
    }

    return JSON.parse(localStorage.getItem('nataplan_planifications') || '[]');
}

/**
 * Función para obtener una planificación específica por ID
 * @param {string} id - El ID de la planificación a obtener
 * @returns {Object|null} - El objeto de planificación o null si no se encuentra
 */
function getPlanificationById(id) {
    const planifications = getPlanifications();
    return planifications.find(p => p.id === id) || null;
}

/**
 * Función para eliminar una planificación por ID
 * @param {string} id - El ID de la planificación a eliminar
 * @returns {boolean} - True si se eliminó correctamente, false en caso contrario
 */
function deletePlanification(id) {
    if (!storageAvailable('localStorage')) {
        alert('No se puede eliminar la planificación: almacenamiento local no disponible');
        return false;
    }

    let planifications = getPlanifications();
    const initialLength = planifications.length;

    planifications = planifications.filter(p => p.id !== id);

    if (planifications.length < initialLength) {
        localStorage.setItem('nataplan_planifications', JSON.stringify(planifications));
        return true;
    }

    return false;
}

/**
 * Genera un UUID único para las planificaciones
 * @returns {string} - UUID generado
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Calcula el número de semana en una fecha desde la fecha inicial
 * @param {Date} startDate - La fecha de inicio
 * @param {Date} date - La fecha para la cual se calcula la semana
 * @returns {number} - El número de semana (1-based)
 */
function calculateWeekNumber(startDate, date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((target - start) / millisecondsPerDay);
    
    return Math.floor(diffDays / 7) + 1;
}

/**
 * Obtiene el nombre del mes en español
 * @param {number} month - El número de mes (0-11)
 * @returns {string} - Nombre del mes en español
 */
function getMonthName(month) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return monthNames[month];
}

/**
 * Obtiene el nombre del día de la semana en español
 * @param {number} day - El número del día (0-6, donde 0 es domingo)
 * @returns {string} - Nombre del día en español
 */
function getDayName(day) {
    const dayNames = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles',
        'Jueves', 'Viernes', 'Sábado'
    ];

    return dayNames[day];
}

/**
 * Exporta una planificación a formato CSV
 * @param {Object} planification - La planificación a exportar
 */
function exportPlanificationToCSV(planification) {
    if (!planification) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    // Información básica
    csvContent += 'Nombre,Fecha Inicio,Fecha Fin,Total Semanas\n';
    csvContent += `${planification.name},${planification.startDate},${planification.endDate},${planification.totalWeeks}\n\n`;

    // Macrociclos
    csvContent += 'MACROCICLOS\n';
    csvContent += 'Nombre,Tipo,Semana Inicio,Semana Fin\n';
    planification.macrocycles.forEach(macro => {
        csvContent += `${macro.name},${macro.type},${macro.startWeek},${macro.endWeek}\n`;
    });
    csvContent += '\n';

    // Mesociclos
    csvContent += 'MESOCICLOS\n';
    csvContent += 'Nombre,Tipo,Semana Inicio,Semana Fin\n';
    planification.mesocycles.forEach(meso => {
        csvContent += `${meso.name},${meso.type},${meso.startWeek},${meso.endWeek}\n`;
    });
    csvContent += '\n';

    // Competencias
    csvContent += 'COMPETENCIAS\n';
    csvContent += 'Nombre,Tipo,Fecha,Semana\n';
    planification.competitions.forEach(comp => {
        csvContent += `${comp.name},${comp.type},${comp.date},${comp.week}\n`;
    });
    csvContent += '\n';

    // Tests
    csvContent += 'TESTS\n';
    csvContent += 'Nombre,Fecha,Semana,Descripción\n';
    planification.tests.forEach(test => {
        csvContent += `${test.name},${test.date},${test.week},"${test.description}"\n`;
    });
    csvContent += '\n';

    // Microciclos (volumen semanal)
    csvContent += 'VOLUMEN SEMANAL\n';
    csvContent += 'Semana,Fecha Inicio,Fecha Fin,Volumen (m)\n';
    planification.microcycles.forEach(micro => {
        csvContent += `${micro.weekNumber},${micro.startDate},${micro.endDate},${micro.volumeMeters}\n`;
    });

    // Crear enlace para descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nataplan_${planification.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);

    // Descargar archivo
    link.click();

    // Limpiar
    document.body.removeChild(link);
}
