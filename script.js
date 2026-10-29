
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

function obtenerProductos() {

    let productos = JSON.parse(
        localStorage.getItem("productos") || "null"
    );

    if (!productos) {

        productos = [
            {
                id: 1,
                nombre: "Elden Ring",
                precio: 59.99,
                stock: 10,
                plataforma: ["PC", "PlayStation", "Xbox"],
                genero: "RPG",
                imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
                descripcion: "Un vasto mundo de fantasía oscura creado por FromSoftware."
            },
            {
                id: 2,
                nombre: "Cyberpunk 2077",
                precio: 49.99,
                stock: 8,
                plataforma: ["PC", "PlayStation", "Xbox"],
                genero: "Acción",
                imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
                descripcion: "Un RPG de acción y aventura en Night City."
            },
            {
                id: 3,
                nombre: "Spider-Man Remastered",
                precio: 59.99,
                stock: 5,
                plataforma: ["PC", "PlayStation"],
                genero: "Aventura",
                imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg",
                descripcion: "Balancéate por Nueva York en la piel de Spider-Man."
            },
            {
                id: 4,
                nombre: "The Legend of Zelda: Tears of the Kingdom",
                precio: 69.99,
                stock: 12,
                plataforma: ["Nintendo"],
                genero: "Aventura",
                imagen: "https://i.ytimg.com/vi/gp9aY09li1s/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCKs1QqnvLBAnzop7KvoPsvqedjlQ",
                descripcion: "Explora los cielos y las tierras de Hyrule en la nueva aventura de Link."
            },
            {
                id: 5,
                nombre: "Mario Kart 8 Deluxe",
                precio: 59.99,
                stock: 15,
                plataforma: ["Nintendo"],
                genero: "Carreras",
                imagen: "https://i.ytimg.com/vi/HulSYumqceU/maxresdefault.jpg",
                descripcion: "El clásico de carreras de Nintendo, ahora con todo el contenido descargable incluido."
            },
            {
                id: 6,
                nombre: "Forza Horizon 5",
                precio: 49.99,
                stock: 9,
                plataforma: ["PC", "Xbox"],
                genero: "Carreras",
                imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg",
                descripcion: "Recorre el vibrante y siempre cambiante mundo abierto de México."
            }
        ];

        guardarProductos(productos);
    }

    return productos;
}


function guardarProductos(productos) {

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );

}


/* =====================================================
   GAMEZONE - SISTEMA DE USUARIOS
===================================================== */

function obtenerUsuarios() {

    return JSON.parse(
        localStorage.getItem("usuarios") || "[]"
    );

}


function guardarUsuarios(usuarios) {

    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );

}


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

    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));

    window.location.href =
        data.usuario.rol === "admin" ? "admin.html" : "index.html";
}

