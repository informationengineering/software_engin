// client/src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          VIESHOW <span>CINEMAS</span>
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">首頁</Link>
          </li>
          <li className="nav-item">
            <Link to="/cinemas" className="nav-links">全台影城</Link>
          </li>
          
          {/* 👇 修改這裡：變成下拉選單容器 */}
          <li className="nav-item dropdown">
            <span className="nav-links" style={{cursor: 'default'}}>電影介紹 ▾</span>
            
            {/* 下拉內容 */}
            <ul className="dropdown-menu">
              <li>
                <Link to="/movies/now" className="dropdown-link">熱售中</Link>
              </li>
              <li>
                <Link to="/movies/coming" className="dropdown-link">即將上映</Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;