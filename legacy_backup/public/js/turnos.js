const socket = io(); 

// Clientes
socket.on('ListaDeTurnos', data => {
    var audio = document.getElementById("audio");
    actualizacionTurnos(data.pendientes,data.atendidos)
    //reproduce sonidos
    if (data.alerta)
        audio.play();   
})

function actualizacionTurnos(pendientes,atendidos) {
    const turnoActualElement = document.getElementById('turno-actual');
    const proximosTurnosElement = document.getElementById('proximos-turnos');
    const turnosAtendidosElement = document.getElementById('turnos-atendidos');
    const turnosAntendidosDiaElement = document.getElementById('turnos-antendidos-dia');       

    turnoActualElement.innerHTML=''
    // Actualiza el turno actual
    if (atendidos.length > 0) {
        const card = document.createElement('div');
        card.className = 'card';
        const { minutos, segundos } = calcularDiferencia(atendidos[0].hora);
        card.innerHTML =`<div class="card-header">${atendidos[0].nombre}</div>
                                <div class="card-content">Puesto: ${atendidos[0].puesto}</div>
                                <div class="card-footer">${minutos} minutos </div>`;
        turnoActualElement.appendChild(card);                  
    } else {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = 'No hay turnos en este momento.';
        turnoActualElement.appendChild(card);                
    }

    

    // Limpia la lista de próximos turnos
    proximosTurnosElement.innerHTML = '';

    // Actualiza los próximos turnos
    if (pendientes.length > 0) {
        for (let i = 0; i < pendientes.length; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<div class="card-header">${pendientes[i]}</div>`;
            proximosTurnosElement.appendChild(card);                      
        }
    } else {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="card-header">No hay próximos turnos.</div>`;
        proximosTurnosElement.appendChild(card);                 
    }

    // Limpia la lista de próximos turnos
    turnosAtendidosElement.innerHTML = '';

    // Actualiza los  turnos antendidos
    if (atendidos.length > 1) {
        for (let i = 1; i < atendidos.length && i <=5; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            const { minutos, segundos } = calcularDiferencia(atendidos[i].hora);
            card.innerHTML = `<div class="card-header">${atendidos[i].nombre}</div>
                                <div class="card-content">Puesto: ${atendidos[i].puesto}</div>
                                <div class="card-footer">${minutos} minutos </div>`;
            turnosAtendidosElement.appendChild(card);                                          
        }
    } else {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = 'No hay otros turnos atendidos.';
        turnosAtendidosElement.appendChild(card);
    }

    //Muestra los turnos atendidos en el dia
    turnosAntendidosDiaElement.innerHTML = 'Turnos Atendidos hoy: '+atendidos.length;


}


// Función para calcular la diferencia de tiempo
function calcularDiferencia(timestamp) {
    const ahora = Date.now();
    const diferencia = ahora - timestamp;
    const minutos = Math.floor(diferencia / (1000 * 60));
    const segundos = Math.floor((diferencia / 1000) % 60);
    return { minutos, segundos };
}
