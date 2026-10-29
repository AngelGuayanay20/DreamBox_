const API_URL = "https://dreambox.onrender.com";

function fetchConTimeout(url, opciones = {}, ms = 60000) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), ms);

    return fetch(url, { ...opciones, signal: controlador.signal })
        .finally(() => clearTimeout(temporizador));
}

/* =====================================================
   GAMEZONE - PRODUCTOS (CATÁLOGO)
===================================================== */

let productosCache = [];
let productosError = false;

async function cargarProductosDesdeAPI() {
    try {
        const respuesta = await fetchConTimeout(API_URL + "/api/productos");
        if (!respuesta.ok) throw new Error("Respuesta no válida");
        productosCache = await respuesta.json();
        productosError = false;
    } catch (error) {
        productosCache = [];
        productosError = true;
    }
    return !productosError;
}

function obtenerProductos() {
    return productosCache;
}

async function apiProductos(metodo, id, cuerpo) {
    try {
        const respuesta = await fetchConTimeout(
            API_URL + "/api/productos" + (id ? "/" + id : ""),
            {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: cuerpo ? JSON.stringify(cuerpo) : undefined
            }
        );

        const data = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            await mostrarModal(data.error || "No se pudo completar la acción.");
            return false;
        }

        await cargarProductosDesdeAPI();
        cargarAdmin();
        cargarEstadisticasAdmin();
        return true;

    } catch (error) {
        await mostrarModal("No se pudo conectar con el servidor. Puede estar despertando; inténtalo de nuevo en unos segundos.");
        return false;
    }
}

/* =====================================================
   GAMEZONE - SISTEMA DE USUARIOS
===================================================== */

function obtenerUsuarioActual() {

    return JSON.parse(
        localStorage.getItem("usuarioActual") || "null"
    );

}

async function registrarUsuario(event) {

    event.preventDefault();

    const nombre =
        document.getElementById("registro-nombre").value.trim();

    const email =
        document.getElementById("registro-email").value.trim().toLowerCase();

    const password =
        document.getElementById("registro-password").value;

    const boton = event.target.querySelector("button[type='submit']");
    boton.disabled = true;
    boton.textContent = "Creando cuenta...";

    let respuesta;

    try {
        respuesta = await fetchConTimeout(API_URL + "/api/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });
    } catch (error) {
        boton.disabled = false;
        boton.textContent = "Crear cuenta";
        await mostrarModal(
            "No se pudo conectar con el servidor. Puede estar despertando; espera unos segundos e inténtalo de nuevo."
        );
        return;
    }

    boton.disabled = false;
    boton.textContent = "Crear cuenta";

    let data = null;
    try {
        data = await respuesta.json();
    } catch (error) {
        await mostrarModal("El servidor respondió algo inesperado. Inténtalo de nuevo en unos segundos.");
        return;
    }

    if (!respuesta.ok) {
        await mostrarModal(data.error || "No se pudo crear la cuenta.");
        return;
    }

    await mostrarModal("Cuenta creada correctamente. Ahora inicia sesión.");

    window.location.href = "login.html";
}

async function iniciarSesion(event) {

    event.preventDefault();

    const email =
        document.getElementById("login-email").value.trim().toLowerCase();

    const password =
        document.getElementById("login-password").value;

    const boton = event.target.querySelector("button[type='submit']");
    boton.disabled = true;
    boton.textContent = "Conectando...";

    let respuesta;

    try {
        respuesta = await fetchConTimeout(API_URL + "/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
    } catch (error) {
        boton.disabled = false;
        boton.textContent = "Iniciar sesión";
        await mostrarModal(
            "No se pudo conectar con el servidor. Puede estar despertando; espera unos segundos e inténtalo de nuevo."
        );
        return;
    }

    boton.disabled = false;
    boton.textContent = "Iniciar sesión";

    let data = null;
    try {
        data = await respuesta.json();
    } catch (error) {
        await mostrarModal("El servidor respondió algo inesperado. Inténtalo de nuevo en unos segundos.");
        return;
    }

    if (!respuesta.ok) {
        await mostrarModal(data.error || "Correo o contraseña incorrectos.");
        return;
    }

    localStorage.setItem("token", data.token);

    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));

    window.location.href =
        data.usuario.rol === "admin" ? "admin.html" : "index.html";
}

