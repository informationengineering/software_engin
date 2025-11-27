// S module - register.js
const API_BASE = "http://localhost:3001/api/member";

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
function validatePhone(phone) {
  return /^\d{10}$/.test(phone);
}
function validateId(id) {
  // 簡單檢查長度與格式 (台灣身分證可做更複雜驗證)
  return id && id.length >= 8;
}

document.addEventListener("DOMContentLoaded", function(){
  const form = document.getElementById("registerForm");
  const note = document.getElementById("regNote");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    note.textContent = "";

    const payload = {
      id: document.getElementById("regId").value.trim(),
      name: document.getElementById("regName").value.trim(),
      email: document.getElementById("regEmail").value.trim(),
      password: document.getElementById("regPwd").value,
      password2: document.getElementById("regPwd2").value,
      phone: document.getElementById("regPhone").value.trim(),
      birthday: document.getElementById("regBirth").value,
      pwdQuestion: document.getElementById("regPwdQ").value.trim(),
      pwdAnswer: document.getElementById("regPwdA").value.trim(),
      payAccount: document.getElementById("regPay").value.trim()
    };

    if(payload.password !== payload.password2) { note.textContent = "兩次密碼不一致"; return; }
    if(!validateEmail(payload.email)) { note.textContent = "Email 格式錯誤"; return; }
    if(!validatePhone(payload.phone)) { note.textContent = "手機格式需為 10 位數"; return; }
    if(!validateId(payload.id)) { note.textContent = "身分證格式錯誤"; return; }
    if(payload.payAccount.length < 8) { note.textContent = "付款帳號至少 8 碼"; return; }

    // 組成註冊物件（符合你同學範例）
    const body = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      birthday: payload.birthday,
      pwdQuestion: payload.pwdQuestion,
      pwdAnswer: payload.pwdAnswer,
      payAccount: payload.payAccount
    };

    try {
      const resp = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(body)
      });
      const j = await resp.json();
      if (j.success) {
        note.textContent = "註冊成功，轉到登入頁...";
        setTimeout(()=> location.href = "../L/login.html", 800);
      } else {
        note.textContent = j.error || "註冊失敗";
      }
    } catch (err) {
      console.error(err);
      note.textContent = "無法連線至後端（請確認 server 已開）";
    }
  });
});
