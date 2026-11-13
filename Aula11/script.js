// Objetos

// Exemplo de objeto simples
const carro = {
    marca: "Porsche",
    modelo: 911,
    ano: 2022,
    acelerar: function() {
        return ` ${this.marca} ${this.modelo} acelerou. Vruum...`;
    },
};

console.log(carro.marca);
console.log(carro.modelo);
console.log(carro.ano);
console.log(carro.acelerar());

const pessoa = {
    nome: "lucas",
    idade: 20,
    altura: 1.80,
    registro: "00000000",
    empregado: true,
    apresentar: function () {

        let alturaDecimal = this.altura;

    let infoEmpregado = (this.empregado === true) ? "sim" : "nao";

        // if (this.empregado === true) {
        //     infoEmpregado = "sim";
        // }else{
        //     infoEmpregado = "nao";
        // }

        return `
            meu nome é:${this.nome}
            minha idade é:${this.idade}
             minha altura é:${alturaDecimal.toFixed(2)}
            meu registro é:${this.registro}
            eu trabalho?: ${infoEmpregado}
        `;
    },

}

console.log(pessoa.apresentar());