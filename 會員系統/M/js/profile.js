// M module - profile.js
const API_BASE = "http://localhost:3001/api/member";

function CheckLoginState() { return !!localStorage.getItem("memberUser"); }

function LogoutAndRedirect() {
  localStorage.removeItem("memberUser");
  location.href = "../L/login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const note = document.getElementById("profileNote");
  if(!CheckLoginState()) {
    alert("請先登入");
    location.href = "../L/login.html";
    return;
  }
  const user = JSON.parse(localStorage.getItem("memberUser"));

  // 讀取會員資料 (M2 ShowMemberInfo)
  try {
    const resp = await fetch(`${API_BASE}/profile/${encodeURIComponent(user.id)}`);
    const j = await resp.json();
    if(!j.success) { note.textContent = j.error || "讀取會員資料失敗"; return; }

    // 填入欄位
    document.getElementById("pName").value = j.data.name || "";
    document.getElementById("pEmail").value = j.data.email || "";
    document.getElementById("pPhone").value = j.data.phone || "";
    document.getElementById("pBirth").value = j.data.birthday || "";
    document.getElementById("pPay").value = j.data.pay_account || "";

  } catch (err) {
    console.error(err);
    note.textContent = "無法連線至後端";
    return;
  }

  // M6 SaveChange
  document.getElementById("btnSave").addEventListener("click", async () => {
    note.textContent = "";
    const updated = {
      name: document.getElementById("pName").value.trim(),
      email: document.getElementById("pEmail").value.trim(),
      phone: document.getElementById("pPhone").value.trim(),
      birthday: document.getElementById("pBirth").value,
      payAccount: document.getElementById("pPay").value.trim()
    };

    // 驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    if (!emailRegex.test(updated.email)) { note.textContent = "信箱格式錯誤"; return; }
    if (!phoneRegex.test(updated.phone)) { note.textContent = "手機格式錯誤"; return; }

    try {
      const resp = await fetch(`${API_BASE}/profile/${encodeURIComponent(user.id)}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          birthday: updated.birthday,
          payAccount: updated.payAccount
        })
      });
      const j = await resp.json();
      if(j.success) note.textContent = "更改資料成功";
      else note.textContent = j.error || "更新失敗";
    } catch (err) {
      console.error(err);
      note.textContent = "無法連線至後端";
    }
  });

  // M11 Logout in profile page
  document.getElementById("btnLogout").addEventListener("click", LogoutAndRedirect);
});
