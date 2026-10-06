// =====================================================================
// Instrumento de Caracterización Institucional y Técnica
// Comisión N.° 10 — Sistema Nacional de Gestión Universitaria
// =====================================================================

let currentModule = 1;
const totalModules = 9;
const systemCategories = [
    { key: 'control_estudios', label: 'Control de Estudios' },
    { key: 'administrativo', label: 'Administrativo' },
    { key: 'personal', label: 'Personal' },
    { key: 'planificacion_presupuesto', label: 'Planificación y Presupuesto' },
    { key: 'otro', label: 'Otro sistema' }
];

function initializeSystemForms() {
    [4, 5, 6].forEach(moduleNumber => {
        const module = document.getElementById(`module-${moduleNumber}`);
        if (!module) return;

        const templateFields = Array.from(module.children).find(element =>
            element.classList.contains('grid') &&
            element.classList.contains('grid-cols-1') &&
            element.classList.contains('md:grid-cols-2')
        );
        if (!templateFields) return;

        const modulePrefix = `m${moduleNumber}_`;
        const template = templateFields.cloneNode(true);
        const systemForms = document.createElement('div');
        systemForms.className = 'system-forms space-y-3';

        const guidance = document.createElement('p');
        guidance.className = 'system-forms-guidance text-sm text-slate-600';
        guidance.textContent = 'Complete una ficha para cada sistema institucional. Cada ficha se guarda por separado.';
        systemForms.appendChild(guidance);

        systemCategories.forEach((category, index) => {
            const fields = template.cloneNode(true);
            const idMap = new Map();

            fields.querySelectorAll('[name]').forEach(control => {
                const name = control.name;
                if (name.startsWith(modulePrefix)) {
                    control.name = `${modulePrefix}${category.key}_${name.slice(modulePrefix.length)}`;
                }
            });

            fields.querySelectorAll('[id]').forEach(element => {
                const previousId = element.id;
                const nextId = `${previousId}_${category.key}`;
                idMap.set(previousId, nextId);
                element.id = nextId;
            });

            fields.querySelectorAll('label[for]').forEach(label => {
                const nextId = idMap.get(label.htmlFor);
                if (nextId) label.htmlFor = nextId;
            });

            if (category.key === 'otro') {
                const nameControl = fields.querySelector(`[name="${modulePrefix}otro_nombre_sistema"]`);
                if (nameControl) {
                    const label = nameControl.closest('div')?.querySelector('label');
                    if (label) label.textContent = 'Nombre definido por el usuario *';
                    nameControl.placeholder = 'Indique el nombre del otro sistema';
                } else {
                    const nameField = document.createElement('div');
                    nameField.className = 'md:col-span-2';
                    const label = document.createElement('label');
                    label.className = 'block text-xs font-semibold text-slate-700 mb-1';
                    label.textContent = 'Nombre definido por el usuario *';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.name = `${modulePrefix}otro_nombre_sistema`;
                    input.required = true;
                    input.placeholder = 'Indique el nombre del otro sistema';
                    input.className = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none';
                    nameField.append(label, input);
                    fields.prepend(nameField);
                }
            }

            const details = document.createElement('details');
            details.className = 'system-form-entry';
            details.open = index === 0;

            const summary = document.createElement('summary');
            summary.textContent = category.label;

            const content = document.createElement('div');
            content.className = 'system-form-content';
            content.appendChild(fields);
            details.append(summary, content);
            systemForms.appendChild(details);
        });

        templateFields.replaceWith(systemForms);
    });
}