async function verificarAdmin() {

    const token = localStorage.getItem("token");
    let esAdmin = false;

    if (token) {
        try {
            const respuesta = await fetchConTimeout(API_URL + "/api/yo", {
                headers: { "Authorization": "Bearer " + token }
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                esAdmin = data.usuario.rol === "admin";

                if (esAdmin) {
                    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));
                }
            }
        } catch (error) {
            esAdmin = false;
        }
    }

    if (!esAdmin) {
        await mostrarModal("No tienes permisos para acceder al panel de administrador.");
        window.location.href = "index.html";
        return false;
    }

    return true;
}


/* =====================================================
   GAMEZONE - CARRITO
===================================================== */

function obtenerCarrito() {

    return JSON.parse(
        localStorage.getItem("carrito") || "[]"
    );

}


function guardarCarrito(carrito) {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

}


function agregarCarrito(idONombre, precio, imagen) {

    const carrito = obtenerCarrito();

    let idItem;
    let nombreItem;
    let precioItem;
    let imagenItem;

    if (precio !== undefined) {

        // Producto estático llamado como agregarCarrito(nombre, precio, imagen)
        idItem = "static-" + idONombre;
        nombreItem = idONombre;
        precioItem = precio;
        imagenItem = imagen || "";

    } else {

        // Producto del catálogo llamado como agregarCarrito(id)
        const producto =
            obtenerProductos().find(p => p.id === idONombre);

        if (!producto) return;

        idItem = producto.id;
        nombreItem = producto.nombre;
        precioItem = producto.precio;
        imagenItem = producto.imagen;

    }

    const item = carrito.find(p => String(p.id) === String(idItem));

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            id: idItem,
            nombre: nombreItem,
            precio: precioItem,
            imagen: imagenItem,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);

    actualizarContadorCarrito();

    mostrarCarrito();

    abrirCarrito();

}


function eliminarDelCarrito(id) {

    let carrito = obtenerCarrito();

    carrito = carrito.filter(
        p => String(p.id) !== String(id)
    );

    guardarCarrito(carrito);

    actualizarContadorCarrito();

    mostrarCarrito();

}


function actualizarContadorCarrito() {

    const carrito = obtenerCarrito();

    const total = carrito.reduce(
        (suma, item) => suma + item.cantidad,
        0
    );

    document
        .querySelectorAll("#contador-carrito")
        .forEach(el => el.textContent = total);

}


function mostrarCarrito() {

    const contenedor =
        document.getElementById("productos-carrito");

    const totalEl =
        document.getElementById("total-carrito");

    if (!contenedor) return;

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {

        contenedor.innerHTML =
            `<p class="cart-empty">Tu carrito está vacío.</p>`;

        if (totalEl) totalEl.textContent = "$0.00";

        return;
    }

    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach(item => {

        total += item.precio * item.cantidad;

        contenedor.innerHTML += `
            <div class="cart-item">
                <img src="${item.imagen || ''}" alt="${item.nombre}">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <span class="cart-item-price">$${(item.precio * item.cantidad).toFixed(2)}</span>
                    <div class="quantity">
                        <button onclick="cambiarCantidadCarrito('${item.id}', -1)">−</button>
                        <span>${item.cantidad}</span>
                        <button onclick="cambiarCantidadCarrito('${item.id}', 1)">+</button>
                    </div>
                    <button class="remove-button" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
                </div>
            </div>
        `;

    });

    if (totalEl) totalEl.textContent = "$" + total.toFixed(2);

}


function cambiarCantidadCarrito(id, delta) {

    let carrito = obtenerCarrito();

    const item = carrito.find(p => String(p.id) === String(id));

    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {

        carrito = carrito.filter(p => String(p.id) !== String(id));

    }

    guardarCarrito(carrito);

    actualizarContadorCarrito();

    mostrarCarrito();

}


function abrirCarrito() {

    const overlay = document.getElementById("carrito-overlay");

    if (overlay) overlay.classList.add("show");

}


function cerrarCarrito() {

    const overlay = document.getElementById("carrito-overlay");

    if (overlay) overlay.classList.remove("show");

}

