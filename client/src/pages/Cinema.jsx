// client/src/pages/Cinema.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 引入跳轉功能
import './Cinema.css'; 

function Cinema() {
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // 初始化

    useEffect(() => {
        // 抓取後端影城資料
        axios.get('http://localhost:3001/api/movie/cinemas')
            .then(res => {
                setCinemas(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("影城資料讀取失敗", err);
                setLoading(false);
            });
    }, []);

    // 處理圖片路徑
    const getImgSrc = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/${path}`; 
    };

    if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>載入中...</div>;

    return (
        <div className="cinema-container">
            <h1 className="page-title">全台影城據點</h1>
            
            <div className="cinema-grid">
                {cinemas.map(cinema => (
                    <div 
                        className="cinema-card" 
                        key={cinema.cinemaID}
                        // 1. 點擊卡片 -> 跳轉到影城詳細頁 (CinemaDetail)
                        onClick={() => navigate(`/cinema/${cinema.cinemaID}`)}
                        style={{cursor: 'pointer'}} // 滑鼠變手指
                    >
                        {/* 圖片 */}
                        <div className="cinema-img-box">
                            <img src={getImgSrc(cinema.cinemaImg)} alt={cinema.cinemaName} />
                        </div>
                        
                        {/* 資訊 */}
                        <div className="cinema-info">
                            <h3>{cinema.cinemaName}</h3>
                            
                            <div className="cinema-detail-row">
                                <i>📍</i>
                                <span>{cinema.cinemaAddress}</span>
                            </div>
                            
                            <div className="cinema-detail-row">
                                <i>📞</i>
                                <span>{cinema.cinemaTele}</span>
                            </div>

                            {/* Google Map 按鈕 */}
                            {/* 注意：這裡要阻止冒泡 (stopPropagation)，避免點了按鈕卻觸發卡片跳轉 */}
                            <a 
                                href={cinema.googleMap} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="map-link"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                查看地圖
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Cinema;