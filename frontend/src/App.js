import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Produtos from './pages/produtos';
import Home from './pages/home';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Navigate to='/home' replace/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/produtos' element={<Produtos/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;