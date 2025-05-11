// Importação de bibliotecas necessárias
const axios = require('axios');
const mysql = require('mysql');

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senha',
    database: 'PLUS'
});

// Função para consultar a API ADVPL
async function consultarAPIADVPL() {
    try {
        const response = await axios.get('http://url-da-api/WSClientes');
        return response.data;
    } catch (error) {
        console.error('Erro ao consultar a API ADVPL:', error.message);
        throw new Error('API ADVPL está offline ou inacessível.');
    }
}

// Função para mapear os campos da API ADVPL para os campos do MySQL
function mapearCampos(dadosAPI) {
    return {
        grupo: dadosAPI.$cli_grupo,
        codigo: dadosAPI.$cli_cod,
        loja: dadosAPI.$cli_loja,
        cnpj: dadosAPI.$cli_cnpj,
        regiao: dadosAPI.$cli_regiao,
        razao_social: dadosAPI.$cli_razao_social,
        fantasia: dadosAPI.$cli_fantasia,
        inscr_municipal: dadosAPI.$cli_inscr_municipal,
        inscr_estadual: dadosAPI.$cli_inscr_estadual,
        contato_fat: dadosAPI.$cli_nome_contato_fat,
        email_fat: dadosAPI.$cli_email_fat,
        telefone_fat: dadosAPI.$cli_num_fat,
        contato_folha: dadosAPI.$cli_nome_contato_folha,
        email_folha: dadosAPI.$cli_email_folha
    };
}

// Função para salvar os dados no MySQL
function salvarNoMySQL(cliente) {
    return new Promise((resolve, reject) => {
        // Verifica se o cliente já existe no banco
        const queryVerificar = 'SELECT COUNT(*) AS count FROM clientes WHERE codigo = ?';
        db.query(queryVerificar, [cliente.codigo], (err, results) => {
            if (err) return reject(err);

            if (results[0].count > 0) {
                console.log(`Cliente com código ${cliente.codigo} já existe. Ignorando.`);
                return resolve();
            }

            // Insere o cliente no banco
            const queryInserir = `
                INSERT INTO clientes (grupo, codigo, loja, cnpj, regiao, razao_social, fantasia, inscr_municipal, inscr_estadual, contato_fat, email_fat, telefone_fat, contato_folha, email_folha)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const valores = [
                cliente.grupo, cliente.codigo, cliente.loja, cliente.cnpj, cliente.regiao, cliente.razao_social,
                cliente.fantasia, cliente.inscr_municipal, cliente.inscr_estadual, cliente.contato_fat,
                cliente.email_fat, cliente.telefone_fat, cliente.contato_folha, cliente.email_folha
            ];

            db.query(queryInserir, valores, (err) => {
                if (err) return reject(err);
                console.log(`Cliente com código ${cliente.codigo} inserido com sucesso.`);
                resolve();
            });
        });
    });
}

// Função principal para importar os clientes
async function importarClientes() {
    try {
        const dadosAPI = await consultarAPIADVPL();
        for (const clienteAPI of dadosAPI) {
            const cliente = mapearCampos(clienteAPI);
            await salvarNoMySQL(cliente);
        }
        console.log('Importação concluída com sucesso.');
    } catch (error) {
        console.error('Erro durante a importação:', error.message);
    }
}

// Exporta a função para ser usada no Angular
module.exports = { importarClientes };
