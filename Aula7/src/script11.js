//Faça um algoritmo que leia a idade de uma pessoa expressa em anos, meses e dias e escreva a idade dessa pessoa expressa apenas em dias. Considerar ano com 365 dias e mês com 30 dias.


let anos = Number(prompt("Digite sua idade em anos:"));
let meses = Number(prompt("Digite os meses:"));
let dias = Number(prompt("Digite os dias:"));

//dias
let totalDias = (anos * 365) + (meses * 30) + dias;

//resultado
alert("Sua idade expressa em dias é: " + totalDias + " dias.");
