// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // 1. 引入 Navbar
import Home from './pages/Home';
import Detail from './pages/Detail';
import Cinema from './pages/Cinema';
import CinemaDetail from './pages/CinemaDetail';
import MovieList from './pages/MovieList';
import BookingRule from './pages/BookingRule';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/cinemas" element={<Cinema />} />
        <Route path="/cinema/:id" element={<CinemaDetail />} />
        
        {/* 👇 修改這裡：增加兩個路徑，都指向 MovieList，但用 type 區分 */}
        <Route path="/movies/now" element={<MovieList type="now" />} />
        <Route path="/movies/coming" element={<MovieList type="coming" />} />
        
        {/* 舊的可以拿掉或留著導向熱售 */}
        <Route path="/movies" element={<MovieList type="now" />} />
        <Route path="/booking/rule" element={<BookingRule />} />
        <Route path="/booking/seat" element={<div style={{color:'white', padding:'100px', textAlign:'center'}}>這裡是選位頁面 (開發中)</div>} />
      </Routes>
    </>
  );
}

export default App;