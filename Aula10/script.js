//funcoes 

//expresao de funcao 
const multiplicar = function (a, b){
    return a * b;
};

console.log(multiplicar);

//funcao execultando outra funcao
function execultarFuncao(funcao) {
    return funcao();
}

const exebirSaudacao = function (){
    return "ola, SP16";
};

console.log(execultarFuncao(exebirSaudacao));

//arrow functions
const multiplicar2 = (a, b) => a * b;

console.log(multiplicar2(5, 6));

//arrow functions com um parametro
const potencia = a => a * a;

console.log(potencia(5))

//chamada de arrow function
const dizerOla = () => { return "ola"; };



