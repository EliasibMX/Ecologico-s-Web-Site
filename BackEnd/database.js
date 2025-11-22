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
app.use(express.static(path.join(__dirname, 'public'))); 

// --- Endpoints de la API (para la Conexión con el Frontend cosa que tu haras) ---

// 1. metodo GET (Leer): Obtener Datos (en este contexto, son tareas, pero me entiendes )
app.get('/api/tareas', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tareas ORDER BY id DESC');
        res.json(rows); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// 2. metodo POST (Crear): Agregar un dato desde mysql (igualemnte, con el ejemplo de una app de tareas)
app.post('/api/tareas', async (req, res) => {
    const { texto } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO tareas (texto) VALUES (?)', 
            [texto]
        );
        const nuevaTarea = { 
            id: result.insertId, 
            texto: texto, 
            completada: 0 
        };
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 3. metodo PUT (Actualizar): Marcar una tarea como completada (osea un actulizado )
app.put('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const completada = req.body.completada ? 1 : 0; 
    try {
        await pool.query(
            'UPDATE tareas SET completada = ? WHERE id = ?', 
            [completada, id]
        );
        res.json({ id: id, completada: req.body.completada });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 4. metodo DELETE (Borrar): Eliminar una tarea con el boton (un delete en nysql)
app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tareas WHERE id = ?', [id]);
        res.status(204).send(); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Mensaje para comprobar que si inicio el server y todo gud
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});