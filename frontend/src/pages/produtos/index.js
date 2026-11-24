import { useState, useEffect } from "react";
import InputGroup from "../../components/inputGroup";
import useProduto from "../../hooks/useProduto";
import api from "../../utils/api";

const TIPOS_ACEITOS = ['image/jpeg', 'image/png'];
const TAMANHO_MAX = 2 * 1024 * 1024; // 2 MB

const Produtos = () => {
    const [produto, setProduto] = useState({ nome: '', preco: '' });
    const [imagem, setImagem] = useState(null);
    const [inputKey, setInputKey] = useState(0); // usado para limpar o input de arquivo
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

    function limparFormulario() {
        setProduto({ nome: '', preco: '' });
        setImagem(null);
        setInputKey(inputKey + 1);
        setEditandoId(null);
    }

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

    function handleImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) {
            setImagem(null);
            return;
        }
        if (!TIPOS_ACEITOS.includes(arquivo.type)) {
            alert("A imagem deve ser .jpeg ou .png");
            e.target.value = '';
            setImagem(null);
            return;
        }
        if (arquivo.size > TAMANHO_MAX) {
            alert("A imagem deve ter no máximo 2 MB");
            e.target.value = '';
            setImagem(null);
            return;
        }
        setImagem(arquivo);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto(produto)) return;

        const formData = new FormData();
        formData.append('nome', produto.nome.trim());
        formData.append('preco', produto.preco);
        if (imagem) formData.append('imagem', imagem);

        try {
            if (editandoId) {
                await update(editandoId, formData);
            } else {
                await create(formData);
            }
            limparFormulario();
            carregar();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao salvar o produto");
        }
    }

    function handleEditar(item) {
        setEditandoId(item.id);
        setProduto({ nome: item.nome, preco: item.preco });
        setImagem(null);
        setInputKey(inputKey + 1);
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

                <div className="input-group mb-3">
                    <span className="input-group-text">Imagem</span>
                    <input
                        key={inputKey}
                        className="form-control"
                        type="file"
                        accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                        onChange={handleImagem} />
                </div>
                {editandoId && (
                    <p className="text-muted small">
                        Deixe a imagem em branco para manter a atual.
                    </p>
                )}

                <button className="btn btn-primary" type="submit">
                    {editandoId ? "Atualizar" : "Salvar"}
                </button>
                {editandoId && (
                    <button className="btn btn-secondary ms-2" type="button" onClick={limparFormulario}>
                        Cancelar
                    </button>
                )}
            </form>

            <table className="table table-striped mt-3 align-middle">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {listaProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Nenhum produto encontrado</td>
                        </tr>
                    ) : (
                        listaProdutos.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    {item.imagem ? (
                                        <img
                                            src={`${api.defaults.baseURL}/uploads/${item.imagem}`}
                                            alt={item.nome}
                                            style={{ width: 60, height: 60, objectFit: 'cover' }} />
                                    ) : (
                                        <span className="text-muted small">Sem imagem</span>
                                    )}
                                </td>
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