const contenedorColores =  document.querySelector("ul");
const formulario = document.querySelector("form");
const inputTexto = document.querySelector('input[type="text"]');
const msgError = document.querySelector(".error");
const modalBorrar = document.querySelector(".modal-borrar");
const botonesModalBorrar = document.querySelectorAll(".modal-borrar button");
const modalEditar = document.querySelector(".modal-editar");
const botonesModalEditar = document.querySelectorAll(".modal-editar button");
const previewColor = document.querySelector(".color");
const inputsEditor = document.querySelectorAll(".modal-editar input");
let colorBorrar = null;
let colorEditar = null;

class Color{
    constructor({_id,r,g,b},contenedor){
        this.id = _id;
        this.rgb = [r,g,b];
        this.DOM = null;

        this.crearColor(contenedor);
    }

    crearColor(contenedor){
        this.DOM = document.createElement("li");
        let valor = this.rgb.join(",");
        this.DOM.style.backgroundColor = `rgb(${valor})`;
        this.DOM.innerHTML = `<span>${valor}</span>
                        <button>editar</button>
                        <button>borrar</button>`; 

        let botonEditar = this.DOM.querySelector("button:nth-child(2)");
        let botonBorrar = this.DOM.querySelector("button:nth-child(3)");

        botonEditar.addEventListener("click", () => {
            colorEditar = this;
            previewColor.style.backgroundColor = `rgb(${this.rgb.join(",")})`;

            this.rgb.forEach((valor,i) => inputsEditor[i].value = valor );

            modalEditar.classList.add("modal-visible");
        });

        botonBorrar.addEventListener("click", () => {
        colorBorrar = this;
        modalBorrar.classList.add("modal-visible");
        });

        contenedor.appendChild(this.DOM);

    }
}

//carga inicial de los datos
fetch("/colores")
.then(respuesta => respuesta.json())
.then( colores => {
    colores.forEach( c => {
       // contenedorColores.appendChild(color(c));
        new Color(c, contenedorColores);
    });
});

formulario.addEventListener("submit", evento => {
    evento.preventDefault();
    
    msgError.classList.remove("visible");
    
    if(/^(\d{1,3},){2}\d{1,3}$/.test(inputTexto.value)){
        
        let valores = inputTexto.value.split(",").map( n => Number(n) ); 

        let i = 0;

        let valido = true;


        while(valido && i < valores.length){
            valido = valores[i] <= 255;
            i++;
        }

        if(valido){
            let [r,g,b] = valores;

            let objColor = {
                r,g,b
            };

            return fetch("/nuevo",{
                method : "POST",
                body : JSON.stringify(objColor),
                headers : {
                    "Content-type" : "application/json"
                }
            })
            .then(respuesta => {
                if(respuesta.status == 201){
                    return respuesta.json();
                }
                throw "la petición falló";
            })
            .then(({_id}) => {
                objColor._id = _id;

                new Color(objColor, contenedorColores)

                inputTexto.value = "";

            })
            .catch( e => {
                console.log("informar al usuario del error");
            });
        }
    }

    msgError.classList.add("visible");
    
});

botonesModalBorrar.forEach((boton,i) => {
    boton.addEventListener("click", () => {
        if(i == 0){
            colorBorrar = null;
            modalBorrar.classList.remove("modal-visible");
        }else{

            fetch(`/borrar/${colorBorrar.id}`, {
                method : "DELETE"
            })
            .then( respuesta => {
                if(respuesta.status == 204){
                    colorBorrar.DOM.remove();
                    colorBorrar = null;
                    return modalBorrar.classList.remove("modal-visible");
                }
                console.log("informar al usuario del error");
            });
        }
    });
});

botonesModalEditar.forEach((boton,i) => {
    boton.addEventListener("click", () => {
        if(i == 0){
            colorEditar = null;
            modalEditar.classList.remove("modal-visible");
        }else{
            let [r,g,b] = colorEditar.rgb;

            fetch(`/actualizar/${colorEditar.id}`, {
                method : "PUT",
                body : JSON.stringify({r,g,b}),
                headers : {
                    "Content-type" : "application/json"
                }
            })
            .then(respuesta => {
                if(respuesta.status == 204){
                    colorEditar.DOM.style.backgroundColor = `rgb(${colorEditar.rgb.join(",")})`;
                    colorEditar.DOM.children[0].innerText = colorEditar.rgb.join(",");
                    colorEditar = null;
                    return modalEditar.classList.remove("modal-visible");
                }
                console.log("informar al usuario del error");
            });
        }
    });
});

inputsEditor.forEach((input,i) => {
    input.addEventListener("input", () => {
        colorEditar.rgb[i] = input.value;
        previewColor.style.backgroundColor = `rgb(${colorEditar.rgb.join(",")})`;
    });
});