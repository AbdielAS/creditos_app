document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('credito-form');
    const tableBody = document.querySelector('#tabla-creditos tbody');
    const cancelButton = document.getElementById('button-cancel');
    let id_credito = null; // se usa para identificar si estamos editando un crédito

    // Al iniciar, cargar los créditos existentes
    Cargar_Creditos();

    // -----------------------------
    // Evento para guardar crédito (crear o editar)
    // -----------------------------
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Capturamos los valores del formulario
        const cliente = document.getElementById('cliente').value.trim();
        const monto = parseFloat(document.getElementById('monto').value);
        const tasa_interes = parseFloat(document.getElementById('interes').value);
        const plazo = parseInt(document.getElementById('plazo').value);
        const fecha_otorgamiento = document.getElementById('fecha').value;

        // Validamos que estén completos
        if (!cliente || isNaN(monto) || isNaN(tasa_interes) || isNaN(plazo) || !fecha_otorgamiento) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        const datos_credito = { cliente, monto, tasa_interes, plazo, fecha_otorgamiento };

        // Si existe id_credito => estamos editando
        if (id_credito) {
            fetch(`/api/creditos/${id_credito}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos_credito)
            })
                .then(res => {
                    if (!res.ok) throw new Error('Hubo un error al actualizar la información del crédito');
                    return res.json();
                })
                .then(() => {
                    Limpiar_Formulario();
                    Cargar_Creditos();
                })
                .catch(err => alert(err.message));
        } else {
            // Caso contrario => es un nuevo crédito
            fetch('/api/creditos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos_credito)
            })
                .then(res => {
                    if (!res.ok) throw new Error('Hubo un error al almacenar la información del crédito');
                    return res.json();
                })
                .then(() => {
                    form.reset();
                    Cargar_Creditos();
                })
                .catch(err => alert(err.message));
        }
    });

    // -----------------------------
    // Función para limpiar formulario (volver a modo "nuevo crédito")
    // -----------------------------
    function Limpiar_Formulario() {
        id_credito = null;
        form.reset();
        cancelButton.style.display = 'none';
    }

    // Botón cancelar edición
    cancelButton.addEventListener('click', () => {
        Limpiar_Formulario();
    });

    // -----------------------------
    // Cargar lista de créditos en tabla
    // -----------------------------
    function Cargar_Creditos() {
        fetch('/api/creditos')
            .then(res => res.json())
            .then(data => {
                tableBody.innerHTML = '';
                data.forEach(credito => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${credito.id}</td>
                        <td>${credito.cliente}</td>
                        <td>$${credito.monto.toFixed(2)}</td>
                        <td>${credito.tasa_interes.toFixed(2)}%</td>
                        <td>${credito.plazo}</td>
                        <td>${credito.fecha_otorgamiento}</td>
                        <td>
                           <div class="buttons-actions">
                           <button class="button-edit" data-id="${credito.id}">Editar</button>
                           <button class="button-delete" data-id="${credito.id}">Eliminar</button>
                           </div>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
                Acciones_Creditos(); // Activar botones editar y eliminar
                Graficos(data);      // Actualizar las gráficas
            });
    }

    // -----------------------------
    // Eventos para botones editar y eliminar
    // -----------------------------
    function Acciones_Creditos() {
        document.querySelectorAll('.button-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id_c = btn.getAttribute('data-id');
                Editar_Credito(id_c);
            });
        });
        document.querySelectorAll('.button-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id_c = btn.getAttribute('data-id');
                if (confirm('Este crédito será eliminado permanentemente ¿Está de acuerdo?')) {
                    Eliminar_Credito(id_c);
                }
            });
        });
    }

    // -----------------------------
    // Editar un crédito: carga sus datos en el formulario
    // -----------------------------
    function Editar_Credito(id) {
        fetch(`/api/creditos`)
            .then(res => res.json())
            .then(data => {
                const credito = data.find(c => c.id == id);
                if (credito) {
                    id_credito = id;
                    document.getElementById('cliente').value = credito.cliente;
                    document.getElementById('monto').value = credito.monto;
                    document.getElementById('interes').value = credito.tasa_interes;
                    document.getElementById('plazo').value = credito.plazo;
                    document.getElementById('fecha').value = credito.fecha_otorgamiento;
                    cancelButton.style.display = 'inline';
                }
            });
    }

    // -----------------------------
    // Eliminar crédito
    // -----------------------------
    function Eliminar_Credito(id) {
        fetch(`/api/creditos/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(() => {
                Cargar_Creditos();
            });
    }

    // -----------------------------
    // Gráficas con Chart.js
    // -----------------------------
    let Total, Cliente, Rango;

    function Graficos(creditos) {
        // Gráfico 1: Total de créditos
        const monto_total = creditos.reduce((sum, c) => sum + c.monto, 0);
        const grafico_total = document.getElementById("graficoTotal").getContext("2d");
        if (Total) Total.destroy(); // destruimos gráfico previo si existe
        Total = new Chart(grafico_total, {
            type: "bar",
            data: {
                labels: ["Total Créditos"],
                datasets: [{
                    label: "Monto Total",
                    data: [monto_total],
                    backgroundColor: ["rgba(75, 192, 192, 0.6)"]
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Gráfico 2: Distribución por cliente
        const lista_clientes = {};
        creditos.forEach(c => {
            lista_clientes[c.cliente] = (lista_clientes[c.cliente] || 0) + c.monto;
        });
        const grafico_cliente = document.getElementById("graficoCliente").getContext("2d");
        if (Cliente) Cliente.destroy();
        Cliente = new Chart(grafico_cliente, {
            type: "pie",
            data: {
                labels: Object.keys(lista_clientes),
                datasets: [{
                    label: "Monto por Cliente",
                    data: Object.values(lista_clientes),
                    backgroundColor: Object.keys(lista_clientes).map(() =>
                        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                    )
                }]
            },
            options: { responsive: true }
        });

        // Gráfico 3: Créditos por rango de monto
        const rangos = ["<1000", "1000-5000", "5000-10000", ">10000"];
        const monto_rango = [0, 0, 0, 0];
        creditos.forEach(c => {
            const monto = c.monto;
            if (monto < 1000) monto_rango[0]++;
            else if (monto <= 5000) monto_rango[1]++;
            else if (monto <= 10000) monto_rango[2]++;
            else monto_rango[3]++;
        });
        const grafico_rango = document.getElementById("graficoRango").getContext("2d");
        if (Rango) Rango.destroy();
        Rango = new Chart(grafico_rango, {
            type: "bar",
            data: {
                labels: rangos,
                datasets: [{
                    label: "Cantidad de Créditos",
                    data: monto_rango,
                    backgroundColor: "rgba(75, 192, 192, 0.6)"
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

});
