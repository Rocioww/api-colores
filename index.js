import express from "express";
import {leerColores,crearColor,borrarColor,actualizarColor}  from "./datos.js"

const servidor = express();

servidor.use(express.json());

servidor.use(express.static("./front"));

servidor.get("/colores", async (peticion,respuesta) => {
    try{

        let colores = await leerColores();

        respuesta.json(colores);

    }catch(e){

        respuesta.status(500);
    
        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.post("/nuevo", async (peticion,respuesta, siguiente) => {

    let {r,g,b} = peticion.body;

    let rgb = [r,g,b];

    let i = 0;

    let valido = true;

    while(valido && i < rgb.length){
        valido = /^\d{1,3}$/.test(rgb[i]) && Number(rgb[i]) < 255; 
        i++;
    }

    if(!valido){
        return siguiente(true);
    }

    try{

        let _id = await crearColor({r,g,b});

        respuesta.status(201);

        respuesta.json({_id});

    }catch(e){

        respuesta.status(500);
        
        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.delete("/borrar/:id", async (peticion,respuesta,siguiente) => {
    
    let {id} = peticion.params;

    let valido = /^[0-9a-f]{24}$/.test(id);

    if(!valido){
        return siguiente();
    }

    try{

        let cantidad = await borrarColor(id);

        if(!cantidad){
            return siguiente();
        }

        respuesta.sendStatus(204);// no content

    }catch(e){

        respuesta.status(500);
        
        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.put("/actualizar/:id", async (peticion,respuesta,siguiente) => {

    let {id} = peticion.params;

    //cambiar la validacion aquí y en borrarColor, cambiar expresion regular a lo que convenga y no convertir a Number en el await de try. Finalmente, la funcion de borrar retorna un 0 o un 1, si retorna 0 (no ha encontrado nada que borrar) debería salir 404 y lo mismo pasará en actualizar pero hay que currar un poco más porque tenemos match y deleted, si match es 0: 404, y si match count si da +1, ya de lo que de deleted, ponemos 204

    let valido = /^[0-9a-f]{24}$/.test(id);

    if(!valido){
        return siguiente();
    }

    let {r,g,b} = peticion.body;

    let rgb = [r,g,b].map( n => {
        let isUndefined = n == undefined;   
        let valido = /^\d{1,3}$/.test(n) && Number(n) < 255;
        return { valido, isUndefined }
    });

    let i = 0;

    valido = true;

    let claves = ["r","g","b"];

    let objActualizar = {};

    while(valido && i < rgb.length){
        if(!rgb[i].isUndefined){
            valido = rgb[i].valido;
            if(valido){
                objActualizar[claves[i]] = peticion.body[claves[i]];
            } 
        } 
        i++;
    }


    if(!valido){
        return siguiente(true);
    }


    try{

        let {matchedCount} = await actualizarColor(peticion.params.id,objActualizar);

        if(!matchedCount){
            return siguiente();
        }

        respuesta.sendStatus(204);// no content

    }catch(e){

        respuesta.status(500);
    
        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.use((error,peticion,respuesta,siguiente) => {
    respuesta.status(400); // 400 --> bad request 
    respuesta.json({ error : "error en la petición" });
});

servidor.use((peticion,respuesta) => {
    respuesta.status(404); //not found
    respuesta.json({ error : "recurso no encontrado" });

});

servidor.listen(process.env.PORT);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

module.exports = app;
