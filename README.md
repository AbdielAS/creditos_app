# 💳 Gestión de Créditos – Delta Data Consulting

Aplicación web para registrar, gestionar y visualizar créditos de clientes.  
Desarrollada con *Python (Flask)*, *SQLite* y un *frontend* en HTML, CSS y JavaScript.  
Incluye *gráficas dinámicas* con Chart.js para analizar los créditos.

## 🚀 Funcionalidades principales

- 📝 Registrar, editar y eliminar créditos.  
- 📊 Visualización de estadísticas mediante gráficas:  
  - Monto total de créditos otorgados.  
  - Distribución de créditos por cliente.  
  - Créditos por rango de monto.  
- 💾 Almacenamiento persistente en SQLite.  
- ✅ Validaciones básicas en el formulario (campos obligatorios y formato de fecha).

---

## 🛠 Tecnologías utilizadas

| Capa        | Tecnología                   |
|------------|------------------------------|
| Backend    | Python, Flask, SQLite        |
| Frontend   | HTML, CSS, JavaScript        |
| Gráficas   | Chart.js                     |

---

## 📂 Estructura del proyecto

registro-creditos/
|
| - -|- backend/
|    |-- app.py # Lógica backend y API 
|    |-- creditos.db # Base de datos SQLite (se crea automáticamente)
|
| - -|- frontend/
|    |- css/
|    |--- style.css # Estilos de la aplicacion
|    |- js/
|    |--- script.js # Lógica frontend y gráficos
|
| - - README.md # Este archivo

## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/AbdielAS/creditos_app.git
cd creditos_app
```
### 2️⃣ Crear entorno virtual (opcional pero recomendado)
```bash
python -m venv venv
```
#### Activar entorno virtual en Windows:
```bash
.\venv\Scripts\activate
```
#### Activar entorno virtual en Linux/Mac:
```bash
source venv/bin/activate
```
### 3️⃣ Instalar dependencias
```bash
pip install flask
```
### 4️⃣ Ejecutar servidor Flask
```bash
cd backend
python app.py
```
### 5️⃣ Abrir la app en el navegador

http://127.0.0.1:5000
