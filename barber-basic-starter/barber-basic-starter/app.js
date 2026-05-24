// app.js — demo básica con almacenamiento en localStorage
const SERVICES = [
  { id: "corte", nombre: "Corte clásico", duracionMin: 30, precio: 25000 },
  { id: "barba", nombre: "Afeitado/Barba", duracionMin: 20, precio: 15000 },
  { id: "combo", nombre: "Combo Corte + Barba", duracionMin: 50, precio: 38000 },
];

const $listaServicios = document.getElementById("lista-servicios");
const $serviceSelect = document.getElementById("serviceId");
const $form = document.getElementById("form-reserva");
const $msg = document.getElementById("msg");
const $tabla = document.getElementById("tabla-reservas").querySelector("tbody");
const $btnExport = document.getElementById("btn-export");
const $btnClear = document.getElementById("btn-clear");

function money(cents){ return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(cents); }

// Render servicios (catálogo)
function renderServicios(){
  $listaServicios.innerHTML = SERVICES.map(s => `
    <li>
      <h4>${s.nombre}</h4>
      <p>${s.duracionMin} min</p>
      <p class="price">${money(s.precio)}</p>
      <a class="btn btn-outline" href="#reservar" data-service="${s.id}">Reservar</a>
    </li>
  `).join("");

  $serviceSelect.innerHTML = SERVICES.map(s => `<option value="${s.id}">${s.nombre} — ${s.duracionMin} min</option>`).join("");

  // Prefill servicio al hacer click en cards
  $listaServicios.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-service]");
    if(!a) return;
    e.preventDefault();
    const id = a.dataset.service;
    $serviceSelect.value = id;
    window.location.hash = "#reservar";
  });
}

// Local "DB"
function loadDB(){
  const raw = localStorage.getItem("reservas");
  return raw ? JSON.parse(raw) : [];
}
function saveDB(reservas){
  localStorage.setItem("reservas", JSON.stringify(reservas));
}

function sameStart(a,b){ return a.fecha === b.fecha && a.hora === b.hora; }

function hasOverlap(nueva, reservas){
  // Rechaza si ya existe una reserva a la misma hora exacta.
  return reservas.some(r => sameStart(r, nueva));
}

function renderTabla(){
  const reservas = loadDB();
  $tabla.innerHTML = reservas.map(r => {
    const s = SERVICES.find(x => x.id === r.serviceId);
    return `<tr>
      <td>${s?.nombre ?? r.serviceId}</td>
      <td>${r.name}</td>
      <td>${r.fecha}</td>
      <td>${r.hora}</td>
      <td>${s?.duracionMin ?? "?"} min</td>
      <td>${r.phone}</td>
      <td>${r.email}</td>
    </tr>`;
  }).join("");
}

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    serviceId: $serviceSelect.value,
    fecha: document.getElementById("date").value,
    hora: document.getElementById("time").value,
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    createdAt: new Date().toISOString()
  };

  // Validación simple
  if(!data.fecha || !data.hora) return show("Selecciona fecha y hora", "error");
  if(!/\S+@\S+\.\S+/.test(data.email)) return show("Email inválido", "error");
  if(data.phone.length < 7) return show("Teléfono inválido", "error");

  const reservas = loadDB();
  if(hasOverlap(data, reservas)) return show("Ya existe una reserva para esa hora. Elige otra.", "error");

  reservas.push(data);
  saveDB(reservas);
  renderTabla();
  $form.reset();
  show("¡Reserva creada! (Guardada localmente). Más adelante lo conectaremos a una base de datos real 😉", "ok");
});

function show(text, type="ok"){
  $msg.textContent = text;
  $msg.style.color = (type==="ok") ? "#22c55e" : "#ef4444";
  setTimeout(()=>{ $msg.textContent = ""; }, 4000);
}

// Exportar / borrar
$btnExport.addEventListener("click", () => {
  const data = loadDB();
  const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "reservas.json";
  a.click();
  URL.revokeObjectURL(url);
});
$btnClear.addEventListener("click", () => {
  if(confirm("¿Borrar todas las reservas locales?")) {
    localStorage.removeItem("reservas");
    renderTabla();
  }
});

// Init
renderServicios();
renderTabla();
