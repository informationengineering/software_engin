// 假資料庫（你可以改成 fetch 連後端）
const fakeDB = {
    "A123456789": { memberId: "A123456789", balance: 500 },
    "B987654321": { memberId: "B987654321", balance: 1200 }
};

// T2：查詢餘額
function searchBalance() {
    const memberId = document.getElementById("memberIdInput").value;
    const balanceDisplay = document.getElementById("balanceDisplay");

    if (!fakeDB[memberId]) {
        balanceDisplay.innerText = "會員不存在";
        return;
    }

    balanceDisplay.innerText = "餘額：" + fakeDB[memberId].balance + " 元";
}

// T4：檢查銀行帳號（假功能）
function checkPayAccount(account) {
    // 假設銀行帳號長度需為 8 碼
    return account && account.length === 8;
}

// T7：紀錄加值資訊（示範）
function recordTopUpCard(memberId, amount) {
    console.log(`[Log] 會員 ${memberId} 儲值 ${amount} 元`);
}

// T5：加值成功畫面
function displaySuccess(msg) {
    document.getElementById("resultMsg").style.color = "green";
    document.getElementById("resultMsg").innerText = msg;
}

// T6：加值失敗畫面
function displayError(msg) {
    document.getElementById("resultMsg").style.color = "red";
    document.getElementById("resultMsg").innerText = msg;
}

// T1：主流程：儲值卡儲值
function topUpCard() {
    const memberId = document.getElementById("memberIdInput").value;
    const amount = parseInt(document.getElementById("amountInput").value);
    const payAccount = document.getElementById("payAccountInput").value;

    // 檢查會員是否存在
    if (!fakeDB[memberId]) {
        displayError("會員不存在");
        return;
    }

    // 檢查金額
    if (!amount || amount <= 0) {
        displayError("儲值金額需大於 0");
        return;
    }

    // T4：檢查銀行帳號是否正確
    if (!checkPayAccount(payAccount)) {
        displayError("銀行帳號格式錯誤（需 8 碼）");
        return;
    }

    // 儲值
    fakeDB[memberId].balance += amount;

    // T7：紀錄
    recordTopUpCard(memberId, amount);

    // T5 顯示成功
    displaySuccess("儲值成功！目前餘額：" + fakeDB[memberId].balance + " 元");

    // 重新載入餘額
    searchBalance();
}
