import dotenv from 'dotenv';
dotenv.config();
// cuando suba el proyecto, lo de arriba se borra porque es de mentirilla
import {MongoClient,ObjectId} from 'mongodb';

//cosa que encontre en internet para arreglar error:
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

function conectar(){
    return MongoClient.connect(process.env.MONGO_URL)
}

export function leerColores(){
    return new Promise((ok,ko) => { //puede fallar la conexión o la consulta.

        let conexion = null;

        conectar()
        .then( conexMongo => {//si logro conectarme:
            conexion = conexMongo;
            let coleccion = conexion.db("colores").collection("colores");
            return coleccion.find({}).toArray(); //linea clave de que acción hace
        }) 
        .then( colores => ok(colores))
        .catch( e => ko({error : "error en bbdd"})) //e = excepcion, si hago un console log de la e me dice cual es el error
        .finally(() => { //finally es si todo sale bien, cierra la conexion, si no funciona no hagas nada
            if(conexion){
                conexion.close();
            }
        })

    });
}

export function crearColor(objColor){
    return new Promise((ok,ko) => { //puede fallar la conexión o la consulta.

        let conexion = null;

        conectar()
        .then( conexMongo => {//si logro conectarme:
            conexion = conexMongo;
            let coleccion = conexion.db("colores").collection("colores");
            return coleccion.insertOne(objColor); //linea clave de que acción hace
        }) 
        .then( resultado => ok(resultado.insertedId))
        .catch( e => ko({error : "error en bbdd"})) //e = excepcion, si hago un console log de la e me dice cual es el error
        .finally(() => { //finally es si todo sale bien, cierra la conexion, si no funciona no hagas nada
            if(conexion){
                conexion.close();
            }
        })

    });
}

//borrarColor recibe el id y al cumplir la promesa solo habra dos posibles resultado 0 o 1

export function borrarColor(id){
    return new Promise((ok,ko) => { //puede fallar la conexión o la consulta.

        let conexion = null;

        conectar()
        .then( conexMongo => {//si logro conectarme:
            conexion = conexMongo;
            let coleccion = conexion.db("colores").collection("colores");
            return coleccion.deleteOne({_id : new ObjectId(id)}); //linea clave de que acción hace
        }) 
        .then( resultado => ok(resultado.deletedCount))
        .catch( e => ko({error : "error en bbdd"})) //e = excepcion, si hago un console log de la e me dice cual es el error
        .finally(() => { //finally es si todo sale bien, cierra la conexion, si no funciona no hagas nada
            if(conexion){
                conexion.close();
            }
        })

    });
}

// borrarColor('69fb14f042cdc6b78e563a9d')

//matched count siempre tiene que ir con modified porque solo modified no se puede ir solo. necesitamos match para en caso de que no lo encuntre hacer 404


//actualizarColor id,objCambios y { matchedCount, modifiedCount}

export function actualizarColor(id,objCambios){
    return new Promise((ok,ko) => { //puede fallar la conexión o la consulta.

        let conexion = null;

        conectar()
        .then( conexMongo => {//si logro conectarme:
            conexion = conexMongo;
            let coleccion = conexion.db("colores").collection("colores");
            return coleccion.updateOne({_id : new ObjectId(id)},{$set : objCambios}); //linea clave de que acción hace
        }) 
        .then( resultado => {
            let {matchedCount,modifiedCount} = resultado;
            ok({matchedCount,modifiedCount});
        })
        .catch( e => {
    console.log("ERROR REAL:", e);
    ko({error : "error en bbdd"});
})//e = excepcion, si hago un console log de la e me dice cual es el error
        .finally(() => { //finally es si todo sale bien, cierra la conexion, si no funciona no hagas nada
            if(conexion){
                conexion.close();
            }
        })

    });
}

//pruobar funciones en la consola:
actualizarColor('69f9e175d8572139c1ced1f1',{ r : 200})
.then( x => console.log(x))
.catch( x => console.log(x))