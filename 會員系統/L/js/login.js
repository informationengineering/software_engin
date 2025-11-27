// L module - login.js
const API_BASE = "http://localhost:3001/api/member"; // <- 若後端位置不同請改這裡

// L2 CheckLoginState()
function CheckLoginState() {
  return !!localStorage.getItem("memberUser");
}

// L3 GetUserAccount() & L4 GetUserPwd() (from DOM)
function GetUserAccount() { return document.getElementById("inputEmail").value.trim(); }
function GetUserPwd() { return document.getElementById("inputPassword").value; }

// L1 Login() main handler
async function LoginHandler(e) {
  e.preventDefault();
  const email = GetUserAccount();
  const password = GetUserPwd();

  try {
    const resp = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if(!resp.ok) throw resp;
    const data = await resp.json();

    if (data.success) {
      // L5 CheckLogin -> success
      localStorage.setItem("memberUser", JSON.stringify(data.user));
      document.getElementById("loginNote").textContent = "登入成功";
      showLogoutButton(true);
      // redirect to profile
      setTimeout(()=> location.href = "../M/profile.html", 600);
    } else {
      document.getElementById("loginNote").textContent = data.message || "帳號或密碼錯誤";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("loginNote").textContent = "無法連線至後端（請確認 server 已啟動）";
  }
}

// L11 Logout()
function Logout() {
  localStorage.removeItem("memberUser");
  showLogoutButton(false);
  document.getElementById("loginNote").textContent = "已登出";
}

function showLogoutButton(show) {
  const btnLogout = document.getElementById("btnLogout");
  btnLogout.style.display = show ? "inline-block" : "none";
  document.getElementById("btnLogin").style.display = show ? "none" : "inline-block";
}

document.addEventListener("DOMContentLoaded", function(){
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", LoginHandler);
  document.getElementById("btnLogout").addEventListener("click", Logout);

  if (CheckLoginState()) {
    document.getElementById("loginNote").textContent = "已登入：" + JSON.parse(localStorage.getItem("memberUser")).name;
    showLogoutButton(true);
  }
});