function mostrarModal(mensaje, esConfirmacion = false) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("custom-modal");
        const texto = document.getElementById("custom-modal-mensaje");
        const acciones = document.getElementById("custom-modal-actions");

        if (!overlay) {
            // Plan de respaldo por si el HTML no cargó el modal todavía
            if (esConfirmacion) {
                resolve(confirm(mensaje));
            } else {
                alert(mensaje);
                resolve(true);
            }
            return;
        }

        texto.textContent = mensaje;
        acciones.innerHTML = "";

        if (esConfirmacion) {
            const btnCancelar = document.createElement("button");
            btnCancelar.textContent = "Cancelar";
            btnCancelar.className = "btn-modal-cancelar";
            btnCancelar.onclick = () => {
                overlay.style.display = "none";
                resolve(false);
            };

            const btnAceptar = document.createElement("button");
            btnAceptar.textContent = "Aceptar";
            btnAceptar.className = "btn-modal-aceptar";
            btnAceptar.onclick = () => {
                overlay.style.display = "none";
                resolve(true);
            };

            acciones.appendChild(btnCancelar);
            acciones.appendChild(btnAceptar);
        } else {
            const btnAceptar = document.createElement("button");
            btnAceptar.textContent = "Aceptar";
            btnAceptar.className = "btn-modal-aceptar";
            btnAceptar.onclick = () => {
                overlay.style.display = "none";
                resolve(true);
            };
            acciones.appendChild(btnAceptar);
        }

        overlay.style.display = "flex";
    });
}

function mostrarOcultarPassword(idInput, boton) {

    const input = document.getElementById(idInput);

    const estabaVisible = input.type === "text";

    input.type = estabaVisible ? "password" : "text";

    boton.textContent = estabaVisible ? "👁️" : "🙈";

    boton.setAttribute(
        "aria-label",
        estabaVisible ? "Mostrar contraseña" : "Ocultar contraseña"
    );

}

/* =====================================================
   GAMEZONE - DETALLE DE PRODUCTO
===================================================== */

function cargarDetalle() {

    const contenedor =
        document.getElementById("detalle-producto");

    if (!contenedor) return;

    const params = new URLSearchParams(window.location.search);

    const id = Number(params.get("id"));

    const producto =
        obtenerProductos().find(p => p.id === id);

    if (!producto) {

        contenedor.innerHTML =
            `<p>Videojuego no encontrado.</p>`;

        return;
    }

    contenedor.innerHTML = `

        <img id="detail-image" src="${producto.imagen}" alt="${producto.nombre}">

        <div class="detail-info">

            <span class="platform-tag">
                ${producto.plataforma.join(" / ")}
            </span>

            <h1>${producto.nombre}</h1>

            <p class="genero">${producto.genero}</p>

            <p class="descripcion">${producto.descripcion}</p>

            <p class="price">$${Number(producto.precio).toFixed(2)}</p>

            <p class="product-stock">
                ${producto.stock > 0
            ? "📦 Stock: " + producto.stock
            : "❌ Agotado"
        }
            </p>

            ${producto.stock > 0
            ? `<button class="buy-button" onclick="agregarCarrito(${producto.id})">🛒 Agregar al carrito</button>`
            : `<button class="buy-button disabled" disabled>Agotado</button>`
        }

        </div>

    `;

}


function abrirDetalle(id) {

    window.location.href = "detalle.html?id=" + id;

}


/* =====================================================
   GAMEZONE - FILTROS DEL CATÁLOGO
===================================================== */

let plataformaActual = "Todos";


function aplicarFiltros() {

    const buscador = document.getElementById("buscador");

    const texto = buscador
        ? buscador.value.toLowerCase().trim()
        : "";

    document.querySelectorAll(".catalog-product").forEach(card => {

        const coincideNombre =
            card.dataset.nombre.toLowerCase().includes(texto);

        const coincidePlataforma =
            plataformaActual === "Todos" ||
            card.dataset.plataforma.split(" ").includes(plataformaActual);

        card.style.display =
            (coincideNombre && coincidePlataforma) ? "" : "none";

    });

}


function filtrarProductos() {

    aplicarFiltros();

}


function filtrarPlataforma(plataforma, boton) {

    plataformaActual = plataforma;

    document.querySelectorAll(".filter").forEach(
        btn => btn.classList.remove("active")
    );

    if (boton) boton.classList.add("active");

    aplicarFiltros();

}


/* =====================================================
   GAMEZONE - ADMIN: PRODUCTOS
===================================================== */

let productoEditandoId = null;

