require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("./node_modules/bcryptjs/umd");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*" }));

/* ---------- Modelo ---------- */
const Contacto = mongoose.model(
    "Contacto",
    new mongoose.Schema(
        {
            nombre: { type: String, required: true, trim: true, maxlength: 100 },
            email: { type: String, required: true, trim: true, maxlength: 120 },
            telefono: { type: String, required: true, trim: true, maxlength: 20 },
            mensaje: { type: String, required: true, trim: true, maxlength: 1000 },
            leido: { type: Boolean, default: false }
        },
        { timestamps: true }
    )
);

const Usuario = mongoose.model(
    "Usuario",
    new mongoose.Schema(
        {
            nombre: { type: String, required: true, trim: true, maxlength: 100 },
            email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
            passwordHash: { type: String, required: true },
            rol: { type: String, enum: ["usuario", "admin"], default: "usuario" }
        },
        { timestamps: true }
    )
);

const Producto = mongoose.model(
    "Producto",
    new mongoose.Schema(
        {
            id: { type: Number, required: true, unique: true },
            nombre: { type: String, required: true, trim: true, maxlength: 120 },
            precio: { type: Number, required: true, min: 0 },
            stock: { type: Number, required: true, min: 0 },
            plataforma: { type: [String], default: [] },
            genero: { type: String, required: true, trim: true, maxlength: 40 },
            imagen: { type: String, required: true, trim: true, maxlength: 500 },
            descripcion: { type: String, required: true, trim: true, maxlength: 1000 }
        },
        { timestamps: true, id: false }
    )
);

async function sembrarProductos() {
    if (await Producto.estimatedDocumentCount() > 0) return;

    await Producto.insertMany([
        { id: 1, nombre: "Elden Ring", precio: 59.99, stock: 10, plataforma: ["PC", "PlayStation", "Xbox"], genero: "RPG", imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", descripcion: "Un vasto mundo de fantasía oscura creado por FromSoftware." },
        { id: 2, nombre: "Cyberpunk 2077", precio: 49.99, stock: 8, plataforma: ["PC", "PlayStation", "Xbox"], genero: "Acción", imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg", descripcion: "Un RPG de acción y aventura en Night City." },
        { id: 3, nombre: "Spider-Man Remastered", precio: 59.99, stock: 5, plataforma: ["PC", "PlayStation"], genero: "Aventura", imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg", descripcion: "Balancéate por Nueva York en la piel de Spider-Man." },
        { id: 4, nombre: "The Legend of Zelda: Tears of the Kingdom", precio: 69.99, stock: 12, plataforma: ["Nintendo"], genero: "Aventura", imagen: "https://i.ytimg.com/vi/gp9aY09li1s/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCKs1QqnvLBAnzop7KvoPsvqedjlQ", descripcion: "Explora los cielos y las tierras de Hyrule en la nueva aventura de Link." },
        { id: 5, nombre: "Mario Kart 8 Deluxe", precio: 59.99, stock: 15, plataforma: ["Nintendo"], genero: "Carreras", imagen: "https://i.ytimg.com/vi/HulSYumqceU/maxresdefault.jpg", descripcion: "El clásico de carreras de Nintendo, ahora con todo el contenido descargable incluido." },
        { id: 6, nombre: "Forza Horizon 5", precio: 49.99, stock: 9, plataforma: ["PC", "Xbox"], genero: "Carreras", imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg", descripcion: "Recorre el vibrante y siempre cambiante mundo abierto de México." }
    ]);
}

function leerCamposProducto(body) {
    const datos = {};
    if (body.nombre !== undefined) datos.nombre = String(body.nombre).trim();
    if (body.precio !== undefined) datos.precio = Number(body.precio);
    if (body.stock !== undefined) datos.stock = Number(body.stock);
    if (body.plataforma !== undefined) {
        datos.plataforma = (Array.isArray(body.plataforma) ? body.plataforma : [])
            .map(p => String(p).trim()).filter(Boolean).slice(0, 6);
    }
    if (body.genero !== undefined) datos.genero = String(body.genero).trim();
    if (body.imagen !== undefined) datos.imagen = String(body.imagen).trim();
    if (body.descripcion !== undefined) datos.descripcion = String(body.descripcion).trim();
    return datos;
}

const SIN_CAMPOS_INTERNOS = "-_id -__v -createdAt -updatedAt";

/* ---------- Protección simple para el admin ---------- */

function verificarToken(req, res, next) {
    const cabecera = req.headers.authorization || "";
    const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "No autorizado." });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: "Sesión inválida o expirada." });
    }
}

function soloAdmin(req, res, next) {
    verificarToken(req, res, () => {
        if (req.usuario.rol !== "admin") {
            return res.status(403).json({ error: "Requiere rol de administrador." });
        }
        next();
    });
}

