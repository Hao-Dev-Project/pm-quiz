# 專案管理題庫

專案管理 Ch1–Ch2 的測驗網站，包含小考題庫 110 題和 Ch2 記憶加練 66 題。

- 每個人的作答紀錄只存在自己的瀏覽器（localStorage），不會上傳，也不會互相看到。
- 可以安裝到手機主畫面，打開過一次之後沒有網路也能作答。

## 放上 GitHub Pages

1. 到 GitHub 建立一個新的 **Public** 儲存庫，例如 `pm-quiz`。
2. 在儲存庫頁面按 **Add file → Upload files**，把這個資料夾裡的所有檔案拖進去，按 **Commit changes**。
3. 到 **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 **main**、資料夾選 **/ (root)**，按 **Save**。
4. 等一兩分鐘，網址會是 `https://你的帳號.github.io/pm-quiz/`。

## 安裝到手機

- iPhone：用 Safari 打開網址 → 分享 → 加入主畫面。
- Android：用 Chrome 打開網址，點網頁上的「安裝到主畫面」，或從選單選「安裝應用程式」。

## 更新題目

替換 `index.html` 後，有網路時打開網站就會拿到新版。也可以把 `sw.js` 第一行的版本號改掉（例如 `pm-quiz-v2`），讓手機清掉舊的快取。
