// client/src/pages/BookingRule.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './BookingRule.css';

function BookingRule() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const showingID = searchParams.get('showingID'); // 抓取上一頁傳來的場次ID

    const [agreed, setAgreed] = useState(false); // 勾選狀態

    const handleProceed = () => {
        if (!agreed) {
            alert("請先勾選「我已閱讀並同意上述規定」");
            return;
        }
        // 同意後，帶著場次ID前往真正的「選位頁面」 (假設選位頁面是 /booking/seat)
        navigate(`/booking/seat?showingID=${showingID}`);
    };

    return (
        <div className="rule-page">
            <div className="rule-container">
                
                {/* 第一部分：訂票及取票規定 */}
                <section className="rule-section">
                    <h2 className="rule-title">一、訂票及取票規定[一般票種]</h2>
                    <ol className="rule-list">
                        <li>網路訂票每張票需加收NT$20手續費。</li>
                        <li>片長 150分鐘(含)以上之電影需加價NT$20，每增加30分鐘需另再加價NT$10，HFR 版本放映加價NT$10。</li>
                        <li>每筆訂票張數以 10 張為限。儲值金會員票每每日訂票張數以10張為限。</li>
                        <li>銀行優惠票種與儲值金會員票無法於同筆訂單中，請分次訂購，唯兩筆訂票無法保證座位。</li>
                        <li>各銀行優惠票種之張數與折扣金額，請依各銀行信用卡優惠規則為準。銀行優惠票種預訂以電影播放日期為準，非刷卡日計算。每卡每日購買張數限制依影片版本與觀影日期相關規定限制。</li>
                        <li>請注意此交易金額將於購票步驟完成後，即刻於您的信用卡帳戶或儲值金帳戶中進行扣款。</li>
                        <li>購票完成後，請憑「訂票序號」至購票影城進行取票，亦可至超商進行取票，但若交易內含餐飲品項，須至購票影城臨櫃領取電影票與餐點。</li>
                        <li>消費者訂購電影票後，威秀影城仍保留影廳更換之權利，如有任何變更將於場次當日臨櫃告知，敬請見諒；其餘未盡事項依影城現場公告為主。</li>
                    </ol>
                </section>

                {/* 第二部分：退換票規定 */}
                <section className="rule-section">
                    <h2 className="rule-title">二、退換票規定[一般票種]</h2>
                    <ol className="rule-list">
                        <li>線上購票後若已領取電影票，因故無法如期觀影，請於開演前 20 分鐘持未使用之電影票與原訂購之信用卡親至觀影影城辦理退換票。已取票或取餐者，無法進行線上退款。</li>
                        <li>線上購票後若尚未領取電影票，因故無法如期觀影，可於威秀影城官網登入會員訂票紀錄中進行線上退票，電影票最遲應於影片開演 2 小時前完成線上退票程序。</li>
                        <li>電影票遺失恕不補發，亦無法辦理退換票。線上購票完成後退、換票，訂票手續費恕不退還，且不保證相同座位。</li>
                        <li>因天災或特殊事故取消電影放映時，請於購票場次7日內憑『未使用之原票券』至原購票影城櫃台辦理退換票，影城未營業期間均不收取手續費。</li>
                        <li>退、換票注意事項：若是信用卡付款，則需攜帶購票之信用卡辦理退票 ( 如未攜帶原購票信用卡，恕無法辦理退換票 ) 。</li>
                        <li>其餘未盡事項依影城現場公告為主。</li>
                    </ol>
                </section>

                {/* 底部按鈕區 */}
                <div className="rule-footer">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={agreed} 
                            onChange={(e) => setAgreed(e.target.checked)} 
                        />
                        我已閱讀並同意上述規定
                    </label>

                    <button 
                        className={`btn-proceed ${agreed ? 'active' : ''}`} 
                        onClick={handleProceed}
                    >
                        📄 前往訂票
                    </button>
                </div>

            </div>
        </div>
    );
}

export default BookingRule;