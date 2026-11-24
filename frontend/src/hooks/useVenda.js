import api from "../utils/api";

function useVenda() {
    // finaliza a venda com o que está no carrinho da API
    async function create() {
        const response = await api.post('/venda/create');
        return response.data;
    }
    async function getAll() {
        const response = await api.get('/venda/getAll');
        return response.data;
    }

    return { create, getAll };
}

export default useVenda;