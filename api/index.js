const express = require('express');
const cors = require('cors');
const conn = require('./db/conn.js');
const produtoRoutes = require('./router/ProdutoRoutes.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/produto', produtoRoutes);

// Rota inexistente
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// JSON inválido no body e qualquer erro não tratado (sem expor detalhes internos)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'JSON inválido no corpo da requisição' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

async function start() {
    try {
        await conn.authenticate();
        console.log('Conexão com o banco realizada com sucesso');
        await conn.sync();
        app.listen(port, () => console.log(`API rodando na porta ${port}`));
    } catch (err) {
        console.error('Erro ao conectar/sincronizar com o banco:', err.message);
        process.exit(1);
    }
}

start();
