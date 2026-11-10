const express = require('express');

const app = express();

const http = require('http').Server(app);

const io = require('socket.io')(http);

const listaTurnos = ["Emi Martinez", "Nahuel Molina", "Cristian Romero", "Lisandro Martinez", "Marcos Acuña","Rodrigo De Paul", "Leandro Paredes","Alexis Mac Allister","Angel Di Maria", "Leonel Messi", "Julian Alvarez"];
const listaAtendidos = [];

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname})
});


http.listen(3000, () => console.log('SERVIDOR FUNCIONANDO EN http://localhost:3000'));

function enviarListados(alerta){
    io.sockets.emit('ListaDeTurnos', {pendientes:listaTurnos,atendidos:listaAtendidos,alerta:alerta}); 
}

setInterval(() => {
    enviarListados(false);
}, 60000);

io.on('connection', (socket)=>{
    console.log('Usuario conectado')

    socket.on('VentanaTurnoActual', data => {
        console.log('VentanaTurnoActual')
        enviarListados(false)
    });
    socket.on('AtenderTurno', puesto =>{
        console.log('AtenderTurno')
        if (listaTurnos.length>0) {
            listaAtendidos.unshift({nombre:listaTurnos[0],puesto:puesto,hora:Date.now()})
            listaTurnos.shift() 
            enviarListados(true)
        }
    });
    socket.on('CrearTurno', data => {
        console.log('CrearTurno')
        listaTurnos.push(data) 
        enviarListados(false)
    });
});