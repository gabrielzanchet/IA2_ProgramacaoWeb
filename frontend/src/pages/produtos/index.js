import { useState, useEffect } from "react";
import InputGroup from "../../components/inputGroup";
import useProduto from "../../hooks/useProduto";

const Produtos = () => {
    const [produto, setProduto] = useState({ nome: '', preco: '' });
    const [listaProdutos, setListaProdutos] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const { getAll, create, update, remove } = useProduto();

    async function carregar() {
        try {
            setListaProdutos(await getAll());
        } catch (err) {
            alert("Erro ao buscar os produtos");
        }
    }

    useEffect(() => {
        carregar();
        // eslint-disable-next-line
    }, []);

    function validateProduto(produto) {
        if (!produto.nome || !produto.nome.trim()) {
            alert("O campo nome é obrigatório");
            return false;
        }
        if (produto.preco === '' || produto.preco === undefined) {
            alert("O campo preço é obrigatório");
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo");
            return false;
        }
        return true;
    }

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto(produto)) return;

        try {
            const dados = { nome: produto.nome.trim(), preco: Number(produto.preco) };
            if (editandoId) {
                await update(editandoId, dados);
            } else {
                await create(dados);
            }
            setProduto({ nome: '', preco: '' });
            setEditandoId(null);
            carregar();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao salvar o produto");
        }
    }

    function handleEditar(item) {
        setEditandoId(item.id);
        setProduto({ nome: item.nome, preco: item.preco });
    }

    function handleCancelar() {
        setEditandoId(null);
        setProduto({ nome: '', preco: '' });
    }

    async function handleExcluir(id) {
        if (!window.confirm("Deseja excluir este produto?")) return;
        try {
            await remove(id);
            carregar();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao excluir o produto");
        }
    }

    return (
        <div className="container">
            <h1 className="text-center fs-4">Produtos</h1>
            <form onSubmit={handleSubmit}>
                <InputGroup
                    label="Nome"
                    onChange={handleChange}
                    type="text"
                    placeholder="Nome do Produto"
                    name="nome"
                    value={produto.nome} />
                <InputGroup
                    label="Preço"
                    onChange={handleChange}
                    type="number"
                    placeholder="Preço do Produto"
                    name="preco"
                    min="0"
                    step="0.01"
                    value={produto.preco} />

                <button className="btn btn-primary" type="submit">
                    {editandoId ? "Atualizar" : "Salvar"}
                </button>
                {editandoId && (
                    <button className="btn btn-secondary ms-2" type="button" onClick={handleCancelar}>
                        Cancelar
                    </button>
                )}
            </form>

            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {listaProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center">Nenhum produto encontrado</td>
                        </tr>
                    ) : (
                        listaProdutos.map((item) => (
                            <tr key={item.id}>
                                <td>{item.nome}</td>
                                <td>R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditar(item)}>Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleExcluir(item.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Produtos;