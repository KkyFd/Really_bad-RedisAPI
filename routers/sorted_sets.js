module.exports = function(client) {
    const express = require('express');
    const router = express.Router({mergeParams: true});

    router.route('/').get((_, res) => {res.render('sorted_sets', {mensagem_buscar: "Buscar placar", mensagem_incrementar: "Incrementar valor"})});

    router.route('/incrementar').get((req, res) => {
        res.render('incrementar', {mensagem_acao: 'Incrementar valor'})
    })

    router.route('/incrementar/incremento').post(async (req, res) => {
        let id = req.body.id
        let incremento = req.body.incremento
        let opcao = req.body.rank
        let opcao_hash
        if(opcao === 'nivel'){
            opcao_hash = 'Nivel'
        }else{opcao_hash = 'XP'}
        let mensagem = await increment(id, incremento, opcao, opcao_hash)
        res.render('incremento', {mensagem_resultado: mensagem})
    })


    router.route('/valor_sorted_sets').get((req, res) => {
        let rank = req.query.rank;
        if(rank == 'xp'){
            getXP(rank, res);
        }else{getLevel(rank, res)}
    });

    async function increment(id, incremento, opcao, opcao_hash){
        let player_value = await client.hGet(`player:${id}`, opcao_hash)
        if(player_value == null){
            return "Perfil Não Encontrado"
        }else{
            client.zIncrBy(`leaderboard:${opcao}`, incremento, id)
            client.hIncrBy(`player:${id}`, opcao_hash, Number(incremento));
            return `O jogador com o ID ${id} teve seu ${opcao} aumentado por ${incremento}`
        }
    }

    async function getXP(rank, res){
        let lb = await client.zRange(`leaderboard:${rank}`, 0, 9);
        let id_top_10 = lb.reverse();
        let scores_top_10 = [];
        for(const id of id_top_10){
            let score = await client.hGet(`player:${id}`, 'XP')
            scores_top_10.push(score)
        }
        res.render('valor_sorted_sets', {id: id_top_10, placar: scores_top_10, mensagem_placar: "Placar", mensagem_chave: "ID", mensagem_valor: "XP"});
    }

    async function getLevel(rank, res){
        let lb = await client.zRange(`leaderboard:${rank}`, 0, 9);
        let id_top_10 = lb.reverse();
        let scores_top_10 = [];
        for(const id of id_top_10){
            let score = await client.hGet(`player:${id}`, 'Nivel')
            scores_top_10.push(score)
        }
        res.render('valor_sorted_sets', {id: id_top_10, placar: scores_top_10, mensagem_placar: "Placar", mensagem_chave: "ID", mensagem_valor: "Nivel"});
    }
    return router
}