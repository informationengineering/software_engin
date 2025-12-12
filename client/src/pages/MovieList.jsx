// client/src/pages/MovieList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MovieList.css';

// 👇 接收 props: type ('now' 或 'coming')
function MovieList({ type }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 分頁
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const navigate = useNavigate();

    // 1. 抓取資料並過濾
    useEffect(() => {
        setLoading(true); // 切換頁面時先顯示載入中
        axios.get('http://localhost:3001/api/movie/all')
            .then(res => {
                const allMovies = res.data;
                const today = new Date();

                // === 關鍵邏輯：依照日期過濾 ===
                const filtered = allMovies.filter(movie => {
                    const releaseDate = new Date(movie.movieStart);
                    
                    if (type === 'coming') {
                        // 即將上映：上映日 > 今天
                        return releaseDate > today;
                    } else {
                        // 熱售中：上映日 <= 今天 (包含今天)
                        return releaseDate <= today;
                    }
                });

                // 即將上映通常依照日期排序 (越近的排越前面)
                if(type === 'coming') {
                    filtered.sort((a, b) => new Date(a.movieStart) - new Date(b.movieStart));
                }

                setMovies(filtered);
                setLoading(false);
                setCurrentPage(1); // 切換分類時重置頁碼
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [type]); // 當 type 改變時 (點了導覽列切換)，重新執行

    // ... (getImgSrc 函式維持原樣) ...
    const getImgSrc = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/${path}`; 
    };

    // 分頁計算
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMovies = movies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(movies.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    if (loading) return <div className="loading-text">載入中...</div>;

    return (
        <div className="movie-list-container">
            {/* 動態顯示標題 */}
            <h2 className="page-title">
                {type === 'coming' ? '即將上映' : '熱售中'} 
                <span>{type === 'coming' ? 'COMING SOON' : 'NOW SHOWING'}</span>
            </h2>

            {movies.length === 0 ? (
                <div style={{textAlign:'center', padding:'50px', color:'#666'}}>目前沒有此分類的電影</div>
            ) : (
                <div className="movie-grid">
                    {currentMovies.map((movie) => (
                        <div 
                            key={movie.movieID} 
                            className="movie-card"
                            onClick={() => navigate(`/detail/${movie.movieID}`)}
                        >
                            {/* 標籤依照類型變化 */}
                            <div className={`ribbon ${type === 'coming' ? 'blue' : ''}`}>
                                {type === 'coming' ? '即將上映' : '熱售中'}
                            </div>

                            <div className="card-img-box">
                                <img src={getImgSrc(movie.movieImg)} alt={movie.movieName} />
                                <div className="overlay">
                                    <span>查看詳情</span>
                                </div>
                            </div>

                            <div className="card-content">
                                <h3 className="card-title">{movie.movieName}</h3>
                                <p className="card-en-title">{movie.movieNameEn}</p>
                                <p className="card-date" style={{color: '#d9534f', fontWeight:'bold'}}>
                                    {movie.movieStart} 上映
                                </p>
                                <div className="card-short-info">
                                    {movie.movieShortInfo || "暫無簡介..."}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 分頁按鈕維持原樣 */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-btn prev">&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i + 1} onClick={() => paginate(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn next">&gt;</button>
                </div>
            )}
        </div>
    );
}

export default MovieList;