import './App.css';
import { Nav, Navbar } from 'react-bootstrap';
import { Link, Route, Routes } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Users from './Users';

function App() {
  return (
    <div className='App'>
      <Navbar bg='primary' variant='dark'>
        <Navbar.Brand>Navbar</Navbar.Brand>
        <Nav className='me-auto'>
          <Nav.Link>
            <Link to='/'>Home</Link>
          </Nav.Link>
          <Nav.Link>
            <Link to='/about'>About</Link>
          </Nav.Link>
          <Nav.Link>
            <Link to='/users'>Users</Link>
          </Nav.Link>
        </Nav>
      </Navbar>
      <Routes>
        <Route element={<About />} path='/about' />
        <Route element={<Users />} path='/users' />
        <Route element={<Home />} path='/' />
      </Routes>
    </div>
  );
}

export default App;