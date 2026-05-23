// ════════════════════════════════════════════════
//  ECOTRACK  ·  app.js
// ════════════════════════════════════════════════

// ── Inyección de navbars desde template ──────────
const NAV_SCREENS = ['screen-home', 'screen-perfil', 'screen-config', 'screen-ayuda'];
const tpl = document.getElementById('tpl-nav');
document.querySelectorAll('[data-nav-inject]').forEach(placeholder => {
  const nav    = tpl.content.cloneNode(true);
  const btns   = nav.querySelectorAll('.nav-btn');
  const active = parseInt(placeholder.dataset.navActive ?? 0, 10);
  btns.forEach((btn, i) => {
    btn.onclick = () => showScreen(NAV_SCREENS[i]);
    if (i === active) btn.classList.add('active');
  });
  placeholder.replaceWith(nav);
});

// ── Navigation ────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// ── Toast ─────────────────────────────────────────
function showToast(msg, duration = 2400) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Helpers de validación ─────────────────────────
function getValues(...ids) { return ids.map(id => document.getElementById(id).value.trim()); }
function allFilled(...vals) { return vals.every(Boolean); }

// ════════════════════════════════════════════════
//  PERSISTENCIA  (localStorage)
// ════════════════════════════════════════════════
function saveData(key, value) {
  try { localStorage.setItem('ecotrack_' + key, JSON.stringify(value)); } catch(e) {}
}
function loadData(key, fallback = null) {
  try {
    const raw = localStorage.getItem('ecotrack_' + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch(e) { return fallback; }
}

// ── Estado global ─────────────────────────────────
let puntos  = loadData('puntos', 0);
let titulo  = loadData('titulo', null);   // título comprado en tienda

// ════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════
function handleLogin() {
  const [email, pass] = getValues('login-email', 'login-pass');
  if (!allFilled(email, pass)) { showToast('⚠️ Completa todos los campos'); return; }
  showToast('✅ ¡Bienvenido a EcoTrack!');
  setTimeout(() => { showScreen('screen-home'); refreshHome(); }, 1400);
}
function handleRegister() {
  const [u, e, p, c] = getValues('reg-user', 'reg-email', 'reg-pass', 'reg-confirm');
  if (!allFilled(u, e, p, c)) { showToast('⚠️ Completa todos los campos'); return; }
  if (p !== c) { showToast('⚠️ Las contraseñas no coinciden'); return; }
  showToast('✅ ¡Cuenta creada exitosamente!');
  setTimeout(() => showScreen('screen-login'), 1800);
}
function handleForgot() {
  const [name, email] = getValues('forgot-name', 'forgot-email');
  if (!allFilled(name, email)) { showToast('⚠️ Completa todos los campos'); return; }
  showToast('📧 Correo de recuperación enviado');
  setTimeout(() => showScreen('screen-newpass'), 1800);
}
function handleNewPass() {
  const [p, c] = getValues('new-pass', 'new-confirm');
  if (!allFilled(p, c)) { showToast('⚠️ Completa todos los campos'); return; }
  if (p !== c) { showToast('⚠️ Las contraseñas no coinciden'); return; }
  showToast('🔐 ¡Contraseña actualizada!');
  setTimeout(() => showScreen('screen-login'), 1800);
}
function socialLogin(provider) { showToast(`🔗 Conectando con ${provider}…`); }
function cerrarSesion() {
  showToast('👋 Sesión cerrada');
  setTimeout(() => showScreen('screen-login'), 1400);
}

// ════════════════════════════════════════════════
//  HOME  — actualizar puntos y tarjeta inferior
// ════════════════════════════════════════════════
function refreshHome() {
  // Puntos en app-bar
  const el = document.getElementById('home-puntos');
  if (el) el.textContent = puntos + ' pts';

  // Tarjeta inferior: título comprado o Eco Racha
  const card = document.getElementById('home-bottom-card');
  if (!card) return;
  if (titulo) {
    card.innerHTML = `
      <div class="eco-racha-left">
        <div class="eco-racha-title">Tu <span>Título</span></div>
        <div class="eco-titulo-name">${titulo.icono} ${titulo.nombre}</div>
        <div class="eco-racha-unit">${titulo.desc}</div>
      </div>
      <div class="eco-racha-leaf">${titulo.icono}</div>`;
  } else {
    card.innerHTML = `
      <div class="eco-racha-left">
        <div class="eco-racha-title">Eco <span>Racha</span></div>
        <div class="eco-racha-number">35</div>
        <div class="eco-racha-unit">días</div>
      </div>
      <div class="eco-racha-leaf">🌿</div>`;
  }
}

// ════════════════════════════════════════════════
//  ECO-QUIZ  —  30 preguntas, 10 al azar
// ════════════════════════════════════════════════
const BANCO_PREGUNTAS = [
  { q: '¿Qué describe mejor una cadena alimentaria?',           ops: ['Plantas → Herbívoros → Carnívoros','Solo plantas','Solo animales','Minerales y agua'], correct: 0 },
  { q: '¿Cuánto CO₂ absorbe un árbol adulto al año?',           ops: ['~22 kg','~2 kg','~200 kg','~1 kg'], correct: 0 },
  { q: '¿Qué significa "biodiversidad"?',                       ops: ['Variedad de vida en un ecosistema','Solo animales','Solo plantas','Agua limpia'], correct: 0 },
  { q: '¿Cuál es la principal causa del calentamiento global?', ops: ['Gases de efecto invernadero','El sol','Los volcanes','La luna'], correct: 0 },
  { q: '¿Qué es el reciclaje?',                                 ops: ['Procesar residuos para reutilizar','Tirar basura','Quemar desechos','Enterrar plástico'], correct: 0 },
  { q: '¿Qué capa protege la Tierra de los rayos UV?',          ops: ['Capa de ozono','Troposfera','Corteza','Ionosfera'], correct: 0 },
  { q: '¿Cuánto tarda una bolsa de plástico en degradarse?',    ops: ['400-1000 años','10 años','50 años','1 año'], correct: 0 },
  { q: '¿Qué es la huella de carbono?',                         ops: ['CO₂ emitido por actividades humanas','Huellas en el suelo','Color del carbón','Tipo de combustible'], correct: 0 },
  { q: '¿Qué energía NO es renovable?',                         ops: ['Petróleo','Solar','Eólica','Hidráulica'], correct: 0 },
  { q: '¿Qué porcentaje del agua de la Tierra es dulce?',       ops: ['3%','50%','25%','10%'], correct: 0 },
  { q: '¿Qué animal es indicador de la salud de un ecosistema?',ops: ['Abeja','León','Ballena','Águila'], correct: 0 },
  { q: '¿Qué significa 3R en ecología?',                        ops: ['Reducir, Reutilizar, Reciclar','Renovar, Reparar, Reemplazar','Recoger, Retirar, Rellenar','Resistir, Reclamar, Retener'], correct: 0 },
  { q: '¿Cuál es el gas más abundante en la atmósfera?',        ops: ['Nitrógeno','Oxígeno','CO₂','Argón'], correct: 0 },
  { q: '¿Qué es la deforestación?',                             ops: ['Tala masiva de bosques','Plantar árboles','Riego de plantas','Poda de jardines'], correct: 0 },
  { q: '¿Qué tipo de energía produce un panel solar?',          ops: ['Eléctrica','Térmica','Mecánica','Nuclear'], correct: 0 },
  { q: '¿Qué es el compostaje?',                                ops: ['Descomposición de materia orgánica','Quema de basura','Filtrado de agua','Separación de metales'], correct: 0 },
  { q: '¿Cuánta agua usa una ducha de 5 minutos?',              ops: ['~50 litros','~5 litros','~200 litros','~10 litros'], correct: 0 },
  { q: '¿Qué es un ecosistema?',                                ops: ['Comunidad de seres vivos e inerte','Solo animales','Solo plantas','Solo agua'], correct: 0 },
  { q: '¿Cuál es el principal componente del smog?',            ops: ['Ozono troposférico y partículas','Solo polvo','Solo agua','Hidrógeno'], correct: 0 },
  { q: '¿Qué es la lluvia ácida?',                              ops: ['Lluvia con pH bajo por contaminación','Lluvia de verano','Lluvia con sal','Lluvia fría'], correct: 0 },
  { q: '¿Qué país produce más basura electrónica?',             ops: ['China','México','Brasil','Alemania'], correct: 0 },
  { q: '¿Qué es la fotosíntesis?',                              ops: ['Proceso por el que plantas producen alimento','Respiración de animales','Ciclo del agua','Digestión humana'], correct: 0 },
  { q: '¿Qué representa el "punto verde" en un producto?',      ops: ['Producto reciclable','Producto orgánico','Precio reducido','Sin gluten'], correct: 0 },
  { q: '¿Cuántos océanos tiene la Tierra?',                     ops: ['5','3','4','6'], correct: 0 },
  { q: '¿Qué es un calentamiento de 1.5 °C según el IPCC?',    ops: ['Límite para evitar efectos graves del cambio climático','Temperatura ideal de verano','Temperatura de los polos','Temperatura del mar'], correct: 0 },
  { q: '¿Qué energía aprovecha el viento?',                     ops: ['Eólica','Solar','Mareomotriz','Geotérmica'], correct: 0 },
  { q: '¿Qué es una especie invasora?',                         ops: ['Especie que daña un ecosistema ajeno','Especie en peligro','Especie endémica','Especie migratoria'], correct: 0 },
  { q: '¿Qué hace un filtro de carbón activado?',               ops: ['Purifica el agua absorbiendo contaminantes','Calienta el agua','Desala el océano','Produce oxígeno'], correct: 0 },
  { q: '¿Cuál es la alternativa ecológica a la bolsa plástica?',ops: ['Bolsa de tela reutilizable','Bolsa de papel','Caja de cartón','Envoltura de aluminio'], correct: 0 },
  { q: '¿Qué es la permacultura?',                              ops: ['Diseño agrícola sostenible','Tipo de pesticida','Cultivo en invernadero','Riego por aspersión'], correct: 0 },
];

let quizSesion = [];   // 10 preguntas de la sesión actual
let quizIndex  = 0;    // índice actual
let quizScore  = 0;    // puntos ganados en esta sesión

function iniciarQuiz() {
  // Seleccionar 10 preguntas al azar sin repetir
  const mezcladas = [...BANCO_PREGUNTAS].sort(() => Math.random() - 0.5);
  quizSesion = mezcladas.slice(0, 10);
  quizIndex  = 0;
  quizScore  = 0;
  renderPregunta();
  showScreen('screen-quiz');
}

function renderPregunta() {
  const p = quizSesion[quizIndex];
  document.getElementById('quiz-num').textContent    = `Pregunta ${quizIndex + 1} de 10`;
  document.getElementById('quiz-barra').style.width  = `${(quizIndex / 10) * 100}%`;
  document.getElementById('quiz-pregunta').textContent = p.q;

  // Mezclar opciones manteniendo cuál es correcta
  const indices = [0,1,2,3].sort(() => Math.random() - 0.5);
  const contenedor = document.getElementById('quiz-opciones');
  contenedor.innerHTML = '';
  indices.forEach(i => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = p.ops[i];
    btn.onclick = () => responder(btn, i === p.correct, contenedor);
    contenedor.appendChild(btn);
  });
}

function responder(btn, isCorrect, contenedor) {
  // Bloquear todas las opciones
  contenedor.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
  btn.classList.add(isCorrect ? 'correct' : 'wrong');

  if (isCorrect) {
    quizScore += 10;
    showToast('🎉 ¡Correcto! +10 puntos');
  } else {
    showToast('❌ Incorrecto — pero sigue adelante!');
    // Marcar la correcta en verde
    contenedor.querySelectorAll('.quiz-option').forEach(b => {
      if (b.textContent === quizSesion[quizIndex].ops[quizSesion[quizIndex].correct]) {
        b.classList.add('correct');
      }
    });
  }

  setTimeout(() => {
    quizIndex++;
    if (quizIndex < 10) {
      renderPregunta();
    } else {
      finalizarQuiz();
    }
  }, 1800);
}

function finalizarQuiz() {
  puntos += quizScore;
  saveData('puntos', puntos);

  // Guardar historial de quiz
  const historial = loadData('historial_quiz', []);
  historial.unshift({ fecha: new Date().toLocaleDateString('es-MX'), score: quizScore });
  saveData('historial_quiz', historial.slice(0, 20));

  showScreen('screen-quiz-resultado');
  document.getElementById('resultado-score').textContent  = quizScore;
  document.getElementById('resultado-total').textContent  = `de 100 posibles`;
  document.getElementById('resultado-puntos').textContent = `Total acumulado: ${puntos} pts`;

  const msj = quizScore === 100
    ? '🏆 ¡Perfecto! Eres un verdadero Eco-Campeón'
    : quizScore >= 70
    ? '🌿 ¡Muy bien! Sigues creciendo en el eco-camino'
    : quizScore >= 40
    ? '🌱 ¡Buen intento! Cada respuesta te acerca más'
    : '💪 No te rindas, ¡la naturaleza te necesita!';
  document.getElementById('resultado-mensaje').textContent = msj;
  refreshHome();
}

// ════════════════════════════════════════════════
//  TIENDA DE TÍTULOS
// ════════════════════════════════════════════════
const TITULOS = [
  { id: 'semilla',  nombre: 'Semilla Verde',    icono: '🌱', costo: 50,  desc: 'Primer paso en el eco-camino' },
  { id: 'guardian', nombre: 'Guardián del Bosque', icono: '🌳', costo: 150, desc: 'Protector de ecosistemas' },
  { id: 'campeon',  nombre: 'Eco-Campeón',       icono: '🏆', costo: 300, desc: 'Leyenda de la sostenibilidad' },
];

function renderTienda() {
  const cont = document.getElementById('tienda-titulos');
  if (!cont) return;
  cont.innerHTML = '';

  TITULOS.forEach(t => {
    const equipado  = titulo && titulo.id === t.id;
    const comprado  = loadData('titulo_' + t.id, false);
    const puedePagar = puntos >= t.costo;

    let estadoTxt, estadoCls, accion;
    if (equipado) {
      estadoTxt = 'Equipado ✓'; estadoCls = 'btn-equipado'; accion = null;
    } else if (comprado) {
      estadoTxt = 'Equipar'; estadoCls = 'btn-equipar'; accion = () => equiparTitulo(t);
    } else {
      estadoTxt = `${t.costo} pts`; estadoCls = puedePagar ? '' : 'btn-sin-pts'; accion = puedePagar ? () => comprarTitulo(t) : null;
    }

    const fila = document.createElement('div');
    fila.className = 'titulo-fila';
    fila.innerHTML = `
      <div class="titulo-icono">${t.icono}</div>
      <div class="titulo-info">
        <div class="titulo-nombre">${t.nombre}</div>
        <div class="titulo-desc">${t.desc}</div>
      </div>
      <button class="tienda-offer-btn ${estadoCls}" ${accion ? '' : 'disabled'}>${estadoTxt}</button>`;
    if (accion) fila.querySelector('button').onclick = accion;
    cont.appendChild(fila);
  });

  document.getElementById('tienda-puntos-disp').textContent = `Tus puntos: ${puntos} pts`;
}

function comprarTitulo(t) {
  if (puntos < t.costo) { showToast('⚠️ No tienes suficientes puntos'); return; }
  puntos -= t.costo;
  saveData('puntos', puntos);
  saveData('titulo_' + t.id, true);
  equiparTitulo(t);
}

function equiparTitulo(t) {
  titulo = t;
  saveData('titulo', t);
  showToast(`🎖️ ¡Título "${t.nombre}" equipado!`);
  refreshHome();
  renderTienda();
}

// ════════════════════════════════════════════════
//  NUEVO HÁBITO  (con localStorage y seguimiento)
// ════════════════════════════════════════════════
const HABITOS_LISTA = [
  { id: 'agua',     label: 'Ahorro de agua y energía',           dias: 7,  puntos: 30 },
  { id: 'reciclaje',label: 'Reducir, reutilizar y reciclar',     dias: 14, puntos: 50 },
  { id: 'plastico', label: 'Reducción de plásticos de un solo uso', dias: 10, puntos: 40 },
];

function renderHabitos() {
  const cont = document.getElementById('habito-opciones');
  if (!cont) return;
  cont.innerHTML = '';
  HABITOS_LISTA.forEach(h => {
    const activo = loadData('habito_activo_' + h.id, null);
    const btn = document.createElement('button');
    btn.className = 'habito-option' + (activo ? ' habito-activo' : '');
    btn.dataset.id = h.id;
    btn.innerHTML = `${h.label}<br><small style="opacity:.7;font-size:11px">${activo ? '✅ En progreso · ' + diasRestantes(activo.fin) + ' días restantes' : `${h.dias} días · +${h.puntos} pts`}</small>`;
    if (!activo) btn.onclick = () => toggleHabito(btn);
    cont.appendChild(btn);
  });
}

function diasRestantes(finISO) {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fin  = new Date(finISO);
  const diff = Math.ceil((fin - hoy) / 86400000);
  return Math.max(diff, 0);
}

function toggleHabito(btn) { btn.classList.toggle('selected'); }

function agregarMeta() {
  const seleccionados = document.querySelectorAll('#habito-opciones .habito-option.selected');
  if (!seleccionados.length) { showToast('⚠️ Selecciona al menos un hábito'); return; }

  let agregados = 0;
  seleccionados.forEach(btn => {
    const habito = HABITOS_LISTA.find(h => h.id === btn.dataset.id);
    if (!habito) return;
    const yaActivo = loadData('habito_activo_' + habito.id, null);
    if (yaActivo) return;

    const inicio = new Date();
    const fin    = new Date();
    fin.setDate(fin.getDate() + habito.dias);
    saveData('habito_activo_' + habito.id, {
      id: habito.id, label: habito.label,
      inicio: inicio.toISOString(), fin: fin.toISOString(),
      puntos: habito.puntos
    });
    agregados++;
  });

  if (agregados > 0) {
    showToast(`✅ ¡${agregados} meta(s) iniciada(s)!`);
    renderHabitos();
    verificarHabitosVencidos();
    setTimeout(() => showScreen('screen-home'), 1600);
  } else {
    showToast('ℹ️ Los hábitos seleccionados ya están en progreso');
  }
}

// ── Verificar hábitos vencidos al cargar ──────────
function verificarHabitosVencidos() {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  HABITOS_LISTA.forEach(h => {
    const activo = loadData('habito_activo_' + h.id, null);
    if (!activo) return;
    const fin = new Date(activo.fin); fin.setHours(0,0,0,0);
    if (hoy >= fin) {
      // Mostrar pantalla de revisión
      mostrarRevisionHabito(activo);
    }
  });
}

function mostrarRevisionHabito(habito) {
  document.getElementById('revision-nombre').textContent = habito.label;
  document.getElementById('revision-puntos').textContent = `+${habito.puntos} puntos`;
  document.getElementById('btn-logre').onclick   = () => habitoLogrado(habito);
  document.getElementById('btn-nologre').onclick = () => habitoNoLogrado(habito);
  showScreen('screen-revision-habito');
}

function habitoLogrado(habito) {
  puntos += habito.puntos;
  saveData('puntos', puntos);
  saveData('habito_activo_' + habito.id, null);

  const completados = loadData('habitos_completados', []);
  completados.unshift({ label: habito.label, fecha: new Date().toLocaleDateString('es-MX'), puntos: habito.puntos });
  saveData('habitos_completados', completados);

  showScreen('screen-habito-exito');
  document.getElementById('exito-puntos').textContent = `+${habito.puntos} puntos ganados 🎉`;
  document.getElementById('exito-total').textContent  = `Total: ${puntos} pts`;
  refreshHome();
}

function habitoNoLogrado(habito) {
  saveData('habito_activo_' + habito.id, null);
  showScreen('screen-habito-fallo');
}

// ════════════════════════════════════════════════
//  FAQ
// ════════════════════════════════════════════════
function toggleFaq(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
refreshHome();
renderHabitos();
verificarHabitosVencidos();
