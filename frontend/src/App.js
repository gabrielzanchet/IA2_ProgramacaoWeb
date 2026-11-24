import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Produtos from './pages/produtos';
import Home from './pages/home';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/produtos' element={<Produtos/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
