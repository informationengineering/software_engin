// L module - forget.js
const API_BASE = "http://localhost:3001/api/member";

// --- 嘗試向後端取得提示題目（若沒有支援就回傳 null） ---
async function fetchPwdQuestion(account) {
  try {
    const resp = await fetch(`${API_BASE}/pwd-question?account=${encodeURIComponent(account)}`);
    if (!resp.ok) return null; // backend 可能沒實作 → fallback

    const j = await resp.json();
    if (j.success && j.question) return j.question;
    return null;
  } catch (err) {
    console.warn("pwd-question error:", err);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", function () {

  // ----- 共用 DOM 元件 -----
  const btnGet = document.getElementById("btnGetQuestion");
  const btnReset = document.getElementById("btnReset");
  const questionArea = document.getElementById("questionArea");
  const note = document.getElementById("fpNote");

  // ============================
  // 🔵 1. 按下「取得提示題目」
  // ============================
  btnGet.addEventListener("click", async () => {

    note.textContent = "";

    const account = document.getElementById("fpAccount").value.trim();
    if (!account) {
      note.textContent = "請先輸入帳號 (Email)";
      return;
    }

    note.textContent = "嘗試從後端取得密碼提示題目...";

    const question = await fetchPwdQuestion(account);

    if (question) {
      // 後端有題目
      document.getElementById("pwdQuestionText").textContent = question;
      questionArea.style.display = "block";
      note.textContent = "請回答提示題目並輸入新密碼。";
    } else {
      // 後端沒有實作 pwd-question → fallback
      document.getElementById("pwdQuestionText").textContent =
        "(無題目可取得，請輸入您註冊時記得的答案)";
      questionArea.style.display = "block";
      note.textContent = "無法取得題目，請直接輸入答案與新密碼重置。";
    }
  });

  // ============================
  // 🔵 2. 按下「重設密碼」
  // ============================
  btnReset.addEventListener("click", async () => {

    const account = document.getElementById("fpAccount").value.trim();
    const answer = document.getElementById("fpAnswer").value.trim();
    const newPwd = document.getElementById("fpNewPwd").value;

    if (!account || !answer || !newPwd) {
      note.textContent = "請完整填寫帳號、答案與新密碼";
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, answer, newPwd })
      });

      const j = await resp.json();

      if (j.success) {
        note.textContent = "密碼修改成功！即將跳轉登入頁面...";
        setTimeout(() => (location.href = "login.html"), 1200);
      } else {
        note.textContent = j.error || "密碼修改失敗";
      }
    } catch (err) {
      console.error(err);
      note.textContent = "伺服器錯誤或無法連線";
    }
  });
});
