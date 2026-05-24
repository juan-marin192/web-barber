/*************************************************************
 * ENUMERACIONES BÁSICAS (Estados y tipos del sistema)
 *************************************************************/
const ROLES = {
  CLIENTE: 'CLIENTE',
  BARBERO: 'BARBERO',
  ADMIN:   'ADMIN'
};

const ESTADO_CITA = {
  PROGRAMADA: 'PROGRAMADA',
  COMPLETADA: 'COMPLETADA',
  CANCELADA:  'CANCELADA',
  REAGENDADA: 'REAGENDADA',
  PENDIENTE_PAGO: 'PENDIENTE_PAGO'
};

const ESTADO_PAGO = {
  PENDIENTE: 'PENDIENTE',
  APROBADO:  'APROBADO',
  RECHAZADO: 'RECHAZADO'
};

const ESTADO_SLOT = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADO:    'OCUPADO',
  ALMUERZO:   'ALMUERZO',
  CERRADO:    'CERRADO'
};


/*************************************************************
 * USUARIO BASE
 * (soporta Cliente, Barbero, Admin según rol)
 * Relacionado con HU-001, HU-002, HU-017, RF-012, RF-013
 *************************************************************/
class Usuario {
  constructor({
    id,
    nombreCompleto,
    email,
    telefono,
    rol = ROLES.CLIENTE,
    fechaRegistro = new Date(),
    activo = true
  }) {
    this.id = id;
    this.nombreCompleto = nombreCompleto;
    this.email = email;
    this.telefono = telefono;
    this.rol = rol;
    this.fechaRegistro = fechaRegistro;
    this.activo = activo;
  }
}


/*************************************************************
 * CLIENTE
 * (extiende Usuario y agrega puntos / preferencias)
 * HU-001, HU-002, HU-005, RF-016
 *************************************************************/
class Cliente extends Usuario {
  constructor({
    id,
    nombreCompleto,
    email,
    telefono,
    puntos = 0,
    tipoCorteFavorito = '',
    barberoFavoritoId = null,
    recibeNotificaciones = true
  }) {
    super({
      id,
      nombreCompleto,
      email,
      telefono,
      rol: ROLES.CLIENTE
    });

    this.puntos = puntos;
    this.tipoCorteFavorito = tipoCorteFavorito;
    this.barberoFavoritoId = barberoFavoritoId;
    this.recibeNotificaciones = recibeNotificaciones;
  }

  agregarPuntos(cantidad) {
    this.puntos += cantidad;
  }
}


/*************************************************************
 * BARBERO / ESTILISTA
 * (perfil profesional)
 * HU-017, HU-011, RF-018
 *************************************************************/
class Barbero extends Usuario {
  constructor({
    id,
    nombreCompleto,
    email,
    telefono,
    especialidades = [],
    experienciaAnos = 0,
    calificacionPromedio = 0,
    totalResenas = 0
  }) {
    super({
      id,
      nombreCompleto,
      email,
      telefono,
      rol: ROLES.BARBERO
    });

    this.especialidades = especialidades; // ej: ["Fade", "Barba"]
    this.experienciaAnos = experienciaAnos;
    this.calificacionPromedio = calificacionPromedio;
    this.totalResenas = totalResenas;
  }

  actualizarRating(nuevaCalificacion) {
    // promedio simple incremental
    this.calificacionPromedio =
      (this.calificacionPromedio * this.totalResenas + nuevaCalificacion) /
      (this.totalResenas + 1);
    this.totalResenas += 1;
  }
}


/*************************************************************
 * SERVICIO DE BARBERÍA
 * HU-009, HU-019, RF-006, RF-020
 *************************************************************/
class Servicio {
  constructor({
    id,
    nombre,
    descripcion = '',
    duracionMinutos,
    precio,
    activo = true,
    permiteCombinar = true,
    fechaVigenciaHasta = null
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.duracionMinutos = duracionMinutos;
    this.precio = precio;
    this.activo = activo;
    this.permiteCombinar = permiteCombinar;
    this.fechaVigenciaHasta = fechaVigenciaHasta;
  }
}


/*************************************************************
 * CITA
 * HU-003, HU-004, HU-018, HU-019
 * RF-014, RF-015, RF-019, RF-020
 *************************************************************/
class Cita {
  constructor({
    id,
    clienteId,
    barberoId,
    servicios = [],          // array de Servicio o ids
    fechaHoraInicio,        // Date
    duracionTotalMin = 0,
    estado = ESTADO_CITA.PROGRAMADA,
    metodoPago = null,
    total = 0
  }) {
    this.id = id;
    this.clienteId = clienteId;
    this.barberoId = barberoId;
    this.servicios = servicios;
    this.fechaHoraInicio = fechaHoraInicio;
    this.duracionTotalMin = duracionTotalMin;
    this.estado = estado;
    this.metodoPago = metodoPago;
    this.total = total;
  }

