import { useState, useEffect } from "react";
import useProduto from "../../hooks/useProduto";
import useCarrinho from "../../hooks/useCarrinho";
import useVenda from "../../hooks/useVenda";
import api from "../../utils/api";

const QTD_MAX = 99;
const CARRINHO_VAZIO = { itens: [], totalItens: 0, total: 0 };

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState('');
    const [carrinho, setCarrinho] = useState(CARRINHO_VAZIO);
    const [processando, setProcessando] = useState(false);
    const [mensagem, setMensagem] = useState(null); // { tipo: 'success' | 'danger', texto }
    const { getAll } = useProduto();
    const carrinhoApi = useCarrinho();
    const vendaApi = useVenda();

    // carrega os produtos e o carrinho que está salvo na API
    useEffect(() => {
        async function carregar() {
            try {
                setProdutos(await getAll());
                setCarrinho(await carrinhoApi.get());
            } catch (err) {
                setMensagem({ tipo: 'danger', texto: 'Erro ao carregar os dados da loja' });
            }
        }
        carregar();
        // eslint-disable-next-line
    }, []);

    // executa uma ação do carrinho na API e atualiza a tela com a resposta
    async function executar(acao, erroPadrao) {
        setMensagem(null);
        setProcessando(true);
        try {
            setCarrinho(await acao());
        } catch (err) {
            setMensagem({ tipo: 'danger', texto: err.response?.data?.message || erroPadrao });
        } finally {
            setProcessando(false);
        }
    }

    function adicionar(produto) {
        executar(() => carrinhoApi.add(produto.id, 1), 'Erro ao adicionar ao carrinho');
    }

    function alterarQuantidade(item, delta) {
        const nova = item.quantidade + delta;
        if (nova < 1) return remover(item);
        executar(() => carrinhoApi.update(item.produtoId, nova), 'Erro ao atualizar o carrinho');
    }

    function remover(item) {
        executar(() => carrinhoApi.remove(item.produtoId), 'Erro ao remover do carrinho');
    }

    function esvaziar() {
        executar(() => carrinhoApi.clear(), 'Erro ao esvaziar o carrinho');
    }

    async function finalizarVenda() {
        if (carrinho.itens.length === 0 || processando) return;
        setProcessando(true);
        setMensagem(null);
        try {
            const resposta = await vendaApi.create();
            setCarrinho(CARRINHO_VAZIO);
            setMensagem({
                tipo: 'success',
                texto: `Venda #${resposta.venda.id} finalizada com sucesso!`
            });
        } catch (err) {
            setMensagem({
                tipo: 'danger',
                texto: err.response?.data?.message || 'Erro ao finalizar a venda'
            });
        } finally {
            setProcessando(false);
        }
    }

    const termo = busca.trim().toLowerCase();
    const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(termo));

    return (
        <div className="container mt-3">
            <h1 className="text-center fs-4 mb-3">Loja</h1>

            {mensagem && (
                <div className={`alert alert-${mensagem.tipo} d-flex justify-content-between align-items-center`} role="alert">
                    <span>{mensagem.texto}</span>
                    <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setMensagem(null)} />
                </div>
            )}

            <div className="row">
                {/* ---------- vitrine ---------- */}
                <div className="col-lg-8 mb-4">
                    <input
                        className="form-control mb-3"
                        type="search"
                        placeholder="Buscar produto..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)} />

                    {produtosFiltrados.length === 0 ? (
                        <p className="text-center text-muted">Nenhum produto encontrado</p>
                    ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                            {produtosFiltrados.map((produto) => (
                                <div className="col" key={produto.id}>
                                    <div className="card h-100">
                                        {produto.imagem ? (
                                            <img
                                                className="card-img-top bg-light"
                                                src={`${api.defaults.baseURL}/uploads/${produto.imagem}`}
                                                alt={produto.nome}
                                                style={{ height: 220, objectFit: 'contain' }} />
                                        ) : (
                                            <div
                                                className="bg-light text-muted d-flex align-items-center justify-content-center"
                                                style={{ height: 220 }}>
                                                Sem imagem
                                            </div>
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title fs-6">{produto.nome}</h5>
                                            <p className="card-text fw-bold mt-auto">{formatarMoeda(produto.preco)}</p>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={processando}
                                                onClick={() => adicionar(produto)}>
                                                Adicionar ao carrinho
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ---------- carrinho ---------- */}
                <div className="col-lg-4">
                    <div className="card sticky-top" style={{ top: 16 }}>
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <strong>Carrinho</strong>
                            <span className="badge bg-secondary">{carrinho.totalItens}</span>
                        </div>

                        {carrinho.itens.length === 0 ? (
                            <div className="card-body text-center text-muted">Seu carrinho está vazio</div>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {carrinho.itens.map((item) => (
                                    <li className="list-group-item" key={item.produtoId}>
                                        <div className="d-flex justify-content-between">
                                            <span>{item.nome}</span>
                                            <button
                                                className="btn-close"
                                                aria-label="Remover"
                                                disabled={processando}
                                                onClick={() => remover(item)} />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    disabled={processando}
                                                    onClick={() => alterarQuantidade(item, -1)}>
                                                    −
                                                </button>
                                                <span className="btn btn-outline-secondary disabled text-dark">
                                                    {item.quantidade}
                                                </span>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    disabled={processando || item.quantidade >= QTD_MAX}
                                                    onClick={() => alterarQuantidade(item, 1)}>
                                                    +
                                                </button>
                                            </div>
                                            <span className="fw-bold">{formatarMoeda(item.subtotal)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="card-footer">
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Total</strong>
                                <strong>{formatarMoeda(carrinho.total)}</strong>
                            </div>
                            <button
                                className="btn btn-success w-100 mb-2"
                                disabled={carrinho.itens.length === 0 || processando}
                                onClick={finalizarVenda}>
                                {processando ? 'Aguarde...' : 'Finalizar venda'}
                            </button>
                            <button
                                className="btn btn-outline-danger w-100 btn-sm"
                                disabled={carrinho.itens.length === 0 || processando}
                                onClick={esvaziar}>
                                Esvaziar carrinho
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;