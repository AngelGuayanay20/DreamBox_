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

/* ---------- Protección simple para el admin ---------- */
function soloAdmin(req, res, next) {
    if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: "No autorizado." });
    }
    next();
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

        res.json({
            ok: true,
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

/* ---------- Chatbot recomendador (Groq) ---------- */
const ultimoUso = new Map(); // límite simple: 1 mensaje cada 2 segundos por IP

app.post("/api/chat", async (req, res) => {
    try {
        const ahora = Date.now();
        if (ahora - (ultimoUso.get(req.ip) || 0) < 2000) {
            return res.status(429).json({ error: "Espera un momento." });
        }
        ultimoUso.set(req.ip, ahora);

        const { historial, catalogo } = req.body;

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
    .then(() => {
        app.listen(PORT, () =>
            console.log("API lista en el puerto " + PORT)
        );
    })
    .catch(error => {
        console.error("No se pudo conectar a MongoDB:", error);
        process.exit(1); // Cierra el proceso si falla la BD para que Render detecte el fallo de inmediato
    });