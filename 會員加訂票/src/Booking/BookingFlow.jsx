import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
// --- API 接口與常數定義 (請根據您的後端配置修改 URL) ---
const API_BASE_URL = 'http://localhost:3001';

const MOVIES_API = `${API_BASE_URL}/api/movie/showing`; // (假設這個是正確的電影清單路由)
const SHOWTIMES_API = `${API_BASE_URL}/api/movie/showtimes`; // 修正：歸屬到 /api/movie
const TICKET_CLASSES_API = `${API_BASE_URL}/api/booking/ticketclass`; // 修正：歸屬到 /api/booking
const SEAT_CONDITION_API = `${API_BASE_URL}/api/booking/seatcondition/`; // 修正：歸屬到 /api/booking
const MEAL_MENU_API = `${API_BASE_URL}/api/booking/meals/menu`; // 修正：歸屬到 /api/booking

const CHECK_BALANCE_API = 'http://localhost:3001/api/member/balance/'; // (維持不變)
const FINAL_CHECKOUT_API = `${API_BASE_URL}/api/booking/create`; // (維持不變)
const LOGIN_API = `${API_BASE_URL}/api/member/login`; // (維持不變)


const MAX_TICKETS = 10;
const MAX_MEALS = 10;
// --------------------------------------------------------------------------------
// --- 元件 0: 電影與場次選擇 (MovieShowtimeSelection) ---
// --------------------------------------------------------------------------------
function MovieShowtimeSelection({ onNext }) {
    const [movies, setMovies] = React.useState([]);
    const [showtimes, setShowtimes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [selectedMovie, setSelectedMovie] = React.useState(null); 
    const [selectedDate, setSelectedDate] = React.useState(''); 
    const [selectedCinema, setSelectedCinema] = React.useState(''); 
    const [selectedShowingId, setSelectedShowingId] = React.useState(null);

    // 載入電影列表
    React.useEffect(() => {
        const loadMovies = async () => {
            try {
                const response = await axios.get(MOVIES_API);
                const data = response.data; 

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("API 回傳資料為空或格式錯誤");
                }
                
                setMovies(data);
                setIsLoading(false);
                
                if (data.length > 0 && !selectedMovie) {
                     setSelectedMovie(data[0]);
                }
            } catch (err) {
                console.error("無法載入電影列表:", err);
                setError(`連線失敗！請確認後端 ${MOVIES_API} 服務是否已啟動。`);
                setIsLoading(false);
            }
        };
        loadMovies();
    }, []);

    // 載入場次資訊 (當電影改變時)
    React.useEffect(() => {
        if (!selectedMovie) return;
        
        const loadShowtimes = async () => {
            setShowtimes([]);
            setSelectedDate('');
            setSelectedCinema('');
            setSelectedShowingId(null);
            
            try {
                const response = await axios.get(`${SHOWTIMES_API}?movieId=${selectedMovie.movieID}`);
                const data = response.data; 

                if (!Array.isArray(data) || data.length === 0) {
                     return; 
                }
                
                setShowtimes(data);
                
                const firstDate = data[0].showingDate;
                setSelectedDate(firstDate);

            } catch (err) {
                 setShowtimes([]); 
                 setSelectedDate('');
            }
        };
        loadShowtimes();
    }, [selectedMovie]);

    const uniqueDates = React.useMemo(() => {
        const dates = showtimes.map(s => s.showingDate);
        return [...new Set(dates)].sort();
    }, [showtimes]);
    
    const uniqueCinemas = React.useMemo(() => {
        const filteredByDate = showtimes.filter(s => s.showingDate === selectedDate);
        const cinemas = filteredByDate.map(s => ({ id: s.cinemaID, name: s.cinemaName }));
        const map = new Map(cinemas.map(c => [c.id, c]));
        return Array.from(map.values());
    }, [showtimes, selectedDate]);

    const filteredShowtimes = showtimes
        .filter(s => s.showingDate === selectedDate)
        .filter(s => !selectedCinema || s.cinemaID === selectedCinema);

    const handleNext = () => {
        if (!selectedShowingId) {
            alert("請選擇一個場次才能繼續！");
            return;
        }
        const selectedShowtimeDetails = showtimes.find(s => s.showingID === selectedShowingId);
        
        onNext({ 
            step: 'showtime', 
            data: { 
                showingId: selectedShowingId,
                movieName: selectedMovie.movieName,
                showtimeDetails: selectedShowtimeDetails
            } 
        });
    };
    
    if (isLoading) {
        return <div className="loading-state">正在載入電影列表...</div>;
    }

    if (error) {
         return <div className="error-message">{error}</div>; 
    }

    if (movies.length === 0) {
        return <div className="error-message">目前沒有上映電影資訊。</div>;
    }

    return (
        <div className="selection-container movie-showtime-selection">
            <h2>選擇電影與場次 (步驟 0)</h2>
            
            <div className="selection-section movie-select-container">
                <h3 className="section-title">選擇電影</h3>
                <div className="movie-carousel">
                    {movies.map(m => (
                        <div 
                            key={m.movieID}
                            className={`movie-card ${selectedMovie.movieID === m.movieID ? 'selected' : ''}`}
                            onClick={() => setSelectedMovie(m)}
                        >
                            <img src={m.movieImg} alt={m.movieName} className="movie-img"/>
                            <div className="movie-title">{m.movieName}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="selection-section filter-container">
                 <h3 className="section-title">選擇日期與影城</h3>
                 <div className="date-filter">
                    {uniqueDates.map(date => (
                        <button 
                            key={date}
                            className={`filter-btn ${selectedDate === date ? 'active' : ''}`}
                            onClick={() => {setSelectedDate(date); setSelectedShowingId(null);}}
                        >
                            {date.slice(5).replace('-', '/')}
                        </button>
                    ))}
                 </div>
                 <select 
                    className="cinema-select"
                    value={selectedCinema}
                    onChange={(e) => {setSelectedCinema(e.target.value); setSelectedShowingId(null);}}
                 >
                    <option value="">所有影城</option>
                    {uniqueCinemas.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
            </div>

            <div className="selection-section showtime-list-container">
                 <h3 className="section-title">場次列表</h3>
                 <div className="showtime-grid">
                    {filteredShowtimes.map(s => (
                        <div 
                            key={s.showingID}
                            className={`showtime-card ${selectedShowingId === s.showingID ? 'selected' : ''}`}
                            onClick={() => setSelectedShowingId(s.showingID)}
                        >
                            <div className="showtime-time">{s.startTime}</div>
                            <div className="showtime-details">
                                <span className="showtime-cinema">{s.cinemaName} - {s.theaterName}</span>
                                <span className="showtime-version">{s.versionName}</span>
                            </div>
                        </div>
                    ))}
                    {filteredShowtimes.length === 0 && (
                        <p style={{textAlign: 'center', gridColumn: '1 / -1', color: '#888'}}>所選條件下目前沒有場次。</p>
                    )}
                 </div>
            </div>

            <div className="summary final-selection-summary">
                <p className="step-info">已選電影: **{selectedMovie.movieName}** | 場次: **{filteredShowtimes.find(s => s.showingID === selectedShowingId)?.startTime || '尚未選擇'}**</p>
                <button 
                    className="checkout-button next-step-button"
                    onClick={handleNext}
                    disabled={!selectedShowingId}
                >
                    下一步：選擇票種及張數
                </button>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------
// --- 元件 1: 票種選擇 (TicketSelection) ---
// --------------------------------------------------------------------------------
function TicketSelection({ onNext,onUnauthorized }) {
    const [ticketCounts, setTicketCounts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const loadTickets = async () => {
            const token = localStorage.getItem('authToken'); // 手動讀取 Token
            try {
                const response = await axios.get(TICKET_CLASSES_API);
                const data = response.data; 

                if (!Array.isArray(data) || data.length === 0) {
                    setError("API 回傳資料為空或格式錯誤，請檢查後端數據。");
                    setIsLoading(false);
                    return; // 🎯 修正：不拋出錯誤，避免誤觸 catch 區塊
                }
                
                const initialCounts = data.map(t => ({
                    id: t.ticketClassID,   // 🎯 修正：使用正確的欄位名 ticketClassID
                    name: t.ticketClassName,
                    price: t.ticketClassPrice,
                    count: 0 
                }));

                setTicketCounts(initialCounts);
                setIsLoading(false);

            } catch (err) {
                console.error("無法載入票種資訊:", err);
                if (err.response && err.response.status === 401) {
                    if (onUnauthorized) {
                        onUnauthorized(); // 呼叫父元件的跳轉函式
                    }
                } else {
                    // 處理所有其他非 401 的錯誤 (例如網路斷線、500 伺服器錯誤等)
                    setError(`連線失敗！請確認後端 ${TICKET_CLASSES_API} 服務是否已啟動。`);
                    setIsLoading(false);
                }
            }
        };
        loadTickets();
    }, []);

    const totalTickets = ticketCounts.reduce((sum, t) => sum + t.count, 0);
    const totalPrice = ticketCounts.reduce((sum, t) => sum + (t.count * t.price), 0);
    
    const handleChangeCount = (ticketId, delta) => {
        setTicketCounts(prevCounts => {
            return prevCounts.map(t => {
                if (t.id === ticketId) {
                    const newCount = t.count + delta;
                    if (newCount < 0) return t; 
                    if (delta > 0 && totalTickets >= MAX_TICKETS) {
                         alert(`單次訂票最多 ${MAX_TICKETS} 張。`);
                         return t;
                    }
                    return { ...t, count: newCount };
                }
                return t;
            });
        });
    };

    const handleNext = () => {
        if (totalTickets === 0) {
            alert("請至少選擇一張電影票。");
            return;
        }
        const finalSelection = ticketCounts.filter(t => t.count > 0);
        onNext({ step: 'tickets', data: finalSelection, count: totalTickets, price: totalPrice });
    };

    if (isLoading) {
        return <div className="loading-state">載入票種資訊中...</div>;
    }
    
    if (error) {
         return <div className="error-message">{error}</div>;
    }

    return (
        <div className="selection-container">
            <h2>選擇票種及張數 (步驟 1)</h2>
            <div className="item-list ticket-list">
                {ticketCounts.map(ticket => (
                    <div key={ticket.id} className="item-row ticket-item">
                        <div className="item-info">
                            <span className="item-name">{ticket.name}</span>
                            <span className="item-price">${ticket.price}</span>
                        </div>
                        <div className="item-controls">
                            <button 
                                className="control-btn minus-btn"
                                onClick={() => handleChangeCount(ticket.id, -1)}
                                disabled={ticket.count === 0}
                            >-</button>
                            <span className="count-display">{ticket.count}</span>
                            <button 
                                className="control-btn plus-btn"
                                onClick={() => handleChangeCount(ticket.id, 1)}
                                disabled={totalTickets >= MAX_TICKETS}
                            >+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="summary ticket-summary">
                <p>總張數: <strong>{totalTickets}</strong> / {MAX_TICKETS} 張</p>
                <p className="total-display">總金額: <span className="total-price">${totalPrice}</span></p>
                <button 
                    className="checkout-button next-step-button"
                    onClick={handleNext}
                    disabled={totalTickets === 0}
                >
                    下一步：選擇座位
                </button>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------
// --- 元件 2: 座位選擇 (SeatSelection) ---
// --------------------------------------------------------------------------------

function Seat({ seat, onSelect }) {
    const isReserved = seat.seatEmpty === 0; 
    const isSelected = seat.status === 'selected';

    let className = 'seat';
    if (isReserved) {
        className += ' reserved';
    } else if (isSelected) {
        className += ' selected';
    } else {
        className += ' available';
    }

    const handleClick = () => {
        if (!isReserved) {
            onSelect(seat.seatNumber, isSelected);
        }
    };

    return (
        <div 
            className={className} 
            onClick={handleClick}
            title={isReserved ? '已預訂' : `${seat.seatNumber}`}
        >
        </div>
    );
}


function SeatSelection({ onNext, ticketCount = 2, showingId = 1 }) {
    const [seatsData, setSeatsData] = React.useState([]); 
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedSeats, setSelectedSeats] = React.useState([]);

    React.useEffect(() => {
        const loadSeats = async () => {
            try {
                const response = await axios.get(`${SEAT_CONDITION_API}${showingId}`);
                const data = response.data; 

                if (!Array.isArray(data) || data.length === 0) {
                     throw new Error("API 回傳資料為空或格式錯誤");
                }
                
                const initialSeats = data.map(s => ({
                    ...s,
                    status: s.seatEmpty === 0 ? 'reserved' : 'available' 
                }));

                setSeatsData(initialSeats);
                setIsLoading(false);

            } catch (err) {
                console.error("無法載入座位資訊:", err);
                setError(`連線失敗！請確認後端 ${SEAT_CONDITION_API}${showingId} 服務是否已啟動，並有座位數據。`);
                setIsLoading(false);
            }
        };
        loadSeats();
    }, [showingId]);

    const handleSeatSelect = (seatNumber, isCurrentlySelected) => {
        if (isCurrentlySelected) {
            setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
        } else {
            if (selectedSeats.length >= ticketCount) {
                alert(`您已選擇 ${ticketCount} 張票，無法選擇更多座位。`);
                return;
            }
            setSelectedSeats(prev => [...prev, seatNumber]);
        }
    };

    const processedSeatsData = seatsData.map(seat => {
        if (selectedSeats.includes(seat.seatNumber)) {
            return { ...seat, status: 'selected' };
        }
        return { ...seat, status: seat.seatEmpty === 0 ? 'reserved' : 'available' };
    });

    // 將一維的 seatsData 轉換為二維的 rowMap
    const seatMap = React.useMemo(() => {
        const map = {};
        processedSeatsData.forEach(seat => {
            const rowMatch = seat.seatNumber.match(/^([A-Z]+)/);
            const row = rowMatch ? rowMatch[1] : 'Unknown';
            if (!map[row]) {
                map[row] = [];
            }
            map[row].push(seat);
        });
        Object.keys(map).forEach(row => {
            map[row].sort((a, b) => {
                 const colA = parseInt(a.seatNumber.replace(/[^0-9]/g, ''));
                 const colB = parseInt(b.seatNumber.replace(/[^0-9]/g, ''));
                 return colA - colB;
            });
        });
        return map;
    }, [processedSeatsData]);


    const handleNext = () => {
        if (selectedSeats.length !== ticketCount) {
            alert(`請選擇剛好 ${ticketCount} 個座位才能繼續！`);
            return;
        }
        
        onNext({ 
            step: 'seats', 
            data: selectedSeats, 
            count: selectedSeats.length,
            seatString: selectedSeats.join(',') 
        });
    };

    if (isLoading) {
        return <div className="loading-state">載入影廳座位圖中...</div>;
    }

    if (error) {
         return <div className="error-message">{error}</div>;
    }

    return (
        <div className="selection-container seat-selection-container">
            <h2>選擇座位 (步驟 2)</h2>
            
            <p className="step-info">
                您已選擇 <strong>{ticketCount}</strong> 張票，請點擊選擇座位。
                (已選: {selectedSeats.length} 個座位)
            </p>

            <div className="screen">影廳銀幕在此</div>
            
            <div className="seat-map">
                {Object.keys(seatMap).map(row => (
                    <div key={row} className="seat-row">
                        <div className="row-label">{row}</div>
                        {seatMap[row].map(seat => (
                            <Seat 
                                key={seat.seatNumber}
                                seat={seat}
                                onSelect={handleSeatSelect}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="legend-container">
                 <div className="legend-item"><div className="seat available"></div> 可選</div>
                 <div className="legend-item"><div className="seat selected"></div> 已選</div>
                 <div className="legend-item"><div className="seat reserved"></div> 已訂</div>
            </div>

            <div className="summary seat-summary">
                <p>已選座位: <strong>{selectedSeats.length}</strong> / {ticketCount} 個</p>
                <p>座位號碼: {selectedSeats.join(', ') || '無'}</p>
                
                <button 
                    className="checkout-button next-step-button"
                    onClick={handleNext}
                    disabled={selectedSeats.length !== ticketCount}
                >
                    下一步：加購餐點
                </button>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------
// --- 元件 3: 餐點選擇 (MealSelection) ---
// --------------------------------------------------------------------------------
function MealSelection({ onNext, ticketCount = 2,onUnauthorized }) {
    const [categorizedMeals, setCategorizedMeals] = React.useState({});
    const [mealCounts, setMealCounts] = React.useState({}); 
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const loadMealMenu = async () => {
            try {
                const response = await axios.get(MEAL_MENU_API);
                const rawData = response.data; 
                
                if (!Array.isArray(rawData) || rawData.length === 0) {
                    // 如果數據為空或格式錯誤，我們只是顯示錯誤，不會跳轉登入頁
                    setError("資料庫中沒有餐點資訊。"); 
                    setIsLoading(false);
                    return; // 🎯 修正：不拋出錯誤，直接返回
                }

                const categorized = rawData.reduce((acc, meal) => {
                    const typeName = meal.MealsTypeName;
                    if (!acc[typeName]) acc[typeName] = [];
                    acc[typeName].push(meal);
                    return acc;
                }, {});

                const initialCounts = rawData.reduce((acc, meal) => {
                    acc[meal.mealsID] = 0;
                    return acc;
                }, {});

                setCategorizedMeals(categorized);
                setMealCounts(initialCounts);
                setIsLoading(false);

            } catch (err) {
                console.error("無法載入餐點菜單:", err);
                
                // 🎯 關鍵修正：確保只有明確的 401 狀態碼才觸發 onUnauthorized
                if (err.response && err.response.status === 401) {
                    if (onUnauthorized) {
                        onUnauthorized(); // 🚨 確認是 401 才跳轉
                    }
                } else {
                    // 處理所有其他類型的錯誤 (網路、500 伺服器錯誤、或其他非 401 錯誤)
                    setError(`連線失敗或伺服器錯誤：${err.message || '請確認後端服務已啟動。'}`);
                    setIsLoading(false);
                }
            }
        };
        loadMealMenu();
    }, [onUnauthorized]);

    const totalMealCount = Object.values(mealCounts).reduce((sum, count) => sum + count, 0);
    const totalMealPrice = Object.keys(mealCounts).reduce((sum, mealId) => {
        const meal = Object.values(categorizedMeals).flat().find(m => m.mealsID === mealId);
        return sum + (mealCounts[mealId] * parseFloat(meal?.mealsPrice || 0));
    }, 0);

    const handleChangeCount = (mealId, delta) => {
        setMealCounts(prevCounts => {
            const newCount = prevCounts[mealId] + delta;
            if (newCount < 0) return prevCounts;
            if (delta > 0 && totalMealCount >= MAX_MEALS) {
                 alert(`單次訂購最多 ${MAX_MEALS} 份餐點。`);
                 return prevCounts;
            }
            return { ...prevCounts, [mealId]: newCount };
        });
    };

    const handleNext = () => {
        const selectedMeals = Object.keys(mealCounts)
            .filter(mealId => mealCounts[mealId] > 0)
            .map(mealId => ({
                id: mealId,
                count: mealCounts[mealId],
                ...Object.values(categorizedMeals).flat().find(m => m.mealsID === mealId)
            }));

        onNext({ step: 'meals', data: selectedMeals, count: totalMealCount, price: totalMealPrice });
    };

    if (isLoading) {
        return <div className="loading-state">載入餐點菜單中...</div>;
    }
    
    if (error) {
         return <div className="error-message">{error}</div>;
    }

    return (
        <div className="selection-container">
            <h2>加購餐點 (步驟 3)</h2>
            <p className="step-info">您已選擇 {ticketCount} 張電影票，歡迎加購！</p>
            
            {Object.keys(categorizedMeals).map(category => (
                <div key={category} className="meal-category">
                    <h3 className="category-title">{category}</h3>
                    <div className="item-list meal-list">
                        {categorizedMeals[category].map(meal => (
                            <div key={meal.mealsID} className="item-row meal-item">
                                <img src={meal.mealsPhoto} alt={meal.mealsName} className="meal-img"/>
                                <div className="item-details">
                                    <span className="item-name">{meal.mealsName}</span>
                                    <span className="item-price">${meal.mealsPrice}</span>
                                </div>
                                <div className="item-controls">
                                    <button 
                                        className="control-btn minus-btn"
                                        onClick={() => handleChangeCount(meal.mealsID, -1)}
                                        disabled={mealCounts[meal.mealsID] === 0}
                                    >-</button>
                                    <span className="count-display">{mealCounts[meal.mealsID] || 0}</span>
                                    <button 
                                        className="control-btn plus-btn"
                                        onClick={() => handleChangeCount(meal.mealsID, 1)}
                                        disabled={totalMealCount >= MAX_MEALS}
                                    >+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="summary meal-summary">
                <p>已選購餐點: <strong>{totalMealCount}</strong> / {MAX_MEALS} 份</p>
                <p className="total-display">餐點總金額: <span className="total-price">${totalMealPrice.toFixed(0)}</span></p>
                <button 
                    className="checkout-button next-step-button"
                    onClick={handleNext}
                >
                    繼續：確認訂單並結帳
                </button>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------
// --- 元件 5: 會員登入檢查 (LoginChecker) ---
// --------------------------------------------------------------------------------
function LoginChecker({ onLoginSuccess, onCancel }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('請輸入會員帳號和密碼。');
            return;
        }

        setIsLoading(true);
        setError(null);

        let success = false; // 🎯 修正點 A: 設置一個成功標誌

        try {
            const response = await axios.post(LOGIN_API, {
                email: email, 
                password: password 
            });

            if (response.data.success && response.data.memberID) {
                // 🎯 關鍵修正：登入成功時，呼叫 onLoginSuccess (它會在父元件中觸發跳轉)
                onLoginSuccess(response.data.memberID); 
                success = true; // 🎯 修正點 B: 標記成功，並讓程式碼從這裡結束
            } else {
                setError(response.data.message || '帳號或密碼錯誤。');
            }
        } catch (err) {
            console.error('登入連線錯誤:', err);
            setError(`連線失敗！請確認後端 ${LOGIN_API} 服務是否已啟動。`);
        }
        finally {
        // 🎯 關鍵修正 B: 只有在登入失敗 (success === false) 時，才解除載入狀態
        // 如果成功，父元件的跳轉會直接導致此元件卸載，不需要解除載入
            if (!success) {
                setIsLoading(false);
            }
        }
    };
    return (
        <div className="selection-container login-checker-container">
            <h2>會員登入</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="login-form">
                <input
                    type="email"
                    placeholder="會員帳號 (Email)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pay-input"
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="會員密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pay-input"
                    disabled={isLoading}
                />
            </div>

            <button 
                className="checkout-button next-step-button"
                onClick={handleLogin}
                disabled={isLoading}
                style={{marginTop: '20px'}}
            >
                {isLoading ? '登入中...' : '確認登入並繼續結帳'}
            </button>
            <button 
                className="checkout-button secondary-button"
                onClick={onCancel}
                disabled={isLoading}
                style={{marginTop: '10px', backgroundColor: '#aaa'}}
            >
                取消訂票
            </button>
        </div>
    );
}


// --------------------------------------------------------------------------------
// --- 元件 4: 付款選擇 (PaymentSelection) ---
// --------------------------------------------------------------------------------

function PaymentSelection({ bookingData, memberId, onCheckoutSuccess }) {
    const grandTotal = (bookingData.tickets?.price || 0) + (bookingData.meals?.price || 0);

    const [selectedPayWay, setSelectedPayWay] = React.useState('creditCard'); 
    const [cashCardBalance, setCashCardBalance] = React.useState(null); 
    const [accountInput, setAccountInput] = React.useState(''); 
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [error, setError] = React.useState(null);


    const isCashCard = selectedPayWay === 'cashCard';

    const PAYMENT_OPTIONS = [
        { id: 'creditCard', name: '信用卡/金融卡', requiresInput: true },
        { id: 'cashCard', name: '威秀儲值卡 (iShow Card)', requiresInput: false },
        { id: 'linePay', name: 'Line Pay', requiresInput: false },
    ];
    
    // 檢查儲值卡餘額 (B28)
    React.useEffect(() => {
        if (isCashCard) {
            const checkBalance = async () => {
                setError(null);
                try {
                    const response = await axios.get(`${CHECK_BALANCE_API}${memberId}`);
                    const balance = response.data.balance || 0; 
                    setCashCardBalance(balance);

                } catch (err) {
                    setError(`無法查詢儲值卡餘額。連線失敗，假設餘額為 0。`);
                    setCashCardBalance(0); 
                }
            };
            checkBalance();
        } else {
            setCashCardBalance(null);
        }
    }, [isCashCard, memberId]);


    // 處理最終的訂單送出 (B31)
    const handleFinalCheckout = async () => {
        if (isProcessing) return;
        
        if (isCashCard && cashCardBalance !== null && cashCardBalance < grandTotal) {
            alert('儲值卡餘額不足，請選擇其他付款方式或儲值。');
            return;
        }

        if (selectedPayWay === 'creditCard' && accountInput.length < 14) {
            alert('請輸入有效的付款帳號 (至少 14 位數字)。');
            return;
        }

        if (!confirm(`確認送出訂單並支付 $${grandTotal.toFixed(0)} 元嗎？`)) {
             return;
        }

        setIsProcessing(true);

        try {
            const orderPayload = {
                memberID: memberId,
                
                // 🎯 修正點：從 .data 屬性中提取 showingId
                showingID: bookingData.showtime.data.showingId, 

                seats: bookingData.seats.seatString, 
                chooseMeal: bookingData.meals.data.map(m => `${m.mealsName}(${m.count})`).join(','), 
                ticketTypeID: bookingData.tickets.data[0].ticketTypeID || 1, 
                ticketNums: bookingData.tickets.count,
                totalPrice: grandTotal,
            };

            const response = await axios.post(FINAL_CHECKOUT_API, orderPayload);

            if (response.data.success) {
                // B29, B30: 產生並顯示行動電影票
                onCheckoutSuccess({
                    orderNumber: response.data.orderNumber || 'ORD-2025XXXX',
                    getTicketNum: response.data.getTicketNum || 99887,
                    total: grandTotal
                });
            } else {
                alert(`付款失敗: ${response.data.message || '後端處理錯誤。'}`);
            }
        } catch (error) {
            alert('連線失敗或交易錯誤，請稍後再試。');
        } finally {
            setIsProcessing(false);
        }
    };

    const ticketPrice = bookingData.tickets?.price || 0;
    const mealPrice = bookingData.meals?.price || 0;

    return (
        <div className="selection-container payment-selection-container">
            <h2>最終確認與付款 (步驟 4)</h2>
            
            {error && <div className="error-message">{error}</div>}
            <p className="step-info" style={{color: '#ff6600'}}>當前會員 ID: **{memberId}**</p>

            <div className="summary-details">
                <h3>訂單內容摘要</h3>
                <p>電影: **{bookingData.showtime?.movieName}**</p>
                <p>場次: {bookingData.showtime?.showtimeDetails?.startTime} ({bookingData.showtime?.showtimeDetails?.cinemaName})</p>
                <p>座位: **{bookingData.seats?.seatString}** ({bookingData.seats?.count} 張)</p>
                <p>餐點: {bookingData.meals?.count > 0 ? `${bookingData.meals?.count} 份` : '無加購'}</p>
            </div>

            <div className="payment-options-group">
                <h3>選擇付款方式 (B23)</h3>
                <div className="payment-list">
                    {PAYMENT_OPTIONS.map(option => (
                        <div 
                            key={option.id} 
                            className={`payment-option-card ${selectedPayWay === option.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPayWay(option.id)}
                        >
                            {option.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="payment-input-area">
                {isCashCard && (
                    <div className="cashcard-status">
                        <p>儲值卡餘額: <span style={{fontWeight: 'bold', color: cashCardBalance < grandTotal ? 'red' : 'green'}}>${cashCardBalance !== null ? cashCardBalance : '查詢中...'}</span></p>
                        {cashCardBalance !== null && cashCardBalance < grandTotal && <p className="error-message small-error">餘額不足！</p>}
                    </div>
                )}
                
                {selectedPayWay === 'creditCard' && (
                    <input
                        type="text"
                        placeholder="請輸入信用卡號/銀行帳戶 (模擬 B26)"
                        value={accountInput}
                        onChange={(e) => setAccountInput(e.target.value)}
                        className="pay-input"
                        maxLength="16"
                    />
                )}
            </div>

            <div className="summary final-checkout-summary">
                <p>票價總額: ${ticketPrice}</p>
                <p>餐點總額: ${mealPrice.toFixed(0)}</p>
                <h3 className="grand-total-display">
                    最終支付金額: ${grandTotal.toFixed(0)}
                </h3>
                
                <button 
                    className="checkout-button next-step-button"
                    onClick={handleFinalCheckout}
                    disabled={isProcessing || (isCashCard && cashCardBalance !== null && cashCardBalance < grandTotal)}
                >
                    {isProcessing ? '處理中...' : `確認並支付 $${grandTotal.toFixed(0)}`}
                </button>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------
// --- 訂單完成頁 (ConfirmationPage) ---
// --------------------------------------------------------------------------------

function ConfirmationPage({ orderInfo }) {
    return (
        <div className="selection-container confirmation-page">
            <h2>🎉 訂票成功！ (B30)</h2>
            <div className="summary-details">
                <p>訂單編號: <strong>{orderInfo.orderNumber}</strong></p>
                <p><strong>取票序號:</strong> <span className="ticket-num-display">{orderInfo.getTicketNum}</span></p>
                <p>支付金額: ${orderInfo.total.toFixed(0)}</p>
                <p style={{marginTop: '20px'}}>請憑此序號至現場取票機領取實體票券。</p>
            </div>
            <button 
                className="checkout-button next-step-button"
                onClick={() => window.location.reload()}
            >
                完成，返回首頁
            </button>
        </div>
    );
}

// --------------------------------------------------------------------------------
// --- 主應用程式流程 (Main Booking Flow) ---
// --------------------------------------------------------------------------------

function BookingFlow() {
    React.useEffect(() => {
    // 嘗試從 Local Storage 讀取會員資訊
        const storedUser = localStorage.getItem('memberUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // 假設 memberUser 儲存了 memberID
                if (user && user.memberID) {
                    setMemberId(user.memberID);
                }
            } catch (e) {
                console.error("解析會員資訊失敗", e);
            }
        }
    }, []);
    const [currentStep, setCurrentStep] = React.useState('showtime');
    const [bookingData, setBookingData] = React.useState({});
    const [orderConfirmation, setOrderConfirmation] = React.useState(null); 
    const [memberId, setMemberId] = React.useState(null); // 儲存已登入的會員ID
    
    const handleUnauthorizedError = () => {
        // 這是最終的解決方案：將流程切換回 'login' 步驟
        setCurrentStep('login'); 
        alert('您的登入狀態已過期，請重新登入以完成結帳。');
    };
    // --- 流程推進函式 ---
    const handleNextStep = (data) => {
        const { step, ...stepData } = data;
        setBookingData(prev => ({ ...prev, [step]: stepData }));
        
        // 流程控制：根據當前步驟跳轉到下一個步驟的名稱
        if (step === 'showtime') {
            setCurrentStep('tickets'); 
        } else if (step === 'tickets') {
            setCurrentStep('seats'); 
        } else if (step === 'seats') {
            setCurrentStep('meals');
        } else if (step === 'meals') {
             if (memberId) {
            // ✅ 如果已經有會員 ID (代表已登入或已通過驗證)
            setCurrentStep('payment'); // ➡️ 直接跳轉到付款頁面
            } else {
            // ❌ 如果沒有會員 ID (代表未登入)
            setCurrentStep('login'); // ➡️ 強制跳轉到登入檢查介面
            } 
        }
        // 注意：'login' 步驟的跳轉邏輯在 handleLoginSuccess 中處理
    };
    
    // --- 登入成功後處理 ---
    const handleLoginSuccess = (id) => {
        // 🎯 修正登入跳轉失敗的關鍵邏輯
        setMemberId(id); // 1. 儲存 member ID
        setCurrentStep('payment'); // 2. 直接跳轉到付款頁面
    };

    const handleCancelBooking = () => {
        alert('訂票已取消，返回首頁。');
        window.location.reload();
    };

    const handleCheckoutSuccess = (orderInfo) => {
        setOrderConfirmation(orderInfo);
        setCurrentStep('confirmation');
    };


    let ComponentToRender;
    
    const ticketCount = bookingData.tickets ? bookingData.tickets.count : 2; 
    const showingId = bookingData.showtime ? bookingData.showtime.showingId : 1; 

    // --- 流程渲染邏輯 (修正了「未知的流程步驟」錯誤) ---
    
    if (currentStep === 'showtime') { 
        ComponentToRender = <MovieShowtimeSelection onNext={handleNextStep} />;
    } else if (currentStep === 'tickets') {
        ComponentToRender = <TicketSelection onNext={handleNextStep} onUnauthorized={handleUnauthorizedError} />;
    } else if (currentStep === 'seats') {
        ComponentToRender = <SeatSelection 
            onNext={handleNextStep} 
            ticketCount={ticketCount}
            showingId={showingId}
        />;
    } else if (currentStep === 'meals') {
        ComponentToRender = <MealSelection onNext={handleNextStep} ticketCount={ticketCount} onUnauthorized={handleUnauthorizedError} />;
    } 
    // -----------------------------------------------------------
    // 👇 會員/付款/確認的渲染區塊
    else if (currentStep === 'login') {
        ComponentToRender = <LoginChecker 
            onLoginSuccess={handleLoginSuccess} // 傳遞跳轉函式
            onCancel={handleCancelBooking}
            // 由於 handleLoginSuccess 負責跳轉，此處不再需要 onNextStep 參數
        />;
    } else if (currentStep === 'payment') {
        ComponentToRender = <PaymentSelection 
            bookingData={bookingData} 
            memberId={memberId} 
            onCheckoutSuccess={handleCheckoutSuccess}
        />;
    } else if (currentStep === 'confirmation') {
        ComponentToRender = <ConfirmationPage orderInfo={orderConfirmation} />;
    } else {
        // 流程狀態未匹配，顯示錯誤
        ComponentToRender = <div>未知的流程步驟。</div>; 
    }

    return (
        <div className="main-booking-flow">
            {ComponentToRender}
        </div>
    );
    
}



// ... (請確保 export default BookingFlow; 仍在檔案最末端)

// 渲染根元件
//const root = ReactDOM.createRoot(document.getElementById('root'));
//root.render(<BookingFlow />);
export default BookingFlow;