import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.history.pushState({}, '', '/');
  window.alert = jest.fn();
});

test('renderiza a Home e a navbar', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument();
});

test('navega para a página de produtos', () => {
  render(<App />);
  userEvent.click(screen.getByRole('link', { name: 'Produtos' }));
  expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
});

test('não cadastra produto sem nome ou sem preço', () => {
  window.history.pushState({}, '', '/produtos');
  render(<App />);

  userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  expect(window.alert).toHaveBeenCalledWith('O campo nome é obrigatório');

  userEvent.type(screen.getByPlaceholderText('Nome do Produto'), 'Mouse');
  userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  expect(window.alert).toHaveBeenCalledWith('O campo preço é obrigatório');

  expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
});

test('cadastra produto válido e limpa o formulário', () => {
  window.history.pushState({}, '', '/produtos');
  render(<App />);

  userEvent.type(screen.getByPlaceholderText('Nome do Produto'), 'Mouse');
  userEvent.type(screen.getByPlaceholderText('Preço do Produto'), '50.5');
  userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

  expect(window.alert).not.toHaveBeenCalled();
  expect(screen.getByText('Mouse')).toBeInTheDocument();
  expect(screen.getByText('R$ 50,50')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Nome do Produto')).toHaveValue('');
  expect(screen.getByPlaceholderText('Preço do Produto')).toHaveValue(null);
});
