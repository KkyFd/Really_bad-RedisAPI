module.exports = function(client) {
    const express = require('express');
    const router = express.Router({mergeParams: true});
    const get = async (chave) => {
        return client.get(chave, (_, result) => {
            return result
        });
    }
    const set = async (chave, valor, ttl) => {
        if (ttl) {
            client.set(chave, valor,{EX: 15});
        } else {
            client.set(chave, valor);
        }
    }
    router.route('/').get((_, res) => {res.render('chaves', {mensagem: "Escolha uma ação"})});

    router.route('/buscar_chave').get((_, res) => {res.render('buscar_chave', {mensagem_acao: "Buscando chave", mensagem_instrucao: "Digite a chave para buscar"})});

    router.route('/buscar_chave/valor_chave').get(async (req,res) => {
        let chave = req.query.chave;
        let valor = await getKey(chave);
        res.render('valor_chave', {chave: `Chave buscada: ${chave}`, valor: `Valor da chave: ${valor}`});
    });

    router.route('/inserir_chave').get((_, res) => {res.render('inserir_chave', {mensagem_acao: "Inserindo chaves", mensagem_instrucao: "Digite o valor para inserir", expirar: "A chave irá expirar?"})}).post((req,res) => {
        res.redirect(`/chaves/inserir_chave/valor_chave?chave=${req.body.chave}&valor=${req.body.valor}&expirar=${req.body.ttl}`);
    });

    router.route('/inserir_chave/valor_chave').get(async (req, res) => {
        let chave = req.query.chave;
        let valor = req.query.valor;
        let ttl = (req.query.expirar === 'true');
        await setKey(chave, valor, ttl);
        res.render('valor_chave', {chave: `A chave ${chave} foi inserida`, valor: `O valor ${valor} foi atribuido para ela`});
    });
    
    async function getKey(chave){
        console.log(`Buscando chave: ${chave}`);
        let valor = await get(chave);
        return valor
    }

    async function setKey(chave, valor, ttl){
        console.log(`Inserindo chave: ${chave} com o valor: ${valor}`);
        set(chave, valor, ttl)
    }
    return router
}