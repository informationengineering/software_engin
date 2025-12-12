// client/src/pages/CinemaDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cinema.css'; // 共用 Cinema 的 CSS

function CinemaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cinema, setCinema] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 這裡我們重新抓全部影城再 filter，或者您可以後端寫一個 api/movie/cinema/:id
        // 為了方便，我們直接用現有的 API 抓全部再來找
        axios.get('http://localhost:3001/api/movie/cinemas')
            .then(res => {
                const target = res.data.find(c => c.cinemaID === id);
                setCinema(target);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const getImgSrc = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/${path}`; 
    };

    if (loading) return <div style={{padding:'50px', color:'white'}}>載入中...</div>;
    if (!cinema) return <div style={{padding:'50px', color:'white'}}>找不到影城資料</div>;

    return (
        <div style={{background:'#fff', minHeight:'100vh', paddingBottom:'50px'}}>
            {/* 頂部大圖 (Banner) */}
            <div style={{
                width: '100%', 
                height: '400px', 
                overflow: 'hidden',
                position: 'relative'
            }}>
                <img 
                    src={getImgSrc(cinema.cinemaImg)} 
                    alt={cinema.cinemaName} 
                    style={{width:'100%', height:'100%', objectFit:'cover'}}
                />
                <div style={{
                    position:'absolute', bottom:0, left:0, width:'100%',
                    background:'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    padding:'40px 20px', color:'white'
                }}>
                    <h1 style={{margin:0, fontSize:'2.5rem'}}>{cinema.cinemaName}</h1>
                </div>
            </div>

            {/* 內容區 */}
            <div style={{maxWidth:'1000px', margin:'0 auto', padding:'40px 20px'}}>
                
                {/* 麵包屑 / 返回按鈕 */}
                <button 
                    onClick={() => navigate('/cinemas')}
                    style={{
                        marginBottom:'20px', padding:'5px 15px', cursor:'pointer',
                        background:'#eee', border:'none', borderRadius:'4px'
                    }}
                >
                    ← 返回影城列表
                </button>

                {/* 資訊卡片 */}
                <div style={{
                    display:'flex', gap:'40px', flexWrap:'wrap',
                    borderBottom:'1px solid #eee', paddingBottom:'30px', marginBottom:'30px'
                }}>
                    <div style={{flex:1, minWidth:'300px'}}>
                        <h2 style={{color:'#333', borderLeft:'4px solid #007bff', paddingLeft:'10px'}}>影城介紹</h2>
                        <p style={{lineHeight:'2', color:'#555', fontSize:'1.1rem', textAlign:'justify'}}>
                            {cinema.cinemaInfo || "暫無詳細介紹"}
                        </p>
                    </div>

                    <div style={{width:'300px', background:'#f9f9f9', padding:'20px', borderRadius:'8px', height:'fit-content'}}>
                        <h3 style={{marginTop:0}}>聯絡資訊</h3>
                        <p>📍 <strong>地址：</strong><br/>{cinema.cinemaAddress}</p>
                        <p>📞 <strong>電話：</strong><br/>{cinema.cinemaTele}</p>
                        <hr style={{borderColor:'#ddd'}}/>
                        <a 
                            href={cinema.googleMap} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{
                                display:'block', textAlign:'center', background:'#007bff', 
                                color:'white', textDecoration:'none', padding:'10px', borderRadius:'4px'
                            }}
                        >
                            在 Google Maps 查看
                        </a>
                    </div>
                </div>

                {/* 交通資訊 (假設資料庫有 cinemaBusTwo 欄位) */}
                <div>
                    <h3 style={{color:'#333'}}>交通資訊</h3>
                    <p style={{color:'#666'}}>{cinema.cinemaBusTwo || "暫無交通資訊"}</p>
                </div>

            </div>
        </div>
    );
}

export default CinemaDetail;