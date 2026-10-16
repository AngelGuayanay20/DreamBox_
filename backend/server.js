require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS.split(",") }));

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

/* ---------- Arranque ---------- */
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT, () =>
            console.log("API lista en http://localhost:" + process.env.PORT)
        );
    })
    .catch(error => console.error("No se pudo conectar a MongoDB:", error));