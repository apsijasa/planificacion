/**
 * NataPlan - planifications.js
 * JavaScript para la página de listado de planificaciones
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la página
    const planificationsList = document.getElementById('planificationsList');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchPlanification');
    const filterYear = document.getElementById('filterYear');
    const filterStatus = document.getElementById('filterStatus');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.querySelector('.cancel-delete');
    const confirmDeleteBtn = document.querySelector('.confirm-delete');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // ID de la planificación que se está por eliminar
    let planificationToDelete = null;
    
    // Cargar planificaciones cuando se carga la página
    loadPlanifications();
    
    // Eventos
    searchInput.addEventListener('input', debounce(filterPlanifications, 300));
    filterYear.addEventListener('change', filterPlanifications);
    filterStatus.addEventListener('change', filterPlanifications);
    
    // Evento de delegación para los botones de las tarjetas
    planificationsList.addEventListener('click', function(e) {
        // Botón ver
        if (e.target.classList.contains('view-btn') || 
            e.target.closest('.view-btn')) {
            e.preventDefault();
            const card = e.target.closest('.planification-card');
            const planId = card.dataset.id;
            window.location.href = `view-planification.html?id=${planId}`;
        }
        
        // Botón editar
        if (e.target.classList.contains('edit-btn') || 
            e.target.closest('.edit-btn')) {
            e.preventDefault();
            const card = e.target.closest('.planification-card');
            const planId = card.dataset.id;
            window.location.href = `edit-planification.html?id=${planId}`;
        }
        
        // Botón eliminar
        if (e.target.classList.contains('delete-btn') || 
            e.target.closest('.delete-btn')) {
            e.preventDefault();
            const card = e.target.closest('.planification-card');
            planificationToDelete = card.dataset.id;
            openDeleteModal();
        }
    });
    
    // Eventos para el modal de confirmación
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    closeModalBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // Cuando se hace clic fuera del modal, cerrarlo
    window.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    /**
     * Carga y muestra las planificaciones guardadas
     */
    function loadPlanifications() {
        try {
            // Obtener planificaciones del storage
            const planifications = getPlanifications();
            console.log("Planificaciones cargadas:", planifications); // Para depuración
            
            // Mostrar estado vacío si no hay planificaciones
            if (!planifications || planifications.length === 0) {
                planificationsList.innerHTML = '';
                emptyState.style.display = 'block';
                return;
            }
            
            // Ocultar estado vacío y mostrar planificaciones
            emptyState.style.display = 'none';
            renderPlanifications(planifications);
        } catch (error) {
            console.error("Error al cargar planificaciones:", error);
            planificationsList.innerHTML = '<div class="error-message">Error al cargar planificaciones: ' + error.message + '</div>';
        }
    }
    
    /**
     * Renderiza las planificaciones en la página
     * @param {Array} planifications - Array de objetos de planificación
     */
    function renderPlanifications(planifications) {
        planificationsList.innerHTML = '';
        
        const template = document.getElementById('planification-card-template');
        
        planifications.forEach(plan => {
            // Clonar la plantilla
            const clone = document.importNode(template.content, true);
            const card = clone.querySelector('.planification-card');
            
            // Agregar ID a la tarjeta
            card.dataset.id = plan.id;
            
            // Llenar la información de la planificación
            const title = card.querySelector('.planification-title');
            const status = card.querySelector('.planification-status');
            const startDate = card.querySelector('.start-date');
            const endDate = card.querySelector('.end-date');
            const weeksCount = card.querySelector('.weeks-count');
            const competitionsCount = card.querySelector('.competitions-count');
            const testsCount = card.querySelector('.tests-count');
            const viewBtn = card.querySelector('.view-btn');
            const editBtn = card.querySelector('.edit-btn');
            
            // Asignar valores
            title.textContent = plan.name;
            status.textContent = getPlanStatus(plan);
            status.classList.add(getPlanStatusClass(plan));
            startDate.textContent = formatDate(plan.startDate);
            endDate.textContent = formatDate(plan.endDate);
            weeksCount.textContent = plan.totalWeeks || 0;
            competitionsCount.textContent = plan.competitions ? plan.competitions.length : 0;
            testsCount.textContent = plan.tests ? plan.tests.length : 0;
            
            // Configurar enlaces
            viewBtn.href = `view-planification.html?id=${plan.id}`;
            editBtn.href = `edit-planification.html?id=${plan.id}`;
            
            // Agregar la tarjeta al listado
            planificationsList.appendChild(clone);
        });
    }
    
    /**
     * Filtra las planificaciones según los criterios de búsqueda
     */
    function filterPlanifications() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const yearFilter = filterYear.value;
        const statusFilter = filterStatus.value;
        
        // Obtener todas las planificaciones
        let planifications = getPlanifications();
        
        // Filtrar por término de búsqueda
        if (searchTerm) {
            planifications = planifications.filter(plan => 
                plan.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtrar por año
        if (yearFilter) {
            const year = parseInt(yearFilter);
            planifications = planifications.filter(plan => {
                const startYear = new Date(plan.startDate).getFullYear();
                return startYear === year;
            });
        }
        
        // Filtrar por estado
        if (statusFilter) {
            planifications = planifications.filter(plan => {
                const status = getPlanStatus(plan).toLowerCase();
                return status === statusFilter;
            });
        }
        
        // Mostrar resultados filtrados
        if (planifications.length === 0) {
            planificationsList.innerHTML = '<div class="no-results">No se encontraron planificaciones con los filtros aplicados.</div>';
        } else {
            renderPlanifications(planifications);
        }
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
    
    /**
     * Abre el modal de confirmación para eliminar
     */
    function openDeleteModal() {
        deleteModal.classList.add('active');
    }
    
    /**
     * Cierra el modal de confirmación
     */
    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        planificationToDelete = null;
    }
    
    /**
     * Confirma y ejecuta la eliminación de la planificación
     */
    function confirmDelete() {
        if (planificationToDelete) {
            if (deletePlanification(planificationToDelete)) {
                loadPlanifications();
                showToast('Planificación eliminada correctamente', 'success');
            } else {
                showToast('Error al eliminar la planificación', 'error');
            }
        }
        closeDeleteModal();
    }
    
    /**
     * Muestra un mensaje toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, warning)
     */
    function showToast(message, type = 'info') {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = message;
        
        // Agregar al DOM
        document.body.appendChild(toast);
        
        // Mostrar con animación
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Ocultar después de un tiempo
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    /**
     * Función debounce para evitar muchas ejecuciones seguidas
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} - Función con debounce aplicado
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
});