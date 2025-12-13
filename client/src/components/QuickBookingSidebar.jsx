// client/src/components/QuickBookingSidebar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuickBookingSidebar.css'; // 樣式檔

function QuickBookingSidebar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // 控制彈出視窗開關
    
    // 選項資料
    const [cinemas, setCinemas] = useState([]);
    const [movies, setMovies] = useState([]);
    const [dates, setDates] = useState([]);
    const [times, setTimes] = useState([]);

    // 使用者選擇
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedShowing, setSelectedShowing] = useState('');

    // === 資料連動邏輯 (跟首頁一樣) ===
    useEffect(() => {
        if (isOpen) { // 只有打開時才去抓資料，節省資源
            axios.get('http://localhost:3001/api/booking/options/cinemas')
                .then(res => setCinemas(res.data))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    useEffect(() => {
        setMovies([]); setDates([]); setTimes([]);
        setSelectedMovie(''); setSelectedDate(''); setSelectedShowing('');
        if (selectedCinema) {
            axios.get(`http://localhost:3001/api/booking/options/movies?cinemaID=${selectedCinema}`)
                .then(res => setMovies(res.data));
        }
    }, [selectedCinema]);

    useEffect(() => {
        setDates([]); setTimes([]);
        setSelectedDate(''); setSelectedShowing('');
        if (selectedCinema && selectedMovie) {
            axios.get(`http://localhost:3001/api/booking/options/dates?cinemaID=${selectedCinema}&movieID=${selectedMovie}`)
                .then(res => setDates(res.data));
        }
    }, [selectedMovie]);

    useEffect(() => {
        setTimes([]);
        setSelectedShowing('');
        if (selectedCinema && selectedMovie && selectedDate) {
            axios.get(`http://localhost:3001/api/booking/options/times?cinemaID=${selectedCinema}&movieID=${selectedMovie}&showDate=${selectedDate}`)
                .then(res => setTimes(res.data));
        }
    }, [selectedDate]);

    const handleBooking = () => {
        if (!selectedShowing) {
            alert("請完整選擇訂票資訊");
            return;
        }
        // 跳轉到規則頁
        navigate(`/booking/rule?showingID=${selectedShowing}`);
    };

    return (
        <>
            {/* 1. 側邊懸浮按鈕 */}
            <div className="sidebar-btn" onClick={() => setIsOpen(true)}>
                快速訂票
            </div>

            {/* 2. 彈出視窗 (Modal) */}
            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    {/* 點擊內容不關閉 */}
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <h3>快速訂票 <span>QUICK BOOKING</span></h3>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="qb-group">
                                <label>選擇影城</label>
                                <select value={selectedCinema} onChange={e => setSelectedCinema(e.target.value)}>
                                    <option value="">請選擇影城</option>
                                    {cinemas.map(c => <option key={c.cinemaID} value={c.cinemaID}>{c.cinemaName}</option>)}
                                </select>
                            </div>

                            <div className="qb-group">
                                <label>選擇電影</label>
                                <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)} disabled={!selectedCinema}>
                                    <option value="">請選擇影片</option>
                                    {movies.map(m => <option key={m.movieID} value={m.movieID}>{m.movieName}</option>)}
                                </select>
                            </div>

                            <div className="qb-group">
                                <label>選擇日期</label>
                                <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} disabled={!selectedMovie}>
                                    <option value="">請選擇日期</option>
                                    {dates.map(d => <option key={d.showingDate} value={d.showingDate}>{d.showingDate}</option>)}
                                </select>
                            </div>

                            <div className="qb-group">
                                <label>選擇場次</label>
                                <select value={selectedShowing} onChange={e => setSelectedShowing(e.target.value)} disabled={!selectedDate}>
                                    <option value="">請選擇場次</option>
                                    {times.map(t => <option key={t.showingID} value={t.showingID}>{t.startTime}</option>)}
                                </select>
                            </div>

                            <button className="qb-btn-modal" onClick={handleBooking}>
                                前往訂票
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default QuickBookingSidebar;