async function verificarAdmin() {

    const usuario = obtenerUsuarioActual();

    if (!usuario || usuario.rol !== "admin") {
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

function cargarAdmin() {

    const tabla =
        document.getElementById("tabla-productos");

    if (!tabla) return;

    const productos =
        obtenerProductos()
            .slice()
            .sort((a, b) => a.id - b.id);

    tabla.innerHTML = "";

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
                    <button class="delete-button" onclick="eliminarProductoAdmin(${producto.id})">Eliminar</button>
                </td>
            </tr>
        `;

    });

}


async function actualizarStockAdmin(id, nuevoValor) {

    const productos = obtenerProductos();

    const producto = productos.find(p => p.id === id);

    if (!producto) return;

    const valor = parseInt(nuevoValor);

    if (isNaN(valor) || valor < 0) {
        await mostrarModal("Ingresa un número válido (0 o mayor).");
        cargarAdmin();
        return;
    }

    producto.stock = valor;

    guardarProductos(productos);

    cargarEstadisticasAdmin();

}


async function eliminarProductoAdmin(id) {

    const confirmar = await mostrarModal("¿Eliminar este videojuego?", true);
    if (!confirmar) return;

    let productos = obtenerProductos();

    productos = productos.filter(p => p.id !== id);

    guardarProductos(productos);

    cargarAdmin();

    cargarEstadisticasAdmin();

}


function agregarProductoAdmin(event) {

    event.preventDefault();

    const productos = obtenerProductos();

    const nuevoId =
        productos.length === 0
            ? 1
            : Math.max(...productos.map(p => p.id)) + 1;

    const nuevoProducto = {
        id: nuevoId,
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

    productos.push(nuevoProducto);

    guardarProductos(productos);

    event.target.reset();

    cargarAdmin();

    cargarEstadisticasAdmin();

}


function cargarUsuariosAdmin() {

    const tabla = document.getElementById("tabla-usuarios");

    if (!tabla) return;

    const usuarios = obtenerUsuarios();

    tabla.innerHTML = "";

    if (usuarios.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td colspan="3" class="empty-table">
                    Todavía no hay usuarios registrados.
                </td>

            </tr>

        `;

        return;
    }

    usuarios.forEach(usuario => {

        tabla.innerHTML += `
            <tr>

                <td>
                    ${usuario.nombre}
                </td>

                <td>
                    ${usuario.email}
                </td>

                <td>
                    <select
                        class="role-select"
                        onchange="cambiarRolAdmin('${usuario.email}', this.value)"
                    >
                        <option value="usuario" ${usuario.rol === "usuario" ? "selected" : ""}>Usuario</option>
                        <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Admin</option>
                    </select>
                </td>

            </tr>
        `;

    });

}


function cambiarRolAdmin(email, nuevoRol) {

    const usuarioActual = obtenerUsuarioActual();

    if (usuarioActual && usuarioActual.email === email && nuevoRol !== "admin") {

        const confirmar = confirm(
            "Estás a punto de quitarte el rol de administrador a ti mismo. ¿Deseas continuar?"
        );

        if (!confirmar) {

            cargarUsuariosAdmin();

            return;
        }

    }

    cambiarRolUsuario(email, nuevoRol);

    cargarUsuariosAdmin();

}


function cambiarRolUsuario(email, nuevoRol) {

    const usuarios = obtenerUsuarios();

    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) return;

    usuario.rol = nuevoRol;

    guardarUsuarios(usuarios);

    // Si el admin se cambió el rol a sí mismo, actualizar también su sesión activa
    const usuarioActual = obtenerUsuarioActual();

    if (usuarioActual && usuarioActual.email === email) {

        localStorage.setItem(
            "usuarioActual",
            JSON.stringify({ ...usuarioActual, rol: nuevoRol })
        );

    }

    cargarEstadisticasAdmin();

}


/* =====================================================
   SISTEMA DE VENTAS
===================================================== */

function obtenerVentas() {

    return JSON.parse(
        localStorage.getItem("ventas") || "[]"
    );

}


function guardarVentas(ventas) {

    localStorage.setItem(
        "ventas",
        JSON.stringify(ventas)
    );

}


/* =====================================================
   REGISTRAR VENTA
===================================================== */

function registrarVenta(carrito, usuario) {

    const ventas = obtenerVentas();

    let total = 0;

    carrito.forEach(item => {

        total += item.precio * item.cantidad;

    });


    const nuevaVenta = {

        id: Date.now(),

        fecha: new Date().toLocaleString(),

        usuario: {

            nombre: usuario.nombre,

            email: usuario.email

        },

        productos: carrito,

        total: total

    };


    ventas.push(nuevaVenta);

    guardarVentas(ventas);

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


    const productos = obtenerProductos();


    for (const item of carrito) {

        const producto = productos.find(
            p => p.id === item.id
        );


        if (!producto) {

            await mostrarModal(`El producto ${item.nombre} ya no existe.`);

            return;
        }


        if (producto.stock < item.cantidad) {

            await mostrarModal(`No hay suficiente stock de ${item.nombre}.`);

            return;
        }

    }


    /*
       DESCONTAR STOCK
    */

    carrito.forEach(item => {

        const producto = productos.find(
            p => p.id === item.id
        );

        producto.stock -= item.cantidad;

    });


    guardarProductos(productos);


    /*
       REGISTRAR VENTA
    */

    registrarVenta(
        carrito,
        usuario
    );


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

    cargarCatalogo();

}


/* =====================================================
   CARGAR VENTAS ADMIN
===================================================== */