function cargarAdmin() {

    const tabla =
        document.getElementById("tabla-productos");

    if (!tabla) return;

    const productos =
        obtenerProductos()
            .slice()
            .sort((a, b) => a.id - b.id);

    tabla.innerHTML = "";

    if (productos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="6" class="empty-table">No hay videojuegos${productosError ? " (no se pudo conectar con el servidor)" : ""}.</td></tr>`;
        return;
    }

    productos.forEach(producto => {

        tabla.innerHTML += `
            <tr>
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.plataforma.join(", ")}</td>
                <td>$${Number(producto.precio).toFixed(2)}</td>
                <td>
                    <input
                        type="number"
                        min="0"
                        class="stock-input"
                        value="${producto.stock}"
                        onchange="actualizarStockAdmin(${producto.id}, this.value)"
                    >
                </td>
                <td>
                  <button class="edit-button" onclick="editarProductoAdmin(${producto.id})">Editar</button>
                  <button class="delete-button" onclick="eliminarProductoAdmin(${producto.id})">Eliminar</button>
                </td>
            </tr>
        `;

    });

}

async function actualizarStockAdmin(id, nuevoValor) {

    const valor = parseInt(nuevoValor);

    if (isNaN(valor) || valor < 0) {
        await mostrarModal("Ingresa un número válido (0 o mayor).");
        cargarAdmin();
        return;
    }

    const ok = await apiProductos("PUT", id, { stock: valor });

    if (!ok) cargarAdmin();
}

async function eliminarProductoAdmin(id) {

    const confirmar = await mostrarModal("¿Eliminar este videojuego?", true);
    if (!confirmar) return;

    const ok = await apiProductos("DELETE", id);

    if (ok && productoEditandoId === id) cancelarEdicionAdmin();
}

async function agregarProductoAdmin(event) {

    event.preventDefault();

    const formulario = event.target;

    const datos = {
        nombre: document.getElementById("admin-nombre").value.trim(),
        precio: parseFloat(document.getElementById("admin-precio").value),
        stock: parseInt(document.getElementById("admin-stock").value),
        plataforma: document.getElementById("admin-plataforma").value
            .split(",")
            .map(p => p.trim())
            .filter(Boolean),
        genero: document.getElementById("admin-genero").value.trim(),
        imagen: document.getElementById("admin-imagen").value.trim(),
        descripcion: document.getElementById("admin-descripcion").value.trim()
    };

    if (productoEditandoId !== null) {

        const ok = await apiProductos("PUT", productoEditandoId, datos);
        if (ok) cancelarEdicionAdmin();

    } else {

        const ok = await apiProductos("POST", null, datos);
        if (ok) formulario.reset();

    }

}

function editarProductoAdmin(id) {

    const producto = obtenerProductos().find(p => p.id === id);

    if (!producto) return;

    productoEditandoId = id;

    document.getElementById("admin-nombre").value = producto.nombre;
    document.getElementById("admin-precio").value = producto.precio;
    document.getElementById("admin-stock").value = producto.stock;
    document.getElementById("admin-plataforma").value = producto.plataforma.join(", ");
    document.getElementById("admin-genero").value = producto.genero;
    document.getElementById("admin-imagen").value = producto.imagen;
    document.getElementById("admin-descripcion").value = producto.descripcion;

    document.getElementById("admin-submit-btn").textContent = "Guardar cambios";
    document.getElementById("admin-cancel-btn").style.display = "block";

    document.querySelector(".admin-form")
        .scrollIntoView({ behavior: "smooth", block: "center" });

}


function cancelarEdicionAdmin() {

    productoEditandoId = null;

    document.querySelector(".admin-form").reset();

    document.getElementById("admin-submit-btn").textContent = "Agregar videojuego";
    document.getElementById("admin-cancel-btn").style.display = "none";

}


let usuariosCache = [];
let ventasCache = [];

async function pedirAlServidorAdmin(ruta) {

    try {
        const respuesta = await fetchConTimeout(API_URL + ruta, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            return { error: "No autorizado. Vuelve a iniciar sesión." };
        }

        if (!respuesta.ok) return { error: "Respuesta no válida del servidor." };

        return { datos: await respuesta.json() };

    } catch (error) {
        return { error: "No se pudo conectar con el servidor." };
    }
}


async function cargarUsuariosAdmin() {

    const tabla = document.getElementById("tabla-usuarios");

    if (!tabla) return;

    const { datos, error } = await pedirAlServidorAdmin("/api/usuarios");

    usuariosCache = datos || [];

    if (error || usuariosCache.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="3" class="empty-table">
                    ${error || "Todavía no hay usuarios registrados."}
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = usuariosCache.map(usuario => `
        <tr>
            <td>${escaparHTML(usuario.nombre)}</td>
            <td>${escaparHTML(usuario.email)}</td>
            <td>
                <select
                    class="role-select"
                    onchange="cambiarRolAdmin('${usuario.id}', this.value)"
                >
                    <option value="usuario" ${usuario.rol === "usuario" ? "selected" : ""}>Usuario</option>
                    <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Admin</option>
                </select>
            </td>
        </tr>
    `).join("");

}


async function cambiarRolAdmin(id, nuevoRol) {

    const actual = obtenerUsuarioActual();
    const objetivo = usuariosCache.find(u => u.id === id);

    if (!objetivo) return;

    const esUnoMismo = actual && actual.email === objetivo.email;

    if (esUnoMismo && nuevoRol !== "admin") {

        const confirmar = await mostrarModal(
            "Estás a punto de quitarte el rol de administrador a ti mismo. ¿Deseas continuar?",
            true
        );

        if (!confirmar) {
            cargarUsuariosAdmin();
            return;
        }
    }

    try {

        const respuesta = await fetchConTimeout(API_URL + "/api/usuarios/" + id + "/rol", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ rol: nuevoRol })
        });

        const data = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            await mostrarModal(data.error || "No se pudo cambiar el rol.");
            cargarUsuariosAdmin();
            return;
        }

    } catch (error) {
        await mostrarModal("No se pudo conectar con el servidor.");
        cargarUsuariosAdmin();
        return;
    }

    if (esUnoMismo && nuevoRol !== "admin") {

        localStorage.setItem(
            "usuarioActual",
            JSON.stringify({ ...actual, rol: nuevoRol })
        );

        window.location.href = "index.html";
        return;
    }

    await cargarUsuariosAdmin();
    cargarEstadisticasAdmin();

}


/* =====================================================
   FINALIZAR COMPRA ACTUALIZADO
===================================================== */

async function finalizarCompra() {

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        await mostrarModal("Debes iniciar sesión para realizar la compra.");
        window.location.href = "login.html";
        return;
    }


    const carrito = obtenerCarrito();


    if (carrito.length === 0) {

        await mostrarModal("Tu carrito está vacío.");

        return;
    }

    let respuesta;

    try {
        respuesta = await fetchConTimeout(API_URL + "/api/compra", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                items: carrito.map(i => ({ id: i.id, cantidad: i.cantidad }))
            })
        });
    } catch (error) {
        await mostrarModal("No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.");
        return;
    }

    const dataCompra = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        await mostrarModal(dataCompra.error || "No se pudo procesar la compra.");
        await cargarProductosDesdeAPI();
        cargarCatalogo();
        return;
    }

    /*
       VACIAR CARRITO
    */

    localStorage.removeItem("carrito");


    await mostrarModal("¡Compra realizada correctamente! 🎮");


    cerrarCarrito();

    actualizarContadorCarrito();

    mostrarCarrito();


    /*
       ACTUALIZAR CATÁLOGO
    */

    await cargarProductosDesdeAPI();
    cargarCatalogo();

}


/* =====================================================
   CARGAR VENTAS ADMIN
===================================================== */

async function cargarVentasAdmin() {

    const tabla = document.getElementById("tabla-ventas");

    if (!tabla) return;

    const { datos, error } = await pedirAlServidorAdmin("/api/ventas");

    ventasCache = datos || [];

    if (error || ventasCache.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    ${error || "No existen ventas todavía."}
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = ventasCache.map(venta => `
        <tr>
            <td>#${venta.id.slice(-6)}</td>
            <td>${escaparHTML(venta.usuario.nombre)}</td>
            <td>${escaparHTML(venta.usuario.email)}</td>
            <td>${venta.productos.map(p => `${escaparHTML(p.nombre)} x${p.cantidad}`).join("<br>")}</td>
            <td><strong>$${Number(venta.total).toFixed(2)}</strong></td>
            <td>${new Date(venta.createdAt).toLocaleString()}</td>
        </tr>
    `).join("");

}


/* =====================================================
   ESTADÍSTICAS ADMIN
===================================================== */

function cargarEstadisticasAdmin() {

    const productos = obtenerProductos();

    const poner = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    };

    poner("total-productos-admin", productos.length);

    poner(
        "total-usuarios-admin",
        usuariosCache.filter(u => u.rol === "usuario").length
    );

    poner("total-ventas-admin", ventasCache.length);

    poner(
        "dinero-ventas-admin",
        "$" + ventasCache.reduce((total, v) => total + v.total, 0).toFixed(2)
    );

    poner(
        "stock-total-admin",
        productos.reduce((total, p) => total + Number(p.stock), 0)
    );

}


/* =====================================================
   CARGAR CATÁLOGO
===================================================== */

function cargarCatalogo() {

    const contenedor =
        document.getElementById(
            "catalogo-productos"
        );


    if (!contenedor) return;


    const productos =
        obtenerProductos();


    contenedor.innerHTML = "";


    if (productos.length === 0) {

        contenedor.innerHTML = `

            <p class="empty-table">
                ${productosError
                ? "No se pudieron cargar los videojuegos. El servidor puede estar despertando; recarga en unos segundos."
                : "No hay videojuegos disponibles."}
            </p>
          `;

        return;
    }


    productos.forEach(producto => {

        const agotado =
            Number(producto.stock) <= 0;


        contenedor.innerHTML += `

            <article
                class="product-card catalog-product"

                data-nombre="${producto.nombre}"

                data-plataforma="${producto.plataforma.join(" ")}"
            >

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                >


                <div class="product-info">

                    <span class="platform-tag">

                        ${producto.plataforma.join(" / ")}

                    </span>


                    <h3>
                        ${producto.nombre}
                    </h3>


                    <p class="product-stock">

                        ${agotado
                ? "❌ Agotado"
                : "📦 Stock: " + producto.stock
            }

                    </p>


                    <p class="price">

                        $${Number(
                producto.precio
            ).toFixed(2)}

                    </p>


                    <div class="product-actions">

                        <button
                            class="details-button"

                            onclick="
                                abrirDetalle(
                                    ${producto.id}
                                )
                            "
                        >
                            Ver detalles
                        </button>


                        ${agotado

                ? `

                                    <button
                                        class="buy-button disabled"
                                        disabled
                                    >
                                        Agotado
                                    </button>

                                  `

                : `

                                    <button
                                        class="buy-button"

                                        onclick="
                                            agregarCarrito(
                                                ${producto.id}
                                            )
                                        "
                                    >
                                        🛒 Agregar
                                    </button>

                                  `
            }

                    </div>

                </div>

            </article>

        `;

    });


    // Aplicar filtro de plataforma si viene por la URL (ej: catalogo.html?plataforma=PC)
    const params = new URLSearchParams(window.location.search);
    const plataformaURL = params.get("plataforma");

    if (plataformaURL) {

        const boton = Array.from(
            document.querySelectorAll(".filter")
        ).find(btn => btn.textContent.includes(plataformaURL));

        filtrarPlataforma(plataformaURL, boton);

    } else {
        aplicarFiltros();
    }

}


/* =====================================================
   INICIALIZACIÓN ADMIN
===================================================== */

async function inicializarAdmin() {

    const tablaProductos =
        document.getElementById(
            "tabla-productos"
        );


    if (!tablaProductos) return;


    if (!(await verificarAdmin())) return;


    cargarAdmin();

    await Promise.all([
        cargarUsuariosAdmin(),
        cargarVentasAdmin()
    ]);

    cargarEstadisticasAdmin();

    cargarMensajesAdmin();

}

/* =====================================================
   VALIDACIÓN FORMULARIO DE CONTACTO
===================================================== */

async function validarFormularioContacto(event) {

    event.preventDefault();

    const usuarioSesion = obtenerUsuarioActual();
    if (!usuarioSesion || !localStorage.getItem("token")) {
        await mostrarModal("Debes iniciar sesión para enviar un mensaje.");
        window.location.href = "login.html";
        return;
    }
    const nombre = document.getElementById("contact-nombre").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const telefono = document.getElementById("contact-telefono").value.trim();
    const mensaje = document.getElementById("contact-mensaje").value.trim();

    const errorNombre = document.getElementById("error-nombre");
    const errorEmail = document.getElementById("error-email");
    const errorTelefono = document.getElementById("error-telefono");
    const errorMensaje = document.getElementById("error-mensaje");
    const exito = document.getElementById("contact-exito");

    [errorNombre, errorEmail, errorTelefono, errorMensaje].forEach(
        el => el.textContent = ""
    );

    exito.textContent = "";

    let esValido = true;

    if (nombre === "") {
        errorNombre.textContent = "El nombre es obligatorio.";
        esValido = false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        errorEmail.textContent = "El correo es obligatorio.";
        esValido = false;
    } else if (!regexEmail.test(email)) {
        errorEmail.textContent = "Ingresa un correo válido.";
        esValido = false;
    }

    const regexTelefono = /^[0-9+\s-]{7,15}$/;

    if (telefono === "") {
        errorTelefono.textContent = "El teléfono es obligatorio.";
        esValido = false;
    } else if (!regexTelefono.test(telefono)) {
        errorTelefono.textContent = "Ingresa un teléfono válido.";
        esValido = false;
    }

    if (mensaje === "") {
        errorMensaje.textContent = "El mensaje es obligatorio.";
        esValido = false;
    }

    if (!esValido) return;
    const formulario = event.target;
    const boton = formulario.querySelector("button[type='submit']");

    boton.disabled = true;

    try {

        const respuesta = await fetch(API_URL + "/api/contacto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ nombre, email, telefono, mensaje })
        });

        if (respuesta.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuarioActual");
            await mostrarModal("Tu sesión expiró. Inicia sesión de nuevo para enviar el mensaje.");
            window.location.href = "login.html";
            return;
        }

        if (!respuesta.ok) throw new Error("Respuesta no válida");

        exito.textContent =
            "¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.";

        formulario.reset();

    } catch (error) {

        errorMensaje.textContent =
            "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.";

    } finally {

        boton.disabled = false;

    }

}


/* =====================================================
   INICIO DEL SISTEMA
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    actualizarContadorCarrito();
    mostrarCarrito();
    actualizarMenuUsuario();
    inicializarMenuMovil();
    inicializarChatbot();

    localStorage.removeItem("productos");

    const grid = document.getElementById("catalogo-productos");
    if (grid) grid.innerHTML = `<p class="empty-table">Cargando videojuegos…</p>`;

    if (grid || document.getElementById("detalle-producto") || document.getElementById("tabla-productos")) {
        await cargarProductosDesdeAPI();
    }

    cargarDetalle();
    cargarCatalogo();
    inicializarAdmin();

});

function actualizarMenuUsuario() {

    const usuario = obtenerUsuarioActual();

    const loginContainer = document.getElementById("login-container");
    const logoutMenu = document.getElementById("logout-menu");
    const usuarioMenu = document.getElementById("usuario-menu");
    const adminPanelMenu = document.getElementById("admin-panel-menu");

    if (!logoutMenu) return;

    if (usuario) {

        // Ocultar por completo el botón/enlace de login cuando hay sesión activa
        if (loginContainer) loginContainer.style.display = "none";

        // Mostrar cerrar sesión
        logoutMenu.style.display = "inline-block";

        // Mostrar nombre
        if (usuarioMenu) {
            usuarioMenu.innerHTML = `
                👤 ${usuario.nombre}
            `;
        }

        // Mostrar el botón de panel de administrador SOLO si el rol es "admin"
        if (adminPanelMenu) {
            adminPanelMenu.style.display =
                usuario.rol === "admin" ? "inline-block" : "none";
        }

    } else {

        // Volver a mostrar el botón/enlace de login al cerrar sesión
        if (loginContainer) loginContainer.style.display = "";

        // Ocultar cerrar sesión
        logoutMenu.style.display = "none";

        if (usuarioMenu) {
            usuarioMenu.innerHTML = "";
        }

        // Sin sesión nunca se muestra el botón de admin
        if (adminPanelMenu) {
            adminPanelMenu.style.display = "none";
        }

    }

}

/* =====================================================
   MENÚ HAMBURGUESA (RESPONSIVE)
===================================================== */

function toggleMenu() {

    const nav = document.getElementById("nav-menu");
    const boton = document.getElementById("hamburger-btn");

    if (!nav || !boton) return;

    const abierto = nav.classList.toggle("active");

    boton.classList.toggle("active", abierto);

    boton.setAttribute("aria-expanded", abierto ? "true" : "false");

}


function cerrarMenu() {

    const nav = document.getElementById("nav-menu");
    const boton = document.getElementById("hamburger-btn");

    if (!nav || !boton) return;

    nav.classList.remove("active");

    boton.classList.remove("active");

    boton.setAttribute("aria-expanded", "false");

}


function inicializarMenuMovil() {

    const nav = document.getElementById("nav-menu");

    if (!nav) return;

    // Cerrar el menú automáticamente al seleccionar cualquier enlace
    nav.querySelectorAll("a").forEach(enlace => {

        enlace.addEventListener("click", cerrarMenu);

    });

    // Si el usuario agranda la ventana hasta el tamaño de escritorio
    // mientras el menú móvil está abierto, lo cerramos para que no
    // quede abierto al volver a achicar la ventana.
    window.addEventListener("resize", () => {

        if (window.innerWidth >= 1024) {

            cerrarMenu();

        }

    });

}


async function irAlPanelAdmin() {

    // Doble verificación real de rol antes de navegar, además de la
    // validación que ya hace verificarAdmin() dentro de admin.html.
    const usuario = obtenerUsuarioActual();

    if (!usuario || usuario.rol !== "admin") {
        await mostrarModal("No tienes permisos para acceder al panel de administrador.");
        return;
    }


    window.location.href = "admin.html";

}

async function cerrarSesion() {

    const confirmar = await mostrarModal("¿Seguro que deseas cerrar sesión?", true);
    if (!confirmar) { return; }

    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("token");

    await mostrarModal("Sesión cerrada correctamente.");


    window.location.href =
        "index.html";

}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

async function cargarMensajesAdmin() {

    const tabla = document.getElementById("tabla-mensajes");

    if (!tabla) return;

    const token = localStorage.getItem("token");

    try {

        const respuesta = await fetch(API_URL + "/api/contacto", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            tabla.innerHTML = `<tr><td colspan="5" class="empty-table">No autorizado. Vuelve a iniciar sesión.</td></tr>`;
            return;
        }

        if (!respuesta.ok) throw new Error("Respuesta no válida");

        const mensajes = await respuesta.json();

        if (mensajes.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" class="empty-table">Todavía no hay mensajes.</td></tr>`;
            return;
        }

        tabla.innerHTML = mensajes.map(m => `
            <tr>
                <td>${new Date(m.createdAt).toLocaleString()}</td>
                <td>${escaparHTML(m.nombre)}</td>
                <td>${escaparHTML(m.email)}</td>
                <td>${escaparHTML(m.telefono)}</td>
                <td>${escaparHTML(m.mensaje)}</td>
            </tr>
        `).join("");

    } catch (error) {

        tabla.innerHTML = `<tr><td colspan="5" class="empty-table">No se pudo conectar con el servidor.</td></tr>`;

    }

}

