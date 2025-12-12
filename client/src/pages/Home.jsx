// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link, useNavigate } from 'react-router-dom';

// 1. 引入快速訂票元件 (請確保檔案已建立)
import QuickBooking from '../components/QuickBooking';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../index.css'; 

function Home() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/movie/all');
                const allMovies = res.data;
                const today = new Date();

                // 只保留上映日期 <= 今天的電影 (熱售中)
                const nowShowing = allMovies.filter(m => new Date(m.movieStart) <= today);

                setMovies(nowShowing);
                setLoading(false);
            } catch (error) {
                console.error("抓取資料失敗:", error);
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    const getImgSrc = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/${path}`; 
    };

    if (loading) return <div style={{color:'white', padding:'50px', textAlign:'center'}}>載入中...</div>;

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', paddingBottom: '50px' }}>
            {/* 輪播圖區域 */}
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                loop={true}
                autoplay={{ delay: 5000 }}
                navigation
                pagination={{ clickable: true }}
                // 設定高度 (可視需求調整)
                style={{ height: 'calc(100vh - 80px)', width: '100%' }}
            >
                {movies.map((item) => (
                    <SwiperSlide key={item.movieID}>
                        <div className="slide-content" style={styles.slideContent}>
                            
                            {/* 背景層 */}
                            <div 
                                className="slide-bg" 
                                style={{
                                    ...styles.slideBg,
                                    backgroundImage: `url('${getImgSrc(item.movieImg)}')`
                                }}
                            ></div>

                            {/* 前景海報 */}
                            <img 
                                src={getImgSrc(item.movieImg)} 
                                alt={item.movieName} 
                                onClick={() => navigate(`/detail/${item.movieID}`)}
                                style={{
                                    ...styles.slidePoster,
                                    cursor: 'pointer'
                                }} 
                            />

                            <div style={styles.slideInfo}>
                                <h2 style={styles.movieTitle}>{item.movieName}</h2>
                                <p style={styles.movieDate}>{item.movieStart} 上映</p>
                            </div>

                            <div style={styles.bookingOverlay}>
                                <span style={styles.bookingLink}>▫ 安裝官方APP訂票</span>
                                <Link to={`/detail/${item.movieID}`} style={styles.bookingLink}>
                                    ▫ 官網線上訂票
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* 2. 加入快速訂票區塊 */}
            {/* 放在 Swiper 下面，CSS 的負 margin 會讓它往上疊一點點，製造層次感 */}
            <div style={{ position: 'relative', zIndex: 20 }}>
                <QuickBooking />
            </div>

        </div>
    );
}

const styles = {
    slideContent: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    slideBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(20px) brightness(0.6)',
        zIndex: 1,
    },
    slidePoster: {
        position: 'relative',
        zIndex: 2,
        height: '85%',
        width: 'auto',
        maxWidth: '90%',
        objectFit: 'contain',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        borderRadius: '12px',
    },
    slideInfo: {
        position: 'absolute',
        bottom: '40px',
        left: '50px',
        zIndex: 10,
        textShadow: '0 2px 5px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
        textAlign: 'left',
    },
    movieTitle: {
        color: '#fff',
        fontSize: '3.5rem',
        margin: 0,
        fontStyle: 'italic',
        fontWeight: 900,
    },
    movieDate: {
        color: '#ddd',
        fontSize: '1.5rem',
        margin: '10px 0 0 0',
        fontWeight: 'bold',
    },
    bookingOverlay: {
        position: 'absolute',
        bottom: '50px',
        right: '50px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px 15px',
        borderRadius: '6px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '140px',
    },
    bookingLink: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'block',
    }
};

export default Home;