/* ---------- Rutas ---------- */
app.post("/api/contacto", async (req, res) => {
    try {
        const { nombre, email, telefono, mensaje } = req.body;

        if (!nombre || !email || !telefono || !mensaje) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        await Contacto.create({
            nombre: String(nombre),
            email: String(email),
            telefono: String(telefono),
            mensaje: String(mensaje)
        });

        res.status(201).json({ ok: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.get("/api/contacto", soloAdmin, async (req, res) => {
    try {
        const mensajes = await Contacto.find().sort({ createdAt: -1 });
        res.json(mensajes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.post("/api/registro", async (req, res) => {
    try {
        const nombre = String(req.body.nombre || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!nombre || !email || password.length < 6) {
            return res.status(400).json({ error: "Datos inválidos." });
        }

        if (await Usuario.exists({ email })) {
            return res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const rol = email === process.env.ADMIN_EMAIL?.toLowerCase() ? "admin" : "usuario";

        await Usuario.create({ nombre, email, passwordHash, rol });

        res.status(201).json({ ok: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }

        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }

        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            ok: true,
            token,
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.get("/api/yo", verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(401).json({ error: "Usuario no encontrado." });
        }

        res.json({
            usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.get("/api/productos", async (req, res) => {
    try {
        const productos = await Producto.find().sort({ id: 1 }).select(SIN_CAMPOS_INTERNOS).lean();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.post("/api/productos", soloAdmin, async (req, res) => {
    try {
        const ultimo = await Producto.findOne().sort({ id: -1 });
        const id = ultimo ? ultimo.id + 1 : 1;

        const creado = await Producto.create({ id, ...leerCamposProducto(req.body) });

        res.status(201).json(await Producto.findById(creado._id).select(SIN_CAMPOS_INTERNOS).lean());
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Datos del videojuego inválidos." });
        }
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.put("/api/productos/:id", soloAdmin, async (req, res) => {
    try {
        const actualizado = await Producto.findOneAndUpdate(
            { id: Number(req.params.id) },
            { $set: leerCamposProducto(req.body) },
            { new: true, runValidators: true }
        ).select(SIN_CAMPOS_INTERNOS).lean();

        if (!actualizado) return res.status(404).json({ error: "Videojuego no encontrado." });

        res.json(actualizado);
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ error: "Datos del videojuego inválidos." });
        }
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

app.delete("/api/productos/:id", soloAdmin, async (req, res) => {
    try {
        const borrado = await Producto.findOneAndDelete({ id: Number(req.params.id) });
        if (!borrado) return res.status(404).json({ error: "Videojuego no encontrado." });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* Compra: descuenta stock de forma atómica (nadie puede comprar más de lo que hay) */
app.post("/api/compra", verificarToken, async (req, res) => {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const pedido = new Map();

    for (const it of items) {
        const id = Number(it.id);
        const cantidad = Number(it.cantidad);
        if (!Number.isInteger(id) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
            return res.status(400).json({ error: "Carrito inválido." });
        }
        pedido.set(id, (pedido.get(id) || 0) + cantidad);
    }

    if (pedido.size === 0) return res.status(400).json({ error: "Carrito vacío." });

    const descontados = [];

    const revertir = async () => {
        for (const d of descontados) {
            await Producto.updateOne({ id: d.id }, { $inc: { stock: d.cantidad } });
        }
    };

    try {
        for (const [id, cantidad] of pedido) {
            const ok = await Producto.findOneAndUpdate(
                { id, stock: { $gte: cantidad } },
                { $inc: { stock: -cantidad } }
            );

            if (!ok) {
                await revertir();
                const existe = await Producto.findOne({ id });
                return res.status(409).json({
                    error: existe
                        ? `No hay suficiente stock de ${existe.nombre}.`
                        : "Un producto del carrito ya no existe."
                });
            }

            descontados.push({ id, cantidad });
        }

        res.json({ ok: true });

    } catch (error) {
        await revertir();
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ---------- Chatbot recomendador (Groq) ---------- */
const ultimoUso = new Map(); // límite simple: 1 mensaje cada 2 segundos por IP

app.post("/api/chat", async (req, res) => {
    try {
        const ahora = Date.now();
        if (ahora - (ultimoUso.get(req.ip) || 0) < 2000) {
            return res.status(429).json({ error: "Espera un momento." });
        }
        ultimoUso.set(req.ip, ahora);

        const { historial } = req.body;
        const catalogo = await Producto.find().limit(40).lean();

        const mensajes = (Array.isArray(historial) ? historial : [])
            .slice(-10)
            .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .map(m => ({ role: m.role, content: m.content.slice(0, 500) }));

        if (mensajes.length === 0 || mensajes[mensajes.length - 1].role !== "user") {
            return res.status(400).json({ error: "Mensaje inválido." });
        }

        const juegos = (Array.isArray(catalogo) ? catalogo : [])
            .slice(0, 40)
            .map(p => ({
                nombre: String(p.nombre).slice(0, 80),
                precio: Number(p.precio),
                plataforma: [].concat(p.plataforma).join(", "),
                genero: String(p.genero).slice(0, 40),
                descripcion: String(p.descripcion).slice(0, 200),
                stock: Number(p.stock)
            }));

        const system =
            "Eres DreamBot, el asistente de la tienda DreamBox (cabina portátil con IA). " +
            "Recomiendas videojuegos SOLO de este catálogo y nunca inventas títulos ni precios. " +
            "Si un juego tiene stock 0, dilo. Si nada encaja, sugiere lo más cercano. " +
            "Responde en español, en máximo 4 frases, con tono amable. " +
            "Si preguntan algo ajeno a la tienda, redirige con amabilidad a los juegos.\n\n" +
            "CATÁLOGO:\n" + JSON.stringify(juegos);

        const respuesta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.AI_API_KEY
            },
            body: JSON.stringify({
                model: process.env.AI_MODEL,
                max_tokens: 400,
                messages: [
                    { role: "system", content: system },
                    ...mensajes
                ]
            })
        });

        if (!respuesta.ok) {
            console.error(await respuesta.text());
            return res.status(502).json({ error: "El asistente no está disponible." });
        }

        const data = await respuesta.json();
        const texto = data.choices?.[0]?.message?.content || "";

        res.json({ respuesta: texto });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

/* ---------- Arranque ---------- */
const PORT = process.env.PORT || 3001;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        await sembrarProductos();
        app.listen(PORT, () => console.log("API lista en el puerto " + PORT));
    })
    .catch(error => {
        console.error("No se pudo conectar a MongoDB:", error);
        process.exit(1); // Cierra el proceso si falla la BD para que Render detecte el fallo de inmediato
    });