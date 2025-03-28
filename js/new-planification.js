/**
 * NataPlan - new-planification.js
 * JavaScript para la página de creación de planificaciones
 */

document.addEventListener('DOMContentLoaded', function () {
    // Elementos de navegación de pasos
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const formSteps = document.querySelectorAll('.form-step');

    // Botones de navegación entre pasos
    const next1Btn = document.getElementById('next1');
    const prev2Btn = document.getElementById('prev2');
    const next2Btn = document.getElementById('next2');
    const prev3Btn = document.getElementById('prev3');
    const next3Btn = document.getElementById('next3');
    const prev4Btn = document.getElementById('prev4');
    const savePlanBtn = document.getElementById('savePlan');
    const cancel1Btn = document.getElementById('cancel1');

    // Campos de formulario
    const planNameInput = document.getElementById('planName');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const descriptionInput = document.getElementById('description');

    // Contenedores para elementos dinámicos
    const macrocyclesContainer = document.getElementById('macrocyclesContainer');
    const mesocyclesContainer = document.getElementById('mesocyclesContainer');
    const competitionsContainer = document.getElementById('competitionsContainer');
    const testsContainer = document.getElementById('testsContainer');
    const volumeContainer = document.getElementById('volumeContainer');

    // Botones para añadir elementos
    const addMacrocycleBtn = document.getElementById('addMacrocycle');
    const addMesocycleBtn = document.getElementById('addMesocycle');
    const addCompetitionBtn = document.getElementById('addCompetition');
    const addTestBtn = document.getElementById('addTest');

    // El formulario completo
    const planificationForm = document.getElementById('planificationForm');

    // Estado de la aplicación - aquí se guardará la planificación
    let planState = {
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        totalWeeks: 0,
        macrocycles: [],
        mesocycles: [],
        competitions: [],
        tests: [],
        microcycles: []
    };

    // ===== Eventos =====

    // Navegación entre pasos
    next1Btn.addEventListener('click', () => {
        if (validateStep1()) {
            updatePlanFromInputs();
            goToStep(2);
            updateMacroMesoCycles();
        }
    });

    prev2Btn.addEventListener('click', () => goToStep(1));
    next2Btn.addEventListener('click', () => {
        if (validateStep2()) {
            updateCyclesFromInputs();
            goToStep(3);
        }
    });

    prev3Btn.addEventListener('click', () => goToStep(2));
    next3Btn.addEventListener('click', () => {
        updateEventsFromInputs();
        goToStep(4);
        setupVolumeGrid();
    });

    prev4Btn.addEventListener('click', () => goToStep(3));

    // Cancelar la creación de la planificación
    cancel1Btn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
            window.location.href = 'planifications.html';
        }
    });

    // Botones para añadir elementos
    addMacrocycleBtn.addEventListener('click', addMacrocycle);
    addMesocycleBtn.addEventListener('click', addMesocycle);
    addCompetitionBtn.addEventListener('click', addCompetition);
    addTestBtn.addEventListener('click', addTest);

    // Guardar planificación
    planificationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        try {
            if (saveCompletePlanification()) {
                window.location.href = './planifications.html';
            } else {
                console.error("No se pudo guardar la planificación");
                alert("Error al guardar la planificación");
            }
        } catch (error) {
            console.error("Error al procesar el formulario:", error);
            alert("Ocurrió un error: " + error.message);
        }
    });

    // Actualizar semanas al cambiar fechas
    startDateInput.addEventListener('change', updateTotalWeeks);
    endDateInput.addEventListener('change', updateTotalWeeks);

    // ===== Inicialización =====

    // Establecer fecha actual como valor predeterminado
    const today = new Date().toISOString().split('T')[0];
    startDateInput.value = today;

    // Calcular fecha de fin predeterminada (1 año después)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    endDateInput.value = nextYear.toISOString().split('T')[0];

    // Calcular semanas iniciales
    updateTotalWeeks();

    // ===== Funciones =====

    /**
     * Navega a un paso específico del formulario
     * @param {number} step - Número de paso (1-4)
     */
    function goToStep(step) {
        // Ocultar todos los pasos
        formSteps.forEach(formStep => {
            formStep.classList.remove('active');
        });

        // Desactivar todos los indicadores
        stepIndicators.forEach(indicator => {
            indicator.classList.remove('active');
        });

        // Mostrar paso actual
        document.getElementById(`step${step}`).classList.add('active');

        // Activar indicador actual
        document.querySelector(`[data-step="${step}"]`).classList.add('active');

        // Desplazar al inicio del formulario
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Valida los campos del paso 1
     * @returns {boolean} - True si los campos son válidos
     */
    function validateStep1() {
        if (!planNameInput.value.trim()) {
            alert('Por favor, ingresa un nombre para la planificación');
            planNameInput.focus();
            return false;
        }

        if (!startDateInput.value) {
            alert('Por favor, selecciona una fecha de inicio');
            startDateInput.focus();
            return false;
        }

        if (!endDateInput.value) {
            alert('Por favor, selecciona una fecha de fin');
            endDateInput.focus();
            return false;
        }

        if (new Date(startDateInput.value) >= new Date(endDateInput.value)) {
            alert('La fecha de fin debe ser posterior a la fecha de inicio');
            endDateInput.focus();
            return false;
        }

        return true;
    }

    /**
     * Valida los campos del paso 2
     * @returns {boolean} - True si los campos son válidos
     */
    function validateStep2() {
        let isValid = true;

        // Validar macrociclos
        document.querySelectorAll('.macrocycle-item').forEach(item => {
            const nameInput = item.querySelector('.macro-name');
            const startWeekInput = item.querySelector('.macro-start-week');
            const endWeekInput = item.querySelector('.macro-end-week');

            if (!nameInput.value.trim()) {
                alert('Por favor, ingresa un nombre para todos los macrociclos');
                nameInput.focus();
                isValid = false;
                return false;
            }

            if (!startWeekInput.value || isNaN(parseInt(startWeekInput.value))) {
                alert('Por favor, ingresa una semana de inicio válida para todos los macrociclos');
                startWeekInput.focus();
                isValid = false;
                return false;
            }

            if (!endWeekInput.value || isNaN(parseInt(endWeekInput.value))) {
                alert('Por favor, ingresa una semana de fin válida para todos los macrociclos');
                endWeekInput.focus();
                isValid = false;
                return false;
            }

            if (parseInt(startWeekInput.value) > parseInt(endWeekInput.value)) {
                alert('La semana de fin debe ser mayor o igual a la semana de inicio');
                endWeekInput.focus();
                isValid = false;
                return false;
            }
        });

        if (!isValid) return false;

        // Validar mesociclos
        document.querySelectorAll('.mesocycle-item').forEach(item => {
            const nameInput = item.querySelector('.meso-name');
            const startWeekInput = item.querySelector('.meso-start-week');
            const endWeekInput = item.querySelector('.meso-end-week');

            if (!nameInput.value.trim()) {
                alert('Por favor, ingresa un nombre para todos los mesociclos');
                nameInput.focus();
                isValid = false;
                return false;
            }

            if (!startWeekInput.value || isNaN(parseInt(startWeekInput.value))) {
                alert('Por favor, ingresa una semana de inicio válida para todos los mesociclos');
                startWeekInput.focus();
                isValid = false;
                return false;
            }

            if (!endWeekInput.value || isNaN(parseInt(endWeekInput.value))) {
                alert('Por favor, ingresa una semana de fin válida para todos los mesociclos');
                endWeekInput.focus();
                isValid = false;
                return false;
            }

            if (parseInt(startWeekInput.value) > parseInt(endWeekInput.value)) {
                alert('La semana de fin debe ser mayor o igual a la semana de inicio');
                endWeekInput.focus();
                isValid = false;
                return false;
            }
        });

        return isValid;
    }

    /**
     * Actualiza el estado de la planificación desde los inputs básicos
     */
    function updatePlanFromInputs() {
        planState.name = planNameInput.value.trim();
        planState.startDate = startDateInput.value;
        planState.endDate = endDateInput.value;
        planState.description = descriptionInput.value.trim();
        planState.totalWeeks = calculateTotalWeeks();
    }

    /**
     * Actualiza el estado de los ciclos desde los inputs
     */
    function updateCyclesFromInputs() {
        // Macrociclos
        planState.macrocycles = [];
        document.querySelectorAll('.macrocycle-item').forEach(item => {
            planState.macrocycles.push({
                name: item.querySelector('.macro-name').value.trim(),
                type: item.querySelector('.macro-type').value,
                startWeek: parseInt(item.querySelector('.macro-start-week').value),
                endWeek: parseInt(item.querySelector('.macro-end-week').value)
            });
        });

        // Mesociclos
        planState.mesocycles = [];
        document.querySelectorAll('.mesocycle-item').forEach(item => {
            planState.mesocycles.push({
                name: item.querySelector('.meso-name').value.trim(),
                type: item.querySelector('.meso-type').value,
                startWeek: parseInt(item.querySelector('.meso-start-week').value),
                endWeek: parseInt(item.querySelector('.meso-end-week').value)
            });
        });
    }

    /**
     * Actualiza el estado de las competencias y tests desde los inputs
     */
    function updateEventsFromInputs() {
        // Competencias
        planState.competitions = [];
        document.querySelectorAll('.competition-item').forEach(item => {
            const dateValue = item.querySelector('.competition-date').value;
            const week = dateValue ?
                calculateWeekNumber(new Date(planState.startDate), new Date(dateValue)) : 0;

            planState.competitions.push({
                name: item.querySelector('.competition-name').value.trim(),
                type: item.querySelector('.competition-type').value,
                date: dateValue,
                week: week
            });

            // Actualizar semana en el input
            item.querySelector('.competition-week').value = week;
        });

        // Tests
        planState.tests = [];
        document.querySelectorAll('.test-item').forEach(item => {
            const dateValue = item.querySelector('.test-date').value;
            const week = dateValue ?
                calculateWeekNumber(new Date(planState.startDate), new Date(dateValue)) : 0;

            planState.tests.push({
                name: item.querySelector('.test-name').value.trim(),
                date: dateValue,
                week: week,
                description: item.querySelector('.test-description').value.trim()
            });

            // Actualizar semana en el input
            item.querySelector('.test-week').value = week;
        });
    }

    /**
     * Guarda la planificación completa
     * @returns {boolean} - True si se guardó correctamente
     */
    function saveCompletePlanification() {
        // Actualizar volumen desde inputs
        planState.microcycles = [];
        document.querySelectorAll('.volume-week').forEach((item, index) => {
            const weekNumber = index + 1;
            const startDate = new Date(planState.startDate);
            startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);

            planState.microcycles.push({
                weekNumber: weekNumber,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                volumeMeters: parseInt(item.querySelector('.week-volume').value || 0)
            });
        });

        // Verificar tamaño de datos
        const planJson = JSON.stringify(planState);
        console.log("Tamaño de datos:", planJson.length, "bytes");

        // Si es mayor a 5MB podría dar problemas
        if (planJson.length > 5 * 1024 * 1024) {
            alert("La planificación es demasiado grande para guardar en localStorage");
            return false;
        }

        // Guardar en localStorage
        return savePlanification(planState);
    }

    /**
     * Calcula el total de semanas entre las fechas seleccionadas
     * @returns {number} - Total de semanas
     */
    function calculateTotalWeeks() {
        if (!startDateInput.value || !endDateInput.value) return 0;

        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        
        // Establecer horas a 0 para comparación precisa de días
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // Calcular diferencia en milisegundos
        const diffTime = Math.abs(end - start);
        // Convertir a días
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Calcular semanas usando Math.floor y sumar 1 para incluir la semana inicial
        const diffWeeks = Math.floor(diffDays / 7);
        
        return diffWeeks + 1;
    }

    /**
     * Actualiza el contador de semanas totales
     */
    function updateTotalWeeks() {
        planState.totalWeeks = calculateTotalWeeks();
    }

    /**
     * Actualiza los ciclos después de cambiar las fechas
     */
    function updateMacroMesoCycles() {
        updateTotalWeeks(); // Actualizar el valor de totalWeeks antes de crear los ciclos predeterminados

        // Si no hay macrociclos, añadir uno predeterminado
        if (macrocyclesContainer.children.length === 0) {
            // Macrociclo preparatorio (2/3 del tiempo)
            const prepWeeks = Math.floor(planState.totalWeeks * 2 / 3);
            addMacrocycle(1, prepWeeks, 'Preparatorio', 'preparatorio');

            // Macrociclo competitivo (1/3 del tiempo restante)
            addMacrocycle(prepWeeks + 1, planState.totalWeeks, 'Competitivo', 'competitivo');
        }

        // Si no hay mesociclos, añadir cuatro predeterminados
        if (mesocyclesContainer.children.length === 0) {
            const mesosCount = 4;
            const mesoWeeks = Math.floor(planState.totalWeeks / mesosCount);

            addMesocycle(1, mesoWeeks, 'Base', 'base');
            addMesocycle(mesoWeeks + 1, mesoWeeks * 2, 'Específico', 'especifico');
            addMesocycle(mesoWeeks * 2 + 1, mesoWeeks * 3, 'Precompetitivo', 'precompetitivo');
            addMesocycle(mesoWeeks * 3 + 1, planState.totalWeeks, 'Competitivo', 'competitivo');
        }
    }

    /**
     * Añade un nuevo macrociclo
     * @param {number} startWeek - Semana de inicio (opcional)
     * @param {number} endWeek - Semana de fin (opcional)
     * @param {string} name - Nombre del macrociclo (opcional)
     * @param {string} type - Tipo de macrociclo (opcional)
     */
    function addMacrocycle(startWeek = 1, endWeek = planState.totalWeeks, name = '', type = 'preparatorio') {
        const template = document.getElementById('macrocycle-template');
        const clone = document.importNode(template.content, true);

        // Llenar la información
        const macroNumber = macrocyclesContainer.children.length + 1;
        clone.querySelector('.cycle-number').textContent = macroNumber;

        const nameInput = clone.querySelector('.macro-name');
        const typeInput = clone.querySelector('.macro-type');
        const startWeekInput = clone.querySelector('.macro-start-week');
        const endWeekInput = clone.querySelector('.macro-end-week');

        // Establecer valores
        nameInput.value = name || `Macrociclo ${macroNumber}`;
        typeInput.value = type;
        startWeekInput.value = startWeek;
        endWeekInput.value = endWeek;

        // Botón de eliminar
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function () {
            const item = this.closest('.macrocycle-item');
            item.remove();
            updateMacrocycleNumbers();
        });

        // Agregar al contenedor
        macrocyclesContainer.appendChild(clone);
    }

    /**
     * Actualiza los números de los macrociclos
     */
    function updateMacrocycleNumbers() {
        const macrocycles = macrocyclesContainer.querySelectorAll('.macrocycle-item');
        macrocycles.forEach((item, index) => {
            item.querySelector('.cycle-number').textContent = index + 1;
        });
    }

    /**
     * Añade un nuevo mesociclo
     * @param {number} startWeek - Semana de inicio (opcional)
     * @param {number} endWeek - Semana de fin (opcional)
     * @param {string} name - Nombre del mesociclo (opcional)
     * @param {string} type - Tipo de mesociclo (opcional)
     */
    function addMesocycle(startWeek = 1, endWeek = planState.totalWeeks, name = '', type = 'base') {
        const template = document.getElementById('mesocycle-template');
        const clone = document.importNode(template.content, true);

        // Llenar la información
        const mesoNumber = mesocyclesContainer.children.length + 1;
        clone.querySelector('.cycle-number').textContent = mesoNumber;

        const nameInput = clone.querySelector('.meso-name');
        const typeInput = clone.querySelector('.meso-type');
        const startWeekInput = clone.querySelector('.meso-start-week');
        const endWeekInput = clone.querySelector('.meso-end-week');

        // Establecer valores
        nameInput.value = name || `Mesociclo ${mesoNumber}`;
        typeInput.value = type;
        startWeekInput.value = startWeek;
        endWeekInput.value = endWeek;

        // Botón de eliminar
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function () {
            const item = this.closest('.mesocycle-item');
            item.remove();
            updateMesocycleNumbers();
        });

        // Agregar al contenedor
        mesocyclesContainer.appendChild(clone);
    }

    /**
     * Actualiza los números de los mesociclos
     */
    function updateMesocycleNumbers() {
        const mesocycles = mesocyclesContainer.querySelectorAll('.mesocycle-item');
        mesocycles.forEach((item, index) => {
            item.querySelector('.cycle-number').textContent = index + 1;
        });
    }

    /**
     * Añade una nueva competencia
     */
    function addCompetition() {
        const template = document.getElementById('competition-template');
        const clone = document.importNode(template.content, true);

        // Llenar la información
        const compNumber = competitionsContainer.children.length + 1;
        clone.querySelector('.competition-number').textContent = compNumber;

        // Configurar campo de fecha para calcular la semana
        const dateInput = clone.querySelector('.competition-date');
        const weekInput = clone.querySelector('.competition-week');

        dateInput.addEventListener('change', function () {
            if (this.value) {
                const week = calculateWeekNumber(new Date(planState.startDate), new Date(this.value));
                weekInput.value = week;
            } else {
                weekInput.value = '';
            }
        });

        // Botón de eliminar
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function () {
            const item = this.closest('.competition-item');
            item.remove();
            updateCompetitionNumbers();
        });

        // Agregar al contenedor
        competitionsContainer.appendChild(clone);
    }

    /**
     * Actualiza los números de las competencias
     */
    function updateCompetitionNumbers() {
        const competitions = competitionsContainer.querySelectorAll('.competition-item');
        competitions.forEach((item, index) => {
            item.querySelector('.competition-number').textContent = index + 1;
        });
    }

    /**
     * Añade un nuevo test
     */
    function addTest() {
        const template = document.getElementById('test-template');
        const clone = document.importNode(template.content, true);

        // Llenar la información
        const testNumber = testsContainer.children.length + 1;
        clone.querySelector('.test-number').textContent = testNumber;

        // Configurar campo de fecha para calcular la semana
        const dateInput = clone.querySelector('.test-date');
        const weekInput = clone.querySelector('.test-week');

        dateInput.addEventListener('change', function () {
            if (this.value) {
                const week = calculateWeekNumber(new Date(planState.startDate), new Date(this.value));
                weekInput.value = week;
            } else {
                weekInput.value = '';
            }
        });

        // Botón de eliminar
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function () {
            const item = this.closest('.test-item');
            item.remove();
            updateTestNumbers();
        });

        // Agregar al contenedor
        testsContainer.appendChild(clone);
    }

    /**
     * Actualiza los números de los tests
     */
    function updateTestNumbers() {
        const tests = testsContainer.querySelectorAll('.test-item');
        tests.forEach((item, index) => {
            item.querySelector('.test-number').textContent = index + 1;
        });
    }

    /**
     * Configura la cuadrícula de volumen semanal
     */
    function setupVolumeGrid() {
        volumeContainer.innerHTML = '';
        const template = document.getElementById('volume-week-template');
        
        // Asegurarnos de usar el valor actualizado de totalWeeks
        updateTotalWeeks(); // Actualizar el valor antes de generar la cuadrícula
        
        // Crear un elemento para cada semana según planState.totalWeeks
        for (let i = 0; i < planState.totalWeeks; i++) {
            const clone = document.importNode(template.content, true);
            const weekNumber = i + 1;
            
            clone.querySelector('.week-number').textContent = weekNumber;
            
            // Agregar al contenedor
            volumeContainer.appendChild(clone);
        }
    }
    
}); // <-- Esta es la llave que falta para cerrar el evento DOMContentLoaded
