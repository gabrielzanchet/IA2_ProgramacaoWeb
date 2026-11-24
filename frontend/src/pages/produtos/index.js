import { useState } from "react";
import InputGroup from "../../components/inputGroup";

const Produtos = () => {
    const [produto, setProduto] = useState({ nome: '', preco: '' });
    const [listaProdutos, setListaProdutos] = useState([]);

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

    function handleChange (e) {
        setProduto({...produto, [e.target.name]: e.target.value})
    }

    function handleSubmit (e) {
        e.preventDefault();
        if (!validateProduto(produto)) {
            return;
        }
        setListaProdutos([...listaProdutos, { ...produto, nome: produto.nome.trim() }]);
        setProduto({ nome: '', preco: '' });
    }

    return (
        <div className="container">
            <h1 className="text-center fs-4">Produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="Nome"
                        onChange={handleChange}
                        type="text"
                        placeholder="Nome do Produto"
                        name="nome"
                        value={produto.nome}/>
                    <InputGroup
                        label="Preço"
                        onChange={handleChange}
                        type="number"
                        placeholder="Preço do Produto"
                        name="preco"
                        min="0"
                        step="0.01"
                        value={produto.preco}/>

                    <button className="btn btn-primary" type="submit">Salvar</button>
                </form>
            </div>
            <table className=" table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Preço</th>
                    </tr>
                </thead>
                <tbody>
                    {listaProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={2} className="text-center">Nenhum produto encontrado</td>
                        </tr>)
                        : (
                            listaProdutos.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.nome}</td>
                                    <td>R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Produtos;