// ---------------------------------------------------------------------
// Navegación entre módulos
// ---------------------------------------------------------------------
function switchModule(moduleIndex) {
    if (moduleIndex < 1 || moduleIndex > totalModules) return;

    // Ocultar actual
    const currentModuleEl = document.getElementById(`module-${currentModule}`);
    if (currentModuleEl) {
        currentModuleEl.classList.add('hidden');
    }

    // Desactivar pestaña
    const prevNav = document.getElementById(`nav-mod-${currentModule}`);
    if (prevNav) {
        prevNav.classList.remove('border-blue-800', 'bg-slate-100');
        prevNav.classList.add('border-transparent');
        const badge = prevNav.querySelector('span:first-child');
        if (badge) {
            badge.classList.replace('bg-blue-900', 'bg-slate-200');
            badge.classList.replace('text-white', 'text-slate-700');
        }
    }

    currentModule = moduleIndex;

    // Mostrar nuevo
    const newModuleEl = document.getElementById(`module-${currentModule}`);
    if (newModuleEl) {
        newModuleEl.classList.remove('hidden');
    }

    // Activar pestaña nueva
    const newNav = document.getElementById(`nav-mod-${currentModule}`);
    if (newNav) {
        newNav.classList.add('border-blue-800', 'bg-slate-100');
        newNav.classList.remove('border-transparent');
        const badge = newNav.querySelector('span:first-child');
        if (badge) {
            badge.classList.replace('bg-slate-200', 'bg-blue-900');
            badge.classList.replace('text-slate-700', 'text-white');
        }
    }

    // Actualizar botones de navegación
    const prevBtn    = document.getElementById('prevBtn');
    const nextBtn    = document.getElementById('nextBtn');
    const summaryBtn = document.getElementById('summaryBtn');

    if (currentModule === 1) {
        prevBtn.classList.add('invisible');
    } else {
        prevBtn.classList.remove('invisible');
    }

    if (currentModule === totalModules) {
        nextBtn.classList.add('hidden');
        summaryBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        summaryBtn.classList.add('hidden');
    }

    // Actualizar indicador de progreso
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateModule(direction) {
    if (direction > 0 && currentModule === 1 && !validateNivelesOtorga()) return;
    if (direction > 0 && currentModule === 2 && (!validatePeriodosAcademicos() || !validateDocumentosConstancias() || !validateServiciosEstudiantilesOtros())) return;
    switchModule(currentModule + direction);
}

function updateProgress() {
    const percentage = Math.round((currentModule / totalModules) * 100);
    const progressBar = document.getElementById('globalProgressBar');
    const progressText = document.getElementById('progressText');

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.innerText = `${currentModule} de ${totalModules}`;
}

// ---------------------------------------------------------------------
// Lógica condicional del Módulo I
// Muestra "m1_parcial" únicamente cuando se elige "Parcial" en m1_tiene_sistema
// ---------------------------------------------------------------------
function toggleParcialField() {
    const select  = document.getElementById('m1_tiene_sistema_select');
    const wrapper = document.getElementById('m1_parcial_wrapper');
    const textarea = wrapper ? wrapper.querySelector('textarea[name="m1_parcial"]') : null;

    if (!select || !wrapper) return;

    const isParcial = select.value === 'Parcial';

    if (isParcial) {
        wrapper.classList.remove('hidden');
    } else {
        wrapper.classList.add('hidden');
        // Limpiar el contenido para no enviar datos obsoletos al backend
        if (textarea) textarea.value = '';
    }
}

// Muestra "m1_tipo_ieu_otro" únicamente cuando se elige "Otro"
function toggleTipoIeuOtroField() {
    const select  = document.getElementById('m1_tipo_ieu_select');
    const wrapper = document.getElementById('m1_tipo_ieu_otro_wrapper');
    const input   = wrapper ? wrapper.querySelector('input[name="m1_tipo_ieu_otro"]') : null;

    if (!select || !wrapper) return;

    const isOtro = select.value === 'Otro';

    if (isOtro) {
        wrapper.classList.remove('hidden');
        if (input) input.required = true;
    } else {
        wrapper.classList.add('hidden');
        if (input) {
            input.required = false;
            input.value = '';
        }
    }
}

function toggleTipoSedeOtroField() {
    const select = document.getElementById('m1_tipo_sede_select');
    const wrapper = document.getElementById('m1_tipo_sede_otro_wrapper');
    const input = wrapper ? wrapper.querySelector('input[name="m1_tipo_sede_otro"]') : null;

    if (!select || !wrapper) return;

    const isOtro = select.value === 'Otro';
    wrapper.classList.toggle('hidden', !isOtro);

    if (input) {
        input.required = isOtro;
        if (!isOtro) input.value = '';
    }
}

function getSelectedNivelGroup() {
    return Array.from(document.querySelectorAll('input[name="m1_nivel"]:checked')).map(el => el.value);
}

function validateNivelesOtorga() {
    const selectedGroups = getSelectedNivelGroup();
    if (!selectedGroups.length) {
        alert('⚠️ Debe seleccionar al menos una de las 3 opciones: Intermedio, Pregrado o Postgrado.');
        return false;
    }

    return true;
}

function bindNivelesOtorga() {
    document.querySelectorAll('input[name="m1_nivel"]').forEach(el => {
        el.addEventListener('change', () => {
            const selected = getSelectedNivelGroup();
            if (selected.length) {
                console.log('Niveles seleccionados:', selected);
            }
        });
    });
}

// ---------------------------------------------------------------------
// Lógica condicional del Módulo II
// Muestra "m2_unidades_otro_N" únicamente cuando se elige "OTRO" en
// el desplegable "Unidades Responsables" correspondiente.
// Aplica a los 7 sub-bloques (II.I a II.VII)
// ---------------------------------------------------------------------
function toggleOtroField(index) {
    const select  = document.getElementById(`m2_unidades_responsables_${index}_select`);
    const wrapper = document.getElementById(`m2_unidades_otro_${index}_wrapper`);
    const input   = wrapper ? wrapper.querySelector(`input[name="m2_unidades_otro_${index}"]`) : null;

    if (!select || !wrapper) return;

    const isOtro = select.value === 'OTRO';

    if (isOtro) {
        wrapper.classList.remove('hidden');
    } else {
        wrapper.classList.add('hidden');
        // Limpiar el contenido para no enviar datos obsoletos al backend
        if (input) input.value = '';
    }
}

// Enlaza los eventos 'change' de los 7 desplegables del Módulo II
function bindAllOtroToggles() {
    for (let i = 1; i <= 7; i++) {
        const select = document.getElementById(`m2_unidades_responsables_${i}_select`);
        if (select) {
            select.addEventListener('change', () => toggleOtroField(i));
            // Estado inicial por si el borrador ya traía "OTRO"
            toggleOtroField(i);
        }
    }
}

function toggleAlertasPrelacionesField() {
    const digitalizacion = document.getElementById('m2_grado_digitalizacion_3_select');
    const wrapper = document.getElementById('m2_alertas_prelaciones_wrapper');
    const answer = wrapper ? wrapper.querySelector('select[name="m2_alertas_prelaciones"]') : null;

    if (!digitalizacion || !wrapper) return;

    const showField = ['Total', 'Parcial Alto', 'Parcial Bajo'].includes(digitalizacion.value);
    wrapper.classList.toggle('hidden', !showField);

    if (!showField && answer) {
        answer.value = '';
    }
}

function bindAlertasPrelacionesField() {
    const digitalizacion = document.getElementById('m2_grado_digitalizacion_3_select');
    if (!digitalizacion) return;

    digitalizacion.addEventListener('change', toggleAlertasPrelacionesField);
    toggleAlertasPrelacionesField();
}

function toggleReportePlanificacionField() {
    const digitalizacion = document.getElementById('m2_grado_digitalizacion_5_select');
    const wrapper = document.getElementById('m2_reporte_planificacion_wrapper');
    const answer = wrapper ? wrapper.querySelector('select[name="m2_reporte_planificacion"]') : null;

    if (!digitalizacion || !wrapper) return;

    const showField = ['Total', 'Parcial Alto', 'Parcial Bajo'].includes(digitalizacion.value);
    wrapper.classList.toggle('hidden', !showField);

    if (!showField && answer) {
        answer.value = '';
    }
}

function bindReportePlanificacionField() {
    const digitalizacion = document.getElementById('m2_grado_digitalizacion_5_select');
    if (!digitalizacion) return;

    digitalizacion.addEventListener('change', toggleReportePlanificacionField);
    toggleReportePlanificacionField();
}

function toggleAutogestionOtrasField() {
    const checkboxes = document.querySelectorAll('input[name="m3_formas_autogestion"]');
    const wrapper = document.getElementById('m3_formas_autogestion_otras_wrapper');
    const details = document.getElementById('m3_formas_autogestion_otras');
    const showField = Array.from(checkboxes).some(el => el.checked && el.value === 'Otras');

    if (wrapper) {
        wrapper.classList.toggle('hidden', !showField);
    }

    if (!showField && details) {
        details.value = '';
    }
}

function bindAutogestionOptions() {
    const checkboxes = document.querySelectorAll('input[name="m3_formas_autogestion"]');
    checkboxes.forEach(el => el.addEventListener('change', toggleAutogestionOtrasField));
    toggleAutogestionOtrasField();
}

function togglePeriodosAcademicosOtroField() {
    const checkboxes = document.querySelectorAll('input[name="m2_periodos_academicos"]');
    const wrapper = document.getElementById('m2_periodos_academicos_otro_wrapper');
    const input = wrapper ? wrapper.querySelector('input[name="m2_periodos_academicos_otro"]') : null;

    const hasOtros = Array.from(checkboxes).some(el => el.checked && el.value === 'otros');

    if (wrapper) {
        wrapper.classList.toggle('hidden', !hasOtros);
    }

    if (input) {
        input.required = hasOtros;
        if (!hasOtros) {
            input.value = '';
        }
    }
}

function bindPeriodosAcademicosField() {
    const checkboxes = document.querySelectorAll('input[name="m2_periodos_academicos"]');
    if (!checkboxes.length) return;

    checkboxes.forEach(el => {
        el.addEventListener('change', togglePeriodosAcademicosOtroField);
    });

    togglePeriodosAcademicosOtroField();
}

function validatePeriodosAcademicos() {
    const checkboxes = Array.from(document.querySelectorAll('input[name="m2_periodos_academicos"]'));
    if (checkboxes.some(el => el.checked)) return true;

    alert('Seleccione al menos una opción en “Distribución de los períodos académicos”.');
    const section = document.querySelector('.period-distribution');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (checkboxes[0]) checkboxes[0].focus({ preventScroll: true });
    return false;
}

function toggleDocumentosConstanciasOtroField() {
    const checkboxes = document.querySelectorAll('input[name="m2_documentos_constancias"]');
    const wrapper = document.getElementById('m2_documentos_constancias_otro_wrapper');
    const input = document.getElementById('m2_documentos_constancias_otro');
    const hasOtros = Array.from(checkboxes).some(el => el.checked && el.value === 'Otros');

    if (wrapper) {
        wrapper.classList.toggle('hidden', !hasOtros);
    }

    if (input) {
        input.required = hasOtros;
        if (!hasOtros) input.value = '';
    }
}

function bindDocumentosConstanciasField() {
    const checkboxes = document.querySelectorAll('input[name="m2_documentos_constancias"]');
    checkboxes.forEach(el => el.addEventListener('change', toggleDocumentosConstanciasOtroField));
    toggleDocumentosConstanciasOtroField();
}

function toggleServiciosEstudiantilesOtrosField() {
    const checkboxes = document.querySelectorAll('input[name="m2_servicios_estudiantiles"]');
    const wrapper = document.getElementById('m2_servicios_estudiantiles_otros_wrapper');
    const input = document.getElementById('m2_servicios_estudiantiles_otros');
    const hasOtros = Array.from(checkboxes).some(el => el.checked && el.value === 'Otros');

    if (wrapper) {
        wrapper.classList.toggle('hidden', !hasOtros);
    }

    if (input) {
        input.required = hasOtros;
        if (!hasOtros) input.value = '';
    }
}

function bindServiciosEstudiantilesField() {
    const checkboxes = document.querySelectorAll('input[name="m2_servicios_estudiantiles"]');
    checkboxes.forEach(el => el.addEventListener('change', toggleServiciosEstudiantilesOtrosField));
    toggleServiciosEstudiantilesOtrosField();
}

function validateServiciosEstudiantilesOtros() {
    const checkboxes = document.querySelectorAll('input[name="m2_servicios_estudiantiles"]');
    const hasOtros = Array.from(checkboxes).some(el => el.checked && el.value === 'Otros');
    const input = document.getElementById('m2_servicios_estudiantiles_otros');

    if (hasOtros && !String(input ? input.value : '').trim()) {
        alert('Especifique los otros servicios estudiantiles.');
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
    }

    return true;
}

function validateDocumentosConstancias() {
    const checkboxes = Array.from(document.querySelectorAll('input[name="m2_documentos_constancias"]'));
    const selected = checkboxes.filter(el => el.checked);

    if (!selected.length) {
        alert('Seleccione al menos un documento que se emita como constancia o certificación.');
        const fieldset = document.getElementById('m2_documentos_constancias_fieldset');
        if (fieldset) fieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (checkboxes[0]) checkboxes[0].focus({ preventScroll: true });
        return false;
    }

    const otherInput = document.getElementById('m2_documentos_constancias_otro');
    if (selected.some(el => el.value === 'Otros') && !String(otherInput ? otherInput.value : '').trim()) {
        alert('Especifique el tipo de documento seleccionado en “Otros”.');
        if (otherInput) {
            otherInput.focus();
            otherInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
    }

    return true;
}

function toggleNivelesOtroFields() {
    return true;
}

// ---------------------------------------------------------------------
// Extraer datos del formulario como objeto
// ---------------------------------------------------------------------
function getFormData() {
    const form     = document.getElementById('caracterizacionForm');
    const formData = new FormData(form);
    const data     = {};

    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    return data;
}

// ---------------------------------------------------------------------
// Guardar borrador en LocalStorage
// ---------------------------------------------------------------------
function saveDraft(evt) {
    const data = getFormData();
    localStorage.setItem('caracterizacion_borrador', JSON.stringify(data));

    // Feedback visual
    const btn = evt ? evt.currentTarget : document.getElementById('saveDraftHeaderBtn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Guardado!`;

    const originalBg = btn.classList.contains('bg-blue-700') ? 'bg-blue-700' : 'bg-slate-800';
    btn.classList.replace(originalBg, 'bg-emerald-600');

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('bg-emerald-600', originalBg);
    }, 2000);
}

// ---------------------------------------------------------------------
// Exportar a JSON
// ---------------------------------------------------------------------
function exportJSONData() {
    const data    = getFormData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a       = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `caracterizacion_sistema_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// ---------------------------------------------------------------------
// Cargar borrador previo (y re-aplicar todas las lógicas condicionales)
// ---------------------------------------------------------------------
function loadDraft() {
    const saved = localStorage.getItem('caracterizacion_borrador');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        const form = document.getElementById('caracterizacionForm');

        Object.keys(data).forEach(key => {
            const legacySystemField = key.match(/^(m[456])_(.+)$/);
            const legacyControlStudiesName = legacySystemField
                ? `${legacySystemField[1]}_control_estudios_${legacySystemField[2]}`
                : null;
            const elements = Array.from(form.elements).filter(el =>
                el.name === key || el.name === legacyControlStudiesName
            );
            elements.forEach(el => {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    if (Array.isArray(data[key])) {
                        el.checked = data[key].includes(el.value);
                    } else {
                        el.checked = (el.value === data[key] || data[key] === "on");
                    }
                } else {
                    el.value = data[key];
                }
            });
        });

        // Re-aplicar visibilidades tras restaurar los valores
        toggleParcialField();
        toggleTipoIeuOtroField();
        toggleTipoSedeOtroField();
        toggleNivelesOtroFields();
        for (let i = 1; i <= 7; i++) toggleOtroField(i);
        toggleAlertasPrelacionesField();
        toggleReportePlanificacionField();
        toggleAutogestionOtrasField();
        toggleDocumentosConstanciasOtroField();
        toggleServiciosEstudiantilesOtrosField();
    } catch (e) {
        console.error("Error al cargar borrador", e);
    }
}

// ---------------------------------------------------------------------
// Modal de Resumen
// ---------------------------------------------------------------------
function openSummaryModal() {
    const data      = getFormData();
    const container = document.getElementById('modalContent');

    let html = `<div class="space-y-4">`;

    const modulesTitle = [
        "I. Identificación Institucional",
        "II. Procesos Académicos y Control de Estudios",
        "III. Personal, Carga Docente y Presupuesto",
        "IV. Aplicaciones, Licenciamientos y SO",
        "V. Hospedaje y Redes",
        "VI. Bases de Datos y Calidad de Información",
        "VII. Interoperabilidad y GTU",
        "VIII. Seguridad, Continuidad y Auditoría",
        "IX. Preparación para Migración"
    ];

    modulesTitle.forEach((title, idx) => {
        const modPrefix = `m${idx + 1}_`;
        const keys      = Object.keys(data).filter(k => k.startsWith(modPrefix));

        html += `
            <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 class="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1 mb-2">${title}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        `;

        if (keys.length === 0) {
            html += `<span class="text-slate-400 italic col-span-2">Sin campos registrados en este módulo.</span>`;
        } else {
            keys.forEach(k => {
                const label = k.replace(modPrefix, '').replace(/_/g, ' ');
                const val   = Array.isArray(data[k]) ? data[k].join(', ') : data[k];
                html += `
                    <div>
                        <span class="font-semibold text-slate-600 capitalize">${label}:</span>
                        <span class="text-slate-900">${val || 'N/R'}</span>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
    document.getElementById('summaryModal').classList.remove('hidden');
}

function closeSummaryModal() {
    document.getElementById('summaryModal').classList.add('hidden');
}

// El guardado es local: GitHub Pages no tiene conexión al backend ni a PostgreSQL.
// ---------------------------------------------------------------------
// Inicialización
// ---------------------------------------------------------------------
window.onload = function () {
    initializeSystemForms();
    loadDraft();
    updateProgress();

    // Lógica condicional Módulo I (m1_parcial)
    const selectSistema = document.getElementById('m1_tiene_sistema_select');
    if (selectSistema) {
        selectSistema.addEventListener('change', toggleParcialField);
        toggleParcialField(); // estado inicial
    }

    const selectTipoIeu = document.getElementById('m1_tipo_ieu_select');
    if (selectTipoIeu) {
        selectTipoIeu.addEventListener('change', toggleTipoIeuOtroField);
        toggleTipoIeuOtroField();
    }

    const selectTipoSede = document.getElementById('m1_tipo_sede_select');
    if (selectTipoSede) {
        selectTipoSede.addEventListener('change', toggleTipoSedeOtroField);
        toggleTipoSedeOtroField();
    }

    bindNivelesOtorga();

    // Lógica condicional Módulo II (m2_unidades_otro_1..7)
    bindAllOtroToggles();
    bindAlertasPrelacionesField();
    bindReportePlanificacionField();
    bindAutogestionOptions();

    // Distribución de períodos académicos (selección múltiple con campo condicional "otros")
    bindPeriodosAcademicosField();
    bindDocumentosConstanciasField();
    bindServiciosEstudiantilesField();
};