/* =====================================================
   CHATBOT RECOMENDADOR (DREAMBOT)
===================================================== */

let chatHistorial = [];

function inicializarChatbot() {

    if (document.getElementById("chatbot")) return;

    const caja = document.createElement("div");
    caja.id = "chatbot";
    caja.innerHTML = `
        <button class="chat-toggle" id="chat-toggle" aria-label="Abrir asistente">🤖</button>
        <div class="chat-panel" id="chat-panel" hidden>
            <div class="chat-header">
                <strong>DreamBot</strong>
                <button id="chat-cerrar" aria-label="Cerrar">✕</button>
            </div>
            <div class="chat-mensajes" id="chat-mensajes"></div>
            <form class="chat-form" id="chat-form">
                <input id="chat-input" type="text" maxlength="300" autocomplete="off"
                       placeholder="¿Qué te gusta jugar?" required>
                <button type="submit">➤</button>
            </form>
        </div>
    `;
    document.body.appendChild(caja);

    const panel = document.getElementById("chat-panel");
    const mensajes = document.getElementById("chat-mensajes");
    const input = document.getElementById("chat-input");

    function agregar(texto, quien) {
        const div = document.createElement("div");
        div.className = "chat-msg " + quien;
        div.textContent = texto;          // textContent evita inyección de HTML
        mensajes.appendChild(div);
        mensajes.scrollTop = mensajes.scrollHeight;
        return div;
    }

    agregar("¡Hola! Soy DreamBot 🎮 Cuéntame qué te gusta jugar y te recomiendo un título.", "bot");

    document.getElementById("chat-toggle").onclick = () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) input.focus();
    };

    document.getElementById("chat-cerrar").onclick = () => { panel.hidden = true; };

    document.getElementById("chat-form").onsubmit = async (event) => {

        event.preventDefault();

        const texto = input.value.trim();
        if (!texto) return;

        input.value = "";
        agregar(texto, "user");
        chatHistorial.push({ role: "user", content: texto });

        const espera = agregar("Escribiendo…", "bot");

        try {

            const respuesta = await fetch(API_URL + "/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ historial: chatHistorial })
            });

            if (!respuesta.ok) throw new Error("Respuesta no válida");

            const data = await respuesta.json();

            espera.textContent = data.respuesta || "No pude responder, intenta de nuevo.";
            chatHistorial.push({ role: "assistant", content: espera.textContent });

        } catch (error) {

            espera.textContent = "Ahora mismo no puedo responder. Inténtalo más tarde.";
            chatHistorial.pop();   // quita el mensaje que falló

        }

    };

}