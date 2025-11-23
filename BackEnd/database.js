// Dependencias
const express = require('express');
const mysql = require('mysql2/promise'); 
const path = require('path');
const app = express();
const PORT = 3008;

// --- Configuración de la Base de Datos (MySQL) ---
const dbConfig = {
    // eliasgei, estas son las credenciales "server=turntable.proxy.rlwy.net;database=railway;user=root;password=XIuGJHMoyABvjrzwzTPobfGfaVnamArt;Port=35135"
    host: 'turntable.proxy.rlwy.net', // Servidor/Host remoto
    user: 'root', // Usuario
    password: 'XIuGJHMoyABvjrzwzTPobfGfaVnamArt', // Contraseña
    database: 'railway', // Nombre de la base de datos
    port: 35135 // Puerto remoto
};

let pool; 

// Función para conectar la base de datos
async function connectDB() {
    try {
        pool = await mysql.createPool(dbConfig);
        console.log(' Conexión a MySQL exitosa');
    } catch (err) {
        console.error(' Error de conexión a DB:', err.message);
        // Si hay error, se sale de la app 
        process.exit(1); 
    }
}

connectDB();

// --- Configuración del Servidor ---
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../'))); 

// Mensaje para comprobar que si inicio el server y todo gud
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Registrar usuario
app.post('/api/registro', async (req, res) => {
    const { Usuario, Email, Contrasena } = req.body;

    try {
        const [existe] = await pool.query(
            "SELECT id FROM Usuarios WHERE Email = ?",
            [Email]
        );

        if (existe.length > 0)
            return res.status(400).json({ error: "El correo ya existe" });

        const [result] = await pool.query(
            "INSERT INTO Usuarios (Usuario, Email, Contrasena) VALUES (?, ?, ?)",
            [Usuario, Email, Contrasena]
        );

        res.json({ ok: true, Id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar Sesion
app.post("/api/login", async (req, res) => {
    const { Email, Contrasena } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT Id, Usuario, Puntos FROM Usuarios WHERE Email = ? AND Contrasena = ?",
            [Email, Contrasena]
        );

        if (rows.length === 0)
            return res.status(401).json({ error: "Credenciales incorrectas" });

        res.json(rows[0]); // Devuelve datos del usuario
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener perfil de usuario
app.get('/api/usuario/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT Id, Usuario, Email, Puntos FROM Usuarios WHERE Id = ?",
            [req.params.id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sumar puntos
app.put('/api/puntos/:id', async (req, res) => {
    const { puntos } = req.body;

    try {
        await pool.query(
            "UPDATE usuarios SET puntos = puntos + ? WHERE id = ?",
            [puntos, req.params.id]
        );
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------
// COMENTARIOS
// ------------------------------------

app.post('/api/comentarios', async (req, res) => {
    const { usuario_id, texto } = req.body;

    try {
        await pool.query(
            "INSERT INTO comentarios (usuario_id, texto) VALUES (?, ?)",
            [usuario_id, texto]
        );
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/comentarios', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT comentarios.texto, comentarios.fecha, usuarios.nombre
            FROM comentarios
            JOIN usuarios ON usuarios.id = comentarios.usuario_id
            ORDER BY comentarios.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// --- Endpoints de la API (para la Conexión con el Frontend cosa que tu haras) ---

// // 1. metodo GET (Leer): Obtener Datos (en este contexto, son tareas, pero me entiendes )
// app.get('/api/tareas', async (req, res) => {
//     try {
//         const [rows] = await pool.query('SELECT * FROM tareas ORDER BY id DESC');
//         res.json(rows); 
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// // 2. metodo POST (Crear): Agregar un dato desde mysql (igualemnte, con el ejemplo de una app de tareas)
// app.post('/api/tareas', async (req, res) => {
//     const { texto } = req.body;
//     try {
//         const [result] = await pool.query(
//             'INSERT INTO tareas (texto) VALUES (?)', 
//             [texto]
//         );
//         const nuevaTarea = { 
//             id: result.insertId, 
//             texto: texto, 
//             completada: 0 
//         };
//         res.status(201).json(nuevaTarea);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // 3. metodo PUT (Actualizar): Marcar una tarea como completada (osea un actulizado )
// app.put('/api/tareas/:id', async (req, res) => {
//     const { id } = req.params;
//     const completada = req.body.completada ? 1 : 0; 
//     try {
//         await pool.query(
//             'UPDATE tareas SET completada = ? WHERE id = ?', 
//             [completada, id]
//         );
//         res.json({ id: id, completada: req.body.completada });
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // 4. metodo DELETE (Borrar): Eliminar una tarea con el boton (un delete en nysql)
// app.delete('/api/tareas/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         await pool.query('DELETE FROM tareas WHERE id = ?', [id]);
//         res.status(204).send(); 
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });