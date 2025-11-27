// 讀取 localStorage 內的用戶資料
let user = JSON.parse(localStorage.getItem("memberUser") || "{}");

// 把資料填入 input
document.getElementById("phoneInput").value = user.phone || "";
document.getElementById("emailInput").value = user.email || "";

// 按鈕綁定事件
document.getElementById("updateBtn").addEventListener("click", async () => {
  if (!user || !user.memberId) {
    alert("請先登入");
    return;
  }

  const newPhone = document.getElementById("phoneInput").value;
  const newEmail = document.getElementById("emailInput").value;

  try {
    const response = await fetch("http://localhost:3001/api/member/update", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        memberID: user.memberId,
        newPhone,
        newEmail
      })
    });

    if (!response.ok) {
      throw new Error("伺服器回應錯誤");
    }

    alert("資料已更新！");

    // 更新 localStorage
    const updatedUser = { ...user, phone: newPhone, email: newEmail };
    localStorage.setItem("memberUser", JSON.stringify(updatedUser));

  } catch (err) {
    console.error(err);
    alert("更新失敗：" + err.message);
  }
});
