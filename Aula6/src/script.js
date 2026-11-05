//estruturas condicionais 

//if
const hora = new Date().getHours();
let mansagem;

if (hora > 18) {
    mensagem = "Boa Noite!";
}

console.log(mensagem);

console.log("");

//condicao alinhada
let idade = 18;
let pais = "Brasil";
let resultado = "voce nao pode dirigir";

// if (pais === "Brasil") {

//     if (idade >= 18) {
//         resultado = "Voce pode dirigir";
//     }
// }

if (pais === "Brasil" && idade >=18 ){
    resultado = "Voce pode dirigir.";
}

console.log(resultado);

console.log("");

//if else
let mensagem2;

if (hora < 18) {
    mensagem2 = "Bom dia!";
}else{
    mensagem2 = "Boa noite";
}

console.log(mensagem2);

console.log("");

//else if
let mensagem3;

if(hora < 12) {
    mensagem3 = "Bom dia";
}else if (hora <18 && hora >= 12) {
    mensagem3 = "Boa tarde";
}else {
    mensagem3 = "Boa noite";
}

console.log(mensagem3);

console.log("");

//if ternario
let idade2 = 28;
let text = (idade2 = 18) ? "Maior de idade" : "Menor de idade.";

console.log(text);

console.log("");

//swith
alert("informe um dia da semana")
const dia = parseInt(prompt("escolha um dia da semana: \n \n 0 - domingo \n 1 - segunda \n 2 - terça \n 3 - qurta \n 4 - quinta \n 5 - sexta \n 6 - sabado"));
let diaSemana;

switch (dia) {
     
    case 0:
        diaSemana = "domingo";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

    case 1:
        diaSemana = "segunda";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

    case 2:
        diaSemana = "terça";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

    case 3:
        diaSemana = "quarta";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

    case 4:
        diaSemana = "quinta";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

    case 5:
        diaSemana = "sexta";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

    case 6:
        diaSemana = "sabado";
        alert("o dia da semana selecionado foi: " + diaSemana);
        break;

        default:
            let aviso = "valor incorreto. tente novamente.";
            alert(aviso);
            location.reload();
            break;

}



