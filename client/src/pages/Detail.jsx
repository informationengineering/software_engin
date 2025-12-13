// client/src/pages/Detail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Detail.css';
import QuickBookingSidebar from '../components/QuickBookingSidebar'; 

function Detail() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. 抓取資料
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movieRes, cinemaRes] = await Promise.all([
                    axios.get(`http://localhost:3001/api/movie/detail/${id}`),
                    axios.get('http://localhost:3001/api/movie/cinemas')
                ]);
                
                setMovie(movieRes.data);
                setCinemas(cinemaRes.data);
                setLoading(false);
            } catch (error) {
                console.error("讀取失敗:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getImgSrc = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/${path}`; 
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes("/embed/")) return url;
        let videoId = "";
        if (url.includes("v=")) videoId = url.split('v=')[1].split('&')[0];
        else if (url.includes("youtu.be/")) videoId = url.split('youtu.be/')[1].split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    const getGradeName = (id) => {
        const map = { 1: "普遍級", 2: "保護級", 3: "輔12級", 4: "輔15級", 5: "限制級" };
        return map[id] || "普遍級";
    };

    const getTypeName = (id) => {
        const map = { 1: "動作", 2: "愛情", 3: "科幻", 4: "恐怖", 5: "動畫", 6: "劇情" };
        return map[id] || "精選電影";
    };

    if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>載入中...</div>;
    if (!movie) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>找不到電影資料</div>;

    return (
        // 👇 修改：背景改為 #000 (黑)，文字改為 #fff (白)
        <div className="movie-detail-container" style={{ backgroundColor: '#000', minHeight: '100vh', paddingBottom: '50px', color: '#fff' }}>
            
            {/* 麵包屑 (改樣式讓它在黑底看得到) */}
            <div className="breadcrumb" style={{backgroundColor: '#222', color: '#bbb'}}>
                首頁 &gt; 熱售中 &gt; {movie.movieName}
            </div>

            <div className="movie-header-section">
                <div className="poster-box">
                    <img src={getImgSrc(movie.movieImg)} alt={movie.movieName} />
                </div>

                <div className="info-box">
                    <div className="tags">
                        <span className="tag-rating">{getGradeName(movie.gradeID)}</span>
                        <span className="tag-hot">♕ 熱售中</span>
                    </div>
                    <h1 className="movie-title" style={{color: 'white'}}>{movie.movieName}</h1>
                    
                    <div className="info-grid">
                        <p>上映日期：<span>{movie.movieStart}</span></p>
                        <p>導演：<span>{movie.director}</span></p>
                        <p>演員：<span>{movie.actors}</span></p>
                        <p>類型：<span>{getTypeName(movie.movieTypeID)}</span></p>
                        <p>片長：<span>{movie.movieTime}</span></p>
                    </div>
                </div>

                <div className="booking-panel">
                    <h3 style={{fontSize:'1.1rem', color:'#fff'}}>🎥 上映影城</h3>
                    <ul className="cinema-list">
                        {cinemas.map(c => (
                            <li key={c.cinemaID}>
                                <Link 
                                    to={`/cinema/${c.cinemaID}`}
                                    style={{
                                        textDecoration: 'none', 
                                        color: '#4dabf7', // 改成淺藍色，黑底比較好看
                                        display: 'block',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.color = '#fff'}
                                    onMouseOut={(e) => e.target.style.color = '#4dabf7'}
                                >
                                    ▸ {c.cinemaName}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {movie.movieTrailer && (
                <div className="trailer-section" style={{backgroundColor: '#111'}}>
                    <div className="video-container">
                        <iframe 
                            src={getYouTubeEmbedUrl(movie.movieTrailer)} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <div className="story-section">
                <h2 className="story-title" style={{color: '#4dabf7'}}>劇情簡介</h2>
                <div className="story-content">
                    {movie.movieInfo}
                </div>
            </div>
            <QuickBookingSidebar />
        </div>
    );
}


export default Detail;
