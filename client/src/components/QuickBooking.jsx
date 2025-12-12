import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuickBooking.css'; // 樣式檔

function QuickBooking() {
    const navigate = useNavigate();
    
    // 選項資料
    const [cinemas, setCinemas] = useState([]);
    const [movies, setMovies] = useState([]);
    const [dates, setDates] = useState([]);
    const [times, setTimes] = useState([]);

    // 使用者選擇的狀態
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedShowing, setSelectedShowing] = useState('');

    // 1. 初始化：載入影城
    useEffect(() => {
        axios.get('http://localhost:3001/api/booking/options/cinemas')
            .then(res => setCinemas(res.data))
            .catch(err => console.error(err));
    }, []);

    // 2. 選影城 -> 載入電影
    useEffect(() => {
        setMovies([]); setDates([]); setTimes([]);
        setSelectedMovie(''); setSelectedDate(''); setSelectedShowing('');
        
        if (selectedCinema) {
            axios.get(`http://localhost:3001/api/booking/options/movies?cinemaID=${selectedCinema}`)
                .then(res => setMovies(res.data));
        }
    }, [selectedCinema]);

    // 3. 選電影 -> 載入日期
    useEffect(() => {
        setDates([]); setTimes([]);
        setSelectedDate(''); setSelectedShowing('');

        if (selectedCinema && selectedMovie) {
            axios.get(`http://localhost:3001/api/booking/options/dates?cinemaID=${selectedCinema}&movieID=${selectedMovie}`)
                .then(res => setDates(res.data));
        }
    }, [selectedMovie]);

    // 4. 選日期 -> 載入時間
    useEffect(() => {
        setTimes([]);
        setSelectedShowing('');

        if (selectedCinema && selectedMovie && selectedDate) {
            axios.get(`http://localhost:3001/api/booking/options/times?cinemaID=${selectedCinema}&movieID=${selectedMovie}&showDate=${selectedDate}`)
                .then(res => setTimes(res.data));
        }
    }, [selectedDate]);

    // 送出按鈕
    const handleBooking = () => {
        if (!selectedShowing) {
            alert("請完整選擇訂票資訊");
            return;
        }
        // 跳轉到選位頁面 (假設您的選位頁面是 /booking，並帶上場次ID)
        // 您之後要在 Booking 頁面接收這個 showingID 來撈座位
        navigate(`/booking/rule?showingID=${selectedShowing}`);
        // 或是如果你還沒做 booking 頁面，可以先 alert 測試
        // alert(`跳轉到訂票頁，場次ID: ${selectedShowing}`);
    };

    return (
        <div className="quick-booking-bar">
            <div className="qb-header">
                <h3>快速訂票</h3>
                <span>QUICK BOOKING</span>
            </div>
            
            <div className="qb-controls">
                {/* 影城下拉 */}
                <div className="qb-group">
                    <label>選擇影城</label>
                    <select value={selectedCinema} onChange={e => setSelectedCinema(e.target.value)}>
                        <option value="">請選擇影城</option>
                        {cinemas.map(c => <option key={c.cinemaID} value={c.cinemaID}>{c.cinemaName}</option>)}
                    </select>
                </div>

                {/* 電影下拉 */}
                <div className="qb-group">
                    <label>選擇電影</label>
                    <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)} disabled={!selectedCinema}>
                        <option value="">請選擇影片</option>
                        {movies.map(m => <option key={m.movieID} value={m.movieID}>{m.movieName}</option>)}
                    </select>
                </div>

                {/* 日期下拉 */}
                <div className="qb-group">
                    <label>選擇日期</label>
                    <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} disabled={!selectedMovie}>
                        <option value="">請選擇日期</option>
                        {dates.map(d => <option key={d.showingDate} value={d.showingDate}>{d.showingDate}</option>)}
                    </select>
                </div>

                {/* 場次下拉 */}
                <div className="qb-group">
                    <label>選擇場次</label>
                    <select value={selectedShowing} onChange={e => setSelectedShowing(e.target.value)} disabled={!selectedDate}>
                        <option value="">請選擇場次</option>
                        {times.map(t => <option key={t.showingID} value={t.showingID}>{t.startTime}</option>)}
                    </select>
                </div>

                <button className="qb-btn" onClick={handleBooking}>前往訂票</button>
            </div>
        </div>
    );
}

export default QuickBooking;