function cargarVentasAdmin() {

    const tabla =
        document.getElementById(
            "tabla-ventas"
        );


    if (!tabla) return;


    const ventas = obtenerVentas();


    tabla.innerHTML = "";


    if (ventas.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >
                    No existen ventas todavía.
                </td>

            </tr>

        `;

        return;
    }


    ventas
        .slice()
        .reverse()
        .forEach(venta => {

            const productos =
                venta.productos
                    .map(
                        producto =>
                            `${producto.nombre} x${producto.cantidad}`
                    )
                    .join("<br>");


            tabla.innerHTML += `

                <tr>

                    <td>
                        #${venta.id}
                    </td>

                    <td>
                        ${venta.usuario.nombre}
                    </td>

                    <td>
                        ${venta.usuario.email}
                    </td>

                    <td>
                        ${productos}
                    </td>

                    <td>
                        <strong>
                            $${venta.total.toFixed(2)}
                        </strong>
                    </td>

                    <td>
                        ${venta.fecha}
                    </td>

                </tr>

            `;

        });

}


/* =====================================================
   ESTADÍSTICAS ADMIN
===================================================== */

function cargarEstadisticasAdmin() {

    const productos =
        obtenerProductos();


    const usuarios =
        JSON.parse(
            localStorage.getItem("usuarios") || "[]"
        );


    const ventas =
        obtenerVentas();


    /*
       TOTAL DE PRODUCTOS
    */

    const totalProductos =
        document.getElementById(
            "total-productos-admin"
        );


    if (totalProductos) {

        totalProductos.textContent =
            productos.length;

    }


    /*
       TOTAL USUARIOS
    */

    const totalUsuarios =
        document.getElementById(
            "total-usuarios-admin"
        );


    if (totalUsuarios) {

        totalUsuarios.textContent =
            usuarios.filter(
                usuario =>
                    usuario.rol === "usuario"
            ).length;

    }


    /*
       TOTAL VENTAS
    */

    const totalVentas =
        document.getElementById(
            "total-ventas-admin"
        );


    if (totalVentas) {

        totalVentas.textContent =
            ventas.length;

    }


    /*
       DINERO VENDIDO
    */

    const dineroVentas =
        document.getElementById(
            "dinero-ventas-admin"
        );


    const totalDinero =
        ventas.reduce(
            (total, venta) =>
                total + venta.total,
            0
        );


    if (dineroVentas) {

        dineroVentas.textContent =
            "$" + totalDinero.toFixed(2);

    }


    /*
       STOCK TOTAL
    */

    const stockTotal =
        document.getElementById(
            "stock-total-admin"
        );


    const totalStock =
        productos.reduce(
            (total, producto) =>
                total + Number(producto.stock),
            0
        );


    if (stockTotal) {

        stockTotal.textContent =
            totalStock;

    }

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
                No hay videojuegos disponibles.
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

function inicializarAdmin() {

    const tablaProductos =
        document.getElementById(
            "tabla-productos"
        );


    if (!tablaProductos) return;


    if (!verificarAdmin()) return;


    cargarAdmin();

    cargarUsuariosAdmin();

    cargarVentasAdmin();

    cargarEstadisticasAdmin();

    cargarMensajesAdmin();

}

/* =====================================================
   VALIDACIÓN FORMULARIO DE CONTACTO
===================================================== */

async function validarFormularioContacto(event) {

    event.preventDefault();

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, telefono, mensaje })
        });

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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        actualizarContadorCarrito();

        mostrarCarrito();

        cargarDetalle();

        cargarCatalogo();

        inicializarAdmin();

        actualizarMenuUsuario();

        inicializarMenuMovil();

        inicializarChatbot();

    }
);

function actualizarMenuUsuario() {

    const usuario = obtenerUsuarioActual();

    const loginContainer = document.getElementById("login-container"); // Ahora es un <a>
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

    localStorage.removeItem(
        "usuarioActual"
    );


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

    let clave = sessionStorage.getItem("adminKey");

    if (!clave) {
        clave = prompt("Clave de administrador para ver los mensajes:");
    }

    if (!clave) {
        tabla.innerHTML = `<tr><td colspan="5" class="empty-table">Ingresa la clave para ver los mensajes.</td></tr>`;
        return;
    }

    try {

        const respuesta = await fetch(API_URL + "/api/contacto", {
            headers: { "x-admin-key": clave }
        });

        if (respuesta.status === 401) {
            sessionStorage.removeItem("adminKey");
            tabla.innerHTML = `<tr><td colspan="5" class="empty-table">Clave incorrecta. Recarga la página para intentarlo de nuevo.</td></tr>`;
            return;
        }

        if (!respuesta.ok) throw new Error("Respuesta no válida");

        sessionStorage.setItem("adminKey", clave);

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
                body: JSON.stringify({
                    historial: chatHistorial,
                    catalogo: obtenerProductos()
                })
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