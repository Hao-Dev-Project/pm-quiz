# 專案管理題庫

涵蓋 Ch1–Ch3 的專案管理練習網站，提供選擇題測驗與敏捷架構圖填空。

[開始測驗](https://hao-dev-project.github.io/pm-quiz/) · [架構圖填空](https://hao-dev-project.github.io/pm-quiz/chart.html)

## 題庫內容

| 題庫 | 題數 |
| --- | ---: |
| Ch1–Ch2 原有題庫 | 110 |
| Ch2 AI 模擬試題 | 66 |
| Ch3 AI 模擬試題與講義習題 | 65 |

共 241 題。模擬題依講義編製，供複習使用，非實際考題。

## 功能

- 依章節、主題與作答狀態篩選，支援隨機出題、即時解析及錯題重練。
- 架構圖可直接填答、核對正解，或切換完整答案。
- 作答紀錄儲存於目前瀏覽器（localStorage），不會上傳。
- 支援加入手機主畫面，已快取頁面可離線使用。

## 維護

以靜態 HTML、CSS 與 JavaScript 建置，透過 GitHub Pages 部署（`main` 分支根目錄）。

更新題庫請編輯 `index.html`；更新架構圖請編輯 `chart.html`。需要更新離線快取時，調整 `sw.js` 的 `VERSION`。