  calcularTotal() {
    this.total = this.servicios.reduce(
      (acc, servicio) => acc + servicio.precio,
      0
    );
    this.duracionTotalMin = this.servicios.reduce(
      (acc, servicio) => acc + servicio.duracionMinutos,
      0
    );
  }

  marcarCompletada() {
    this.estado = ESTADO_CITA.COMPLETADA;
  }

  cancelar() {
    this.estado = ESTADO_CITA.CANCELADA;
  }

  reagendar(nuevaFechaHora) {
    this.fechaHoraInicio = nuevaFechaHora;
    this.estado = ESTADO_CITA.REAGENDADA;
  }
}


/*************************************************************
 * SLOT / BLOQUE DE DISPONIBILIDAD
 * HU-008, RF-005
 *************************************************************/
class SlotDisponibilidad {
  constructor({
    barberoId,
    fecha,           // Date SOLO fecha
    horaInicio,      // "09:00"
    horaFin,         // "09:30"
    estado = ESTADO_SLOT.DISPONIBLE
  }) {
    this.barberoId = barberoId;
    this.fecha = fecha;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.estado = estado;
  }

  estaLibre() {
    return this.estado === ESTADO_SLOT.DISPONIBLE;
  }
}


/*************************************************************
 * PUNTOS / RECOMPENSAS
 * HU-005, RF-016
 *************************************************************/
class MovimientoPuntos {
  constructor({ fecha = new Date(), descripcion, puntos }) {
    this.fecha = fecha;
    this.descripcion = descripcion;
    this.puntos = puntos; // + gana, - canje
  }
}

class RecompensasCliente {
  constructor({ clienteId, puntosTotales = 0, movimientos = [] }) {
    this.clienteId = clienteId;
    this.puntosTotales = puntosTotales;
    this.movimientos = movimientos;
  }

  registrarMovimiento(descripcion, puntos) {
    this.movimientos.push(
      new MovimientoPuntos({ descripcion, puntos })
    );
    this.puntosTotales += puntos;
  }
}


/*************************************************************
 * PROMOCIONES / DESCUENTOS
 * HU-014, RF-010
 *************************************************************/
class Promocion {
  constructor({
    id,
    titulo,
    descripcion,
    porcentajeDescuento,
    fechaInicio,
    fechaFin,
    serviciosIds = [],
    activa = true
  }) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.porcentajeDescuento = porcentajeDescuento; // ej: 20 = 20%
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.serviciosIds = serviciosIds;
    this.activa = activa;
  }

  aplicaHoy() {
    const hoy = new Date();
    return (
      this.activa &&
      hoy >= this.fechaInicio &&
      hoy <= this.fechaFin
    );
  }

  aplicarA(total) {
    if (!this.aplicaHoy()) return total;
    return total - (total * this.porcentajeDescuento) / 100;
  }
}


/*************************************************************
 * PAGO
 * HU-013, HU-020, RF-009, RF-021
 *************************************************************/
class Pago {
  constructor({
    id,
    citaId,
    monto,
    metodo,        // "PSE", "TARJETA", "EFECTIVO", etc.
    estado = ESTADO_PAGO.PENDIENTE,
    fecha = new Date()
  }) {
    this.id = id;
    this.citaId = citaId;
    this.monto = monto;
    this.metodo = metodo;
    this.estado = estado;
    this.fecha = fecha;
  }

  marcarAprobado() {
    this.estado = ESTADO_PAGO.APROBADO;
  }

  marcarRechazado() {
    this.estado = ESTADO_PAGO.RECHAZADO;
  }
}


/*************************************************************
 * NOTIFICACIÓN
 * HU-007, HU-015, RF-011
 *************************************************************/
class Notificacion {
  constructor({
    id,
    clienteId,
    tipo,        // "RECORDATORIO", "PAGO_APROBADO", etc.
    canal,       // "EMAIL", "SMS", "WHATSAPP"
    mensaje,
    fechaEnvio = new Date(),
    leida = false
  }) {
    this.id = id;
    this.clienteId = clienteId;
    this.tipo = tipo;
    this.canal = canal;
    this.mensaje = mensaje;
    this.fechaEnvio = fechaEnvio;
    this.leida = leida;
  }

  marcarLeida() {
    this.leida = true;
  }
}


/*************************************************************
 * VALORACIÓN
 * HU-011
 *************************************************************/
class Valoracion {
  constructor({
    id,
    citaId,
    clienteId,
    barberoId,
    estrellas,    // 1..5
    comentario = '',
    fecha = new Date()
  }) {
    this.id = id;
    this.citaId = citaId;
    this.clienteId = clienteId;
    this.barberoId = barberoId;
    this.estrellas = estrellas;
    this.comentario = comentario;
    this.fecha = fecha;
  }
}