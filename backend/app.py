from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from datetime import datetime

# Inicializar la app de Flask
app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Nombre del archivo de base de datos SQLite
DB = 'creditos.db'

# --------------
# Funciones DB
# --------------

# Conexión a la base de datos SQLite
def db_connection():
    connection = sqlite3.connect(DB)
    connection.row_factory = sqlite3.Row  
    return connection

# Inicializar la base de datos (si no existe se crea)
def init_db():
    connection = db_connection()
    connection.execute('''
        CREATE TABLE IF NOT EXISTS creditos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            monto REAL NOT NULL,
            tasa_interes REAL NOT NULL,
            plazo INTEGER NOT NULL,
            fecha_otorgamiento TEXT NOT NULL
        )
    ''')
    connection.commit()
    connection.close()

# Llamada a la función al inicar la app
init_db()

# -----------------------------
# Rutas para servir frontend
# -----------------------------

# Página principal -> index.html
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Archivos estáticos (CSS, JS)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# -----------------------------
# API REST (CRUD de créditos)
# -----------------------------

# Obtener lista completa de créditos almacenados en la BD
@app.route('/api/creditos', methods=['GET'])
def listar_creditos():
    connection = db_connection()
    creditos = connection.execute('SELECT * FROM creditos').fetchall()
    connection.close()
    creditos_list = [dict(credito) for credito in creditos]
    return jsonify(creditos_list)

# Almacenar un nuevo crédito +
@app.route('/api/creditos', methods=['POST'])
def crear_credito():
    data = request.get_json()
    cliente = data.get('cliente')
    monto = data.get('monto')
    tasa_interes = data.get('tasa_interes')
    plazo = data.get('plazo')
    fecha_otorgamiento = data.get('fecha_otorgamiento')

    # Validar campos para la inserción 
    if not all([cliente, monto, tasa_interes, plazo, fecha_otorgamiento]):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    # Validar el formato de la fecha
    try:
        datetime.strptime(fecha_otorgamiento, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido, debe ser YYYY-MM-DD'}), 400

    # Guardar en la BD
    connection = db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        INSERT INTO creditos (cliente, monto, tasa_interes, plazo, fecha_otorgamiento)
        VALUES (?, ?, ?, ?, ?)
    ''', (cliente, monto, tasa_interes, plazo, fecha_otorgamiento))
    connection.commit()
    nuevo_id = cursor.lastrowid
    connection.close()

    return jsonify({'id': nuevo_id}), 201

# Editar un crédito existente 
@app.route('/api/creditos/<int:id>', methods=['PUT'])
def editar_credito(id):
    data = request.get_json()
    cliente = data.get('cliente')
    monto = data.get('monto')
    tasa_interes = data.get('tasa_interes')
    plazo = data.get('plazo')
    fecha_otorgamiento = data.get('fecha_otorgamiento')

    # Validar campos para la actualización
    if not all([cliente, monto, tasa_interes, plazo, fecha_otorgamiento]):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    try:
        datetime.strptime(fecha_otorgamiento, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido -> YYYY-MM-DD'}), 400

    # Actualizar el registro del crédito
    connection = db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        UPDATE creditos
        SET cliente = ?, monto = ?, tasa_interes = ?, plazo = ?, fecha_otorgamiento = ?
        WHERE id = ?
    ''', (cliente, monto, tasa_interes, plazo, fecha_otorgamiento, id))
    connection.commit()
    connection.close()

    return jsonify({'message': 'Crédito actualizado'})

# Eliminar un crédito 
@app.route('/api/creditos/<int:id>', methods=['DELETE'])
def eliminar_credito(id):
    connection = db_connection()
    connection.execute('DELETE FROM creditos WHERE id = ?', (id,))
    connection.commit()
    connection.close()
    return jsonify({'message': 'Crédito eliminado'})

# -----------------------------
# Endpoints para las gráficas
# -----------------------------

# Total de créditos otorgados
@app.route('/api/creditos/total', methods=['GET'])
def total_creditos():
    connection = db_connection()
    result = connection.execute('SELECT SUM(monto) as total FROM creditos').fetchone()
    connection.close()
    total = result['total'] if result['total'] is not None else 0
    return jsonify({'total': total})

# Distribución de créditos por cliente
@app.route('/api/creditos/distribucion_cliente', methods=['GET'])
def distribucion_por_cliente():
    connection = db_connection()
    result = connection.execute('''
        SELECT cliente, SUM(monto) as total
        FROM creditos
        GROUP BY cliente
    ''').fetchall()
    connection.close()
    data = {row['cliente']: row['total'] for row in result}
    return jsonify(data)

# -----------------------------
# Punto de entrada de la app
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
