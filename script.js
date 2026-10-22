// Base de datos de productos
const productos = {
    "P001": { nombre: "Pupusa", precio: 0.75 },
    "P002": { nombre: "Hamburguesa", precio: 2.50 },
    "P003": { nombre: "Pizza", precio: 2.00 },
    "P004": { nombre: "Tacos", precio: 1.50 },
    "P005": { nombre: "Jugo", precio: 1.00 },
    "P006": { nombre: "Agua", precio: 0.75 }
};

// Función auxiliar para obtener o inicializar los pedidos guardados
function obtenerPedidosGuardados() {
    let guardados = localStorage.getItem("pedidos_cafeteria");
    return guardados ? JSON.parse(guardados) : [];
}

// Selección de producto desde las tarjetas
function seleccionarProducto(codigo) {
    const select = document.getElementById("selectProducto");
    select.value = codigo;
    document.getElementById("formulario-seccion").scrollIntoView({ behavior: 'smooth' });
}

// Evento del formulario de pedido
document.getElementById("formPedido").addEventListener("submit", function (event) {
    event.preventDefault();

    let cliente = document.getElementById("txtCliente").value;
    let codigoProducto = document.getElementById("selectProducto").value;
    let cantidad = parseInt(document.getElementById("txtCantidad").value);
    let metodoPagoElem = document.querySelector('input[name="pago"]:checked');
    let metodoPago = metodoPagoElem ? metodoPagoElem.value : "Efectivo";

    if (!codigoProducto) {
        alert("Por favor selecciona un producto.");
        return;
    }

    let productoObj = productos[codigoProducto];
    let precioUnitario = productoObj.precio;
    let subtotal = precioUnitario * cantidad;

    // Regla de promoción: 10% de descuento si cantidad >= 5[cite: 2]
    let descuento = 0;
    if (cantidad >= 5) {
        descuento = subtotal * 0.10;
    }

    let total = subtotal - descuento;

    // Obtener lista actual para calcular el código correlativo (ej. 001, 002...)
    let listaPedidos = obtenerPedidosGuardados();
    let numeroCorrelativo = String(listaPedidos.length + 1).padStart(3, '0');

    // Construir la línea en formato TXT solicitada[cite: 2]
    // Formato: 001|Cliente|Producto|Cantidad|Precio|Subtotal|Descuento|Total|Método
    let lineaTxt = `${numeroCorrelativo}|${cliente}|${productoObj.nombre}|${cantidad}|${precioUnitario.toFixed(2)}|${subtotal.toFixed(2)}|${descuento.toFixed(2)}|${total.toFixed(2)}|${metodoPago}`;

    // Guardar en almacenamiento local
    listaPedidos.push({
        codigo: numeroCorrelativo,
        cliente: cliente,
        producto: productoObj.nombre,
        cantidad: cantidad,
        precio: precioUnitario,
        subtotal: subtotal,
        descuento: descuento,
        total: total,
        pago: metodoPago,
        lineaFormato: lineaTxt
    });

    localStorage.setItem("pedidos_cafeteria", JSON.stringify(listaPedidos));

    // Mostrar el resultado actual en pantalla[cite: 3]
    mostrarResultado(cliente, productoObj.nombre, cantidad, subtotal, descuento, total, metodoPago);
    actualizarResumenVentas();

    document.getElementById("resumen-pedido").scrollIntoView({ behavior: 'smooth' });
});

