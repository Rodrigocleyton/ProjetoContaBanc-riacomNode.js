/*Projeto Conta Bancária usando NodeJS
  Curso Back End / DevOps 
  Escola Descomplica
  Programa Impulso Tec
  Professor Marcelo Estruc
*/


const inquirer = require("inquirer")
const fs = require('fs')
const Choices = require("inquirer/lib/objects/choices")


console.log("Iniciamos o app")

operacao()

//Mostrar todas as opções do menu da conta
function operacao () {
    //iteracao com o usuario
    inquirer.prompt([
        {
            type:'list',//será do tipo lista
            name:'action',//terá uma ação
            message:"O que deseja fazer?",
            choices:['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair' ],
        }
    ]).then((answer) => {
        const action = answer['action']
    
        if(action === 'Criar Conta') {//criacao do menu
            criarConta()
        } else if(action === "Depositar") {
            depositar()
        } else if(action === "Consultar Saldo") {
            verificarSaldo()
        } else if(action === "Sacar") {
            sacarDinheiro()
        }else if(action === "Sair") {
            console.log("Obrigado por acessar!")
            process.exit()//sair

        }
    }).catch(err => console.log(err))//Se der tudo certo entra no then ,catch caso ocorra um erro ele será mostrado
}

function criarConta() {
    console.log("Defina as informações da conta")
    definicaoConta()
    
}

function definicaoConta() {
    inquirer.prompt([
        {
            name: 'nomeconta',
            message:'Digite um nome para a conta:'

        }
    ]).then(answer => {
        const nomeConta =answer['nomeconta']
       // se nao existir um diretorio chamado contas, criar um
        if(!fs.existsSync('Contas')){
            fs.mkdirSync('Contas')
        }
        //verifica se o nome da conta existe
        if(fs.existsSync(`Contas/${nomeConta}.json`)) {
            console.log("Já existe uma conta com esse nome.")
            criarConta()//caso a conta exista retornará para a opção de criarConta
        }

        //se não tiver essa conta criada, vai criar uma arquivo com o nome dessa conta com a extensao .json e com saldo zero
        fs.writeFileSync(`Contas/${nomeConta}.json`, '{"Saldo": 0}')

        operacao()//chamou a operacao para realizar outro procedimento

    }).catch(err => console.log(err))

}

//verificação da conta antes de realizar um deposito ou saque

function verificarConta(nomeConta) {
      var flag = false
    //se em contas existe o nome da conta passado
    if(fs.existsSync(`Contas/${nomeConta}.json`)) {
        console.log("Verificamos sua conta. Pode processeguir.")

        flag = true

    } else {
        console.log("Essa conta não existe!")
        flag = false
    }
    return flag
}

function depositar () {
    inquirer.prompt([ 
        {
            name:'nomeConta',
            message:'Qual o nome da sua conta?'
        }
    ]).then((answer) => {
        // pega a informação que veio da conta  
        const nomeConta = answer['nomeConta']
        //bom dia verifica conta
        if(verificarConta(nomeConta)) {
            //se a conta existir informe o valor que deseja depositar
            inquirer.prompt([
                {
                    name:'valor',
                    message:'Qual o valor que deseja depositar?' 
                }
            ]).then((answer) => {
                //pega a resposta, valor que veio de cima
                const valor = answer['valor']
                adicionarValor(nomeConta, valor)
                operacao()


            }).catch(err => console.log(err))

        }else {
        //senao existir volta para o depositar
        depositar()
        }
    })
}
//fará a leitura do arquivo
function getConta(nomeConta){
    const contaJSON = fs.readFileSync(`Contas/${nomeConta}.json`, {
        encoding: 'utf8',
        flag:'r',
    })//o arquivo será lido e retornado para quem quiser uasr
    
   return JSON.parse(contaJSON)//retorna o arquivo para quem chamou 
}  

function adicionarValor(nomeConta ,valor) {

    const conta  = getConta(nomeConta)
        if(!conta) {
            console.log("Não foi possível acessar a conta.")
            return depositar()
        }
        //o saldo é o valor que está sendo passado + o saldo que já está na conta
        conta.Saldo = parseFloat(valor) + parseFloat(conta.Saldo)
        fs.writeFileSync(`Contas/${nomeConta}.json`,
            JSON.stringify(conta),//converte um arquivo javasript para o formato json
            function (err) {
                console.log(err)
            }
        )
}

function verificarSaldo() {
    inquirer.prompt([
        {
            name: 'nomeConta',
            message: 'Qual o nome da sua conta?',
        }
    ]).then((answer) => {
        const conta = answer['nomeConta']
        if(verificarConta(conta)) {
            const dadosConta = getConta(conta)
            console.log(" Seu saldo é : " + dadosConta.Saldo)
        }
        operacao()
    })    
}

function sacarDinheiro () {
    inquirer.prompt([
        {
          name:'nomeConta',
          message:" Qual o nome da sua conta?"
        }
    ]).then((answer) => {
        const nomeConta= answer['nomeConta']
        if(verificarConta(nomeConta)) {
         inquirer.prompt([
            {
             name: 'valor',
             message:'Qual o valor quer sacar?'   
            }
         ]).then((answer) => {
            const valor = answer['valor']
            retirada(nomeConta, valor)
         })
        }
        
    })
}

function retirada (nomeConta, valor) {
    const conta = getConta(nomeConta);
    if(!conta) {
        console.log("Tem problema na conta.")
        return sacarDinheiro();
    }

    if(conta.Saldo < valor) {
        console.log("Você não possui saldo suficiente. " )
        return sacarDinheiro();
    }

    conta.Saldo = parseFloat(conta.Saldo) - parseFloat(valor);
    fs.writeFileSync(`Contas/${nomeConta}.json`,
    JSON.stringify(conta),

    function (err) {
        console.log(err)
    },
    )

    console.log(`Foi realizado uma saque de ${valor} da sua conta.`)
    operacao()
}





