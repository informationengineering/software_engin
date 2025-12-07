document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按鈕和內容的 active 狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 取得目標內容區塊的 ID
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            // 啟用被點擊的按鈕
            this.classList.add('active');

            // 顯示對應的內容區塊
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});