function mostrarResultado(cliente, producto, cantidad, subtotal, descuento, total, pago) {
    let contenedor = document.getElementById("resumenPedido");
    contenedor.innerHTML = `
        <div class="ticket">
            <h3>PEDIDO REGISTRADO</h3>
            <div class="ticket-row"><strong>Cliente:</strong> <span>${cliente}</span></div>
            <div class="ticket-row"><strong>Producto:</strong> <span>${producto}</span></div>
            <div class="ticket-row"><strong>Cantidad:</strong> <span>${cantidad}</span></div>
            <div class="ticket-row"><strong>Subtotal:</strong> <span>$${subtotal.toFixed(2)}</span></div>
            <div class="ticket-row"><strong>Descuento:</strong> <span>$${descuento.toFixed(2)}</span></div>
            <div class="ticket-row ticket-total"><strong>TOTAL:</strong> <span>$${total.toFixed(2)}</span></div>
            <div class="ticket-row"><strong>Pago:</strong> <span>${pago}</span></div>
        </div>
    `;
}

// Consultar pedidos.txt simulado[cite: 3]
document.getElementById("btn-cargar-txt").addEventListener("click", function () {
    let listaPedidos = obtenerPedidosGuardados();
    let contenedorTxt = document.getElementById("contenedor-txt-view");

    if (listaPedidos.length === 0) {
        contenedorTxt.innerHTML = `<p class="placeholder-text">No hay registros en pedidos.txt todavía.</p>`;
        return;
    }

    let htmlContenido = `
        <div style="font-family: monospace; font-size: 0.9rem;">
            <p style="font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Código | Cliente | Producto | Cantidad | Total</p>
    `;

    listaPedidos.forEach(p => {
        htmlContenido += `<div style="padding: 4px 0; border-bottom: 1px dashed #eee;">${p.codigo} | ${p.cliente} | ${p.producto} (${p.cantidad}) | $${p.total.toFixed(2)}</div>`;
    });

    htmlContenido += `</div>`;
    contenedorTxt.innerHTML = htmlContenido;
});

// Reto adicional: Cálculo de ventas totales[cite: 4]
function actualizarResumenVentas() {
    let listaPedidos = obtenerPedidosGuardados();
    let totalVentas = listaPedidos.reduce((acc, curr) => acc + curr.total, 0);

    document.getElementById("lbl-total-pedidos").innerText = listaPedidos.length;
    document.getElementById("lbl-total-ventas").innerText = `$${totalVentas.toFixed(2)}`;
}

// Función para limpiar todo incluyendo la memoria simulada
function limpiarPedido() {
    if (confirm("¿Deseas limpiar el formulario y borrar el registro de pedidos?")) {
        localStorage.removeItem("pedidos_cafeteria");
        document.getElementById("formPedido").reset();
        document.getElementById("resumenPedido").innerHTML = `<p class="placeholder-text">Aún no has realizado ningún pedido.</p>`;
        document.getElementById("contenedor-txt-view").innerHTML = `<p class="placeholder-text">Presiona el botón para leer los registros guardados.</p>`;
        actualizarResumenVentas();
    }
}

// Inicializar el resumen de ventas al cargar la página
window.onload = function () {
    actualizarResumenVentas();
};
// Descargar pedidos.txt
document.getElementById("btn-descargar-txt").addEventListener("click", function () {
    let listaPedidos = obtenerPedidosGuardados();

    if (listaPedidos.length === 0) {
        alert("No hay pedidos para descargar.");
        return;
    }

    // Construir el contenido del archivo TXT
    let contenidoTxt = "CÓDIGO | CLIENTE | PRODUCTO | CANTIDAD | PRECIO | SUBTOTAL | DESCUENTO | TOTAL | MÉTODO\n";
    contenidoTxt += "="
    "\n";
    listaPedidos.forEach(p => {
        contenidoTxt += `${p.codigo} | ${p.cliente} | ${p.producto} | ${p.cantidad} | $${p.precio.toFixed(2)} | $${p.subtotal.toFixed(2)} | $${p.descuento.toFixed(2)} | $${p.total.toFixed(2)} | ${p.pago}\n`;
    });

    // Crear un Blob con el contenido y generar el enlace de descarga
    const blob = new Blob([contenidoTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pedidos.txt";
    document.body.appendChild(a);
    a.click();

    // Limpiar el enlace y la URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("¡pedidos.txt descargado exitosamente!");
});