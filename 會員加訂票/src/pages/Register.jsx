import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3001/api/member";

// 驗證函式
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone);
const validateId = (id) => id && id.length >= 8;

// HTML id → state 欄位映射
const ID_TO_STATE_MAP = {
    Id: "id",
    Name: "name",
    Email: "email",
    Pwd: "password",
    Pwd2: "password2",
    Phone: "phone",
    Birth: "birthday",
    PwdQ: "pwdHintId",
    PwdA: "pwdHintAns",
    Pay: "payAccount",
};

function Register() {
    const [formData, setFormData] = React.useState({
        id: "",
        name: "",
        email: "",
        password: "",
        password2: "",
        phone: "",
        birthday: "",
        pwdHintId: "",
        pwdHintAns: "",
        payAccount: "",
    });

    const [note, setNote] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate();

    // 輸入欄位變更
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        const suffix = id.slice(3);
        const key = ID_TO_STATE_MAP[suffix];
        if (key) {
            setFormData((prev) => ({
                ...prev,
                [key]: value,
            }));
        }
    };

    // 表單送出
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNote("");
        setIsLoading(true);

        if (formData.password !== formData.password2) {
            setNote("兩次密碼不一致");
            setIsLoading(false);
            return;
        }
        if (!validateEmail(formData.email)) {
            setNote("Email 格式錯誤");
            setIsLoading(false);
            return;
        }
        if (!validatePhone(formData.phone)) {
            setNote("手機格式需為 10 位數");
            setIsLoading(false);
            return;
        }
        if (!validateId(formData.id)) {
            setNote("身分證/ID 格式錯誤 (至少 8 碼)");
            setIsLoading(false);
            return;
        }
        if (!/^[1-5]$/.test(formData.pwdHintId)) {
            setNote("密碼題目 ID 必須是 1~5");
            setIsLoading(false);
            return;
        }
        if (formData.payAccount.length < 8) {
            setNote("付款帳號至少 8 碼");
            setIsLoading(false);
            return;
        }

        const body = {
            memberID: formData.id,
            memberName: formData.name,
            memberEmail: formData.email,
            memberPwd: formData.password,
            memberPhone: formData.phone,
            memberBirth: formData.birthday,
            memberPwdHintID: formData.pwdHintId,
            memberPwdHintAns: formData.pwdHintAns,
            memberPayAccount: formData.payAccount,
        };

        try {
            const resp = await axios.post(`${API_BASE}/register`, body);
            const j = resp.data;

            if (j.success) {
                setNote("✅ 註冊成功，跳轉至登入頁...");
                setTimeout(() => navigate("/login"), 800);
            } else {
                setNote(j.message || "註冊失敗，可能帳號已被使用");
            }
        } catch (err) {
            console.error(err);
            setNote("❌ 無法連線至後端（請確認 server 已開）");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container register-page-container">
            <nav className="app-nav">
                <a onClick={() => navigate("/")}>首頁</a>
                <a onClick={() => navigate("/login")}>登入</a>
                <a onClick={() => navigate("/register")}>註冊</a>
            </nav>

            <h2>會員註冊</h2>

            <form id="registerForm" onSubmit={handleSubmit}>
                <label>身分證字號
                    <input id="regId" type="text" required value={formData.id} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>姓名
                    <input id="regName" type="text" required value={formData.name} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>Email
                    <input id="regEmail" type="email" required value={formData.email} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>密碼
                    <input id="regPwd" type="password" required value={formData.password} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>確認密碼
                    <input id="regPwd2" type="password" required value={formData.password2} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>手機
                    <input id="regPhone" type="text" required value={formData.phone} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>生日
                    <input id="regBirth" type="date" required value={formData.birthday} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>忘記密碼題目 ID（1~5）
                    <input id="regPwdQ" type="text" required value={formData.pwdHintId} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>忘記密碼答案
                    <input id="regPwdA" type="text" required value={formData.pwdHintAns} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <label>付款帳號
                    <input id="regPay" type="text" required value={formData.payAccount} onChange={handleInputChange} disabled={isLoading} />
                </label>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "註冊中..." : "註冊"}
                </button>

                <div className="note">{note}</div>
            </form>
        </div>
    );
}

export default Register;
