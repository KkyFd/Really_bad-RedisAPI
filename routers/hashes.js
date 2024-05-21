module.exports = function(client) {
    const express = require('express');
    const router = express.Router({mergeParams: true});
    const get = async (id) => {
        return client.hGetAll(id, (_, result) => {
            return result
        });
    }
    const set = async (id, valores) => {
            await client.hSet(`player:${id}`, {Nome: valores[0], Raca: valores[1], Nivel: valores[2], Vida: valores[3], XP: valores[4]});
            await client.zAdd('leaderboard:nivel', {
                score: valores[2], 
                value: id
            });
            await client.zAdd('leaderboard:xp', {
                score: 0, 
                value: id
            });
            await client.incr('player_id');
    }   
    router.route('/').get((req, res) => {res.render('hashes', {mensagem: "Escolha uma ação"})});

    router.route('/buscar_hash').get((req, res) => {res.render('buscar_hash', {mensagem_acao: "Buscando chave", mensagem_instrucao: "Digite a chave para buscar"})});

    router.route('/buscar_hash/valor_hash').get(async (req,res) => {
        let jogador = await getKey(req.query.id);
        if (jogador == null){
            res.render('valor_hash', {mensagem_perfil: `Perfil do id: ${req.query.id}`, mensagem_erro: "Perfil Não Encontrado", valor: null});
        }else{
            let jogador_valores = [jogador.Nome, jogador.Raca, jogador.Nivel, jogador.Vida, jogador.XP];
            res.render('valor_hash', {mensagem_perfil: `Perfil do id: ${req.query.id}`,mensagem_fim: "Usuário Presente", valor: jogador_valores, limite: jogador_valores.length});
        }
    });
      
    router.route('/inserir_hash').get((req, res) => {res.render('inserir_hash', {mensagem_acao: "Inserindo chave", mensagem_instrucao: "Digite os valores para inserir", expirar: "A chave vai expirar?"})}).post((req,res) => {
        res.redirect(`/hashes/inserir_hash/valor_hash?nome=${req.body.nome}&raca=${req.body.raca}`);
    });

    router.route('/inserir_hash/valor_hash').get(async (req, res) => {
        if (await client.get('player_id') == null){
            await client.set('player_id', 0)
        }
        let id = await client.get('player_id');
        let jogador = [req.query.nome, req.query.raca, 1, 20, 0];
        let limite = jogador.length;
        await setKey(id, jogador);
        res.render('valor_hash', {mensagem_perfil: "Os valores:", mensagem_fim: "Foram inseridos", valor: jogador, limite: limite});
    });

    async function getKey(id){
        console.log(`Buscando jogador com o id ${id}`);
        let valor_hash = await get(`player:${id}`);
        let valor = Object.assign({}, valor_hash);
        if (Object.keys(valor).length === 0){
            valor = null;
        }
        return valor
    }

    async function setKey(id, valores){
        console.log(`Registrando jogador com o nome: ${valores[0]} e id: ${id}`);
        set(id, valores);
    }

    return router
}