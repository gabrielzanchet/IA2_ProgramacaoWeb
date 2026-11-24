import api from "../utils/api";

function useCarrinho() {
    async function get() {
        const response = await api.get('/carrinho/get');
        return response.data;
    }
    async function add(produtoId, quantidade = 1) {
        const response = await api.post('/carrinho/add', { produtoId, quantidade });
        return response.data;
    }
    async function update(produtoId, quantidade) {
        const response = await api.patch(`/carrinho/update/${produtoId}`, { quantidade });
        return response.data;
    }
    async function remove(produtoId) {
        const response = await api.delete(`/carrinho/remove/${produtoId}`);
        return response.data;
    }
    async function clear() {
        const response = await api.delete('/carrinho/clear');
        return response.data;
    }

    return { get, add, update, remove, clear };
}

export default useCarrinho;