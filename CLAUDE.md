# ひとふでペンギン — 引き継ぎ書（アプリ化に向けて）

このフォルダを開いた Claude Code へ：まずこのファイルを全部読んでから作業を始めてください。
オーナーはスマホ中心で開発を進めてきました。詳細な説明より「自走して作り、結果を見せる」進め方を好みます。

## 1. ゲームの概要
- 指で描いた線が氷の足場になり、自動で歩くペンギンをかまくら（ゴール）へ導くお絵かき物理パズル。
- 全50面 + 秘密の1面（金の魚5匹で解放）。5章構成（はじまりの入り江／ウニの海／ひびわれ氷原／ふしぎな洞窟／オーロラの果て）。
- ★3つ（ゴール・魚・インク節約）、🥇金メダル（開発者の記録以下のインク）、✨金の魚（各章1匹・隠し）、きせかえ（帽子6種・線の色6種）。
- 仕掛け：紫ウニ（線をすり抜ける）、赤ウニ（転がる・線で止まる）、回転/往復ウニ、ツララ（静止・動く）、ぽよん床、上昇気流、横風、崩れる氷、描けない空、加速床、1本制限、ワープ穴、溶ける線、鍵と扉、鍵で現れる橋／消える床。
- 依存ライブラリなしの Vanilla JS + Canvas。フォントのみ Google Fonts（Dela Gothic One / M PLUS Rounded 1c）。

## 2. フォルダ構成
- `web/index.html` … 1ファイル完結の配布版（GitHub Pages にそのまま置ける）
- `pwa/` … PWA版（manifest・service worker・アイコン入り。オフラインで遊べる）
- `dev/` … 開発用ソースとテスト一式
  - `core.js` … 物理エンジン＋全ステージデータ（ブラウザと Node のテストで共用）
  - `template.html` … 画面・演出・保存。`/*CORE*/` の位置に core.js を埋め込んでビルド
  - `build_html.py` … `web/` と `pwa/` を再生成
  - `test.js` … 全面の自動検証（何も描かないと失敗／正解で★3／素直な線では失敗）
  - `igloo_test.js`・`fuzz.js` … かまくらは正面入口からしか入れないことの検証
  - `robust.js` … 手ぶれを加えた正答率（難易度の目安）
  - `playall.py` … Playwright で実ブラウザ上に線を描いて全面クリアを確認
  - `design_a〜d.js`・`lib50.js`・`build50.js` … ステージ設計と、難易度スコアによる並べ替えの仕組み
  - `sol.js`（インク最少の正解）、`solR.json`（一番描きやすい正解）、`goldsol.json`（金の魚ルート）
- `store/` … アプリアイコン1024px とスクリーンショットの下書き

## 3. よく使うコマンド
```
cd dev
node test.js          # 全51面：base fail / sol ★3 / naive fail
node igloo_test.js    # 入口判定テスト
node fuzz.js          # ランダム侵入3000回
python3 build_html.py # 配布用HTMLを再生成
python3 playall.py    # 実ブラウザで全面クリア（要 playwright）
```
変更したら必ず `test.js` と `igloo_test.js` を通してからビルドしてください。

## 4. オーナーの設計方針（必ず守る）
- 簡単なのは1面目だけ。難易度は「ノコギリ型」ではなく一貫した上り坂。1面で増える新要素は原則1つ。
- 画面全体を使う（余白を作らない）。縦に進むステージも入れる。
- 指で細い所に線を描かせる設計は禁止（ストレスになる）。描画はスナップ・手ぶれ補正・障害物の自動スキップで優しく。
- かまくらは正面の入口からのみ入れる。上や後ろからは入れない。
- 失敗したら線はリセット（常に新しい発見を）。
- 鍵の面は扉がしっかり閉じていて、鍵を取ると扉が開く演出。
- 進捗はステージ名で保存（順番を変えても★が消えない）。保存キー `hitofude-penguin-progress` は変えない。

## 5. アプリ化ロードマップ
### Phase A：PWA（すぐできる・無料）
1. `pwa/` の中身を GitHub リポジトリに置き、GitHub Pages を有効化。
2. iPhone の Safari で開き「ホーム画面に追加」→ ペンギンのアイコンで全画面起動、2回目以降はオフラインでも遊べる。
3. 実機で確認：セーフエリア、音（初回タップで解禁）、振動（iOS Safari は非対応でOK）、縦画面固定。

### Phase B：iOS / Android ネイティブアプリ（Capacitor 推奨）
1. `npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
2. `npx cap init "ひとふでペンギン" com.<owner>.hitofude --web-dir=pwa`
3. `npx cap add ios && npx cap add android` → `npx cap sync`
4. 置き換え推奨：
   - 保存：`localStorage` → `@capacitor/preferences`（アプリ削除以外で消えない）。`persist()` と起動時読み込みの2か所。
   - 振動：`navigator.vibrate` → `@capacitor/haptics`（iOS でも振動）。`buzz()` 1か所。
   - フォント：Google Fonts をアプリ内に同梱（オフライン起動でも同じ見た目に）。
   - 縦画面固定、ステータスバーの色、スプラッシュ画面（`@capacitor/splash-screen`）。
5. Xcode で実機ビルド → TestFlight で配布テスト。
6. ストア提出に必要なもの：Apple Developer Program（年額）、Google Play Console（初回登録料）、プライバシーポリシーのページ（データは端末内のみ・収集なし）、年齢区分、スクリーンショット（6.7インチ／6.5インチ等の規定サイズで撮り直し）、アプリ説明文。

### Phase C：アプリらしさの仕上げ
- 起動時のロゴ演出、設定画面（サウンド・振動・記録のリセット）、iCloud/Google のバックアップ連携の検討。
- Claude のアーティファクト版にあった「Claudeアカウントへの記録同期」はアプリ版では不要（`window.claude` が無い環境では自動で無効）。

## 6. 次にやりたいこと（バックログ）
- 41・43・44・45面は横長配置で画面上部が空いている → 縦長構成に作り直す。
- 第2弾：今日の1問（デイリーチャレンジ・連続日数）、クリアした線のリプレイを友達に送る機能。
- 第3弾：ステージエディタ（コードで共有）。
- 効果音をもう少しリッチに（今は WebAudio の合成音）。

## 7. 公開中のURL（参考）
- オーナー用（Claude アカウントに記録同期）：https://claude.ai/artifact/Q7zxsWBGi1dzgz2N2wui3o
- 友達共有用：https://claude.ai/artifact/JdTdtY7SdBoUrquTsibpiB

## 8. 進捗メモ（2026-09-27）
- Phase A 完了：https://kenkaba.github.io/hitofude-penguin/ （リポジトリ kenkaba/hitofude-penguin。main に push すると `.github/workflows/pages.yml` が `pwa/` を自動公開）。プライバシーポリシーは `pwa/privacy.html`。
- Phase B 着手：Capacitor 8（SPM、CocoaPods不要）。appId `com.kenkaba.hitofudepenguin`、webDir は `app/`（`build_html.py` が生成するフォント同梱版。git管理外）。
  - 保存は localStorage と `@capacitor/preferences` の両方（同じキー）、振動は `@capacitor/haptics`。どちらも `template.html` 内の `NP`（Capacitor 環境でのみ有効）経由。
  - iOS は縦固定・アイコン・スプラッシュ設定済み。反映は `npm run sync`（ビルド＋`cap sync`）。
  - 残り：Xcode を入れてシミュレーター確認 → 署名（Team 設定）→ TestFlight → 審査提出。Android は未追加（Google Play 登録料が必要なため保留）。
- 背景ワールド（2026-09-29）：3面ごとに世界が変わる（全17＋秘密の面は月面）。`template.html` の `THEMES`（順番）と各テーマの `paint`（背景・キャッシュ描画）、`hazard`（下の落ちる所の色と失敗メッセージ）、`ground`（足場の見た目）、`parts`（舞う粒）。描いた線・ウニ・かまくら・物理は変えていない。
- 手応えと「運ゲー感」対策（2026-09-29）：動くウニは決定的（出発時 frame=0 から毎回同じ）なので、見えないことが運に感じる原因だった。描いている間は半透明のゴーストで実際の動きと向きを予告し、失敗後の再挑戦では前回の足あと（0.5秒ごとに大きい点）・失敗地点×・ぶつかった瞬間のウニ位置を表示（線はリセットの方針は維持）。ギリギリ回避は「ヒヤッ！」＋スロー、クリアはヒットストップ→ズーム→白フラッシュ→CLEAR!/PERFECT!→花火。連続クリア数で勝利音が上がり、1回の走行で魚を取るほど音程が上がる。失敗時は実距離で「かまくらまで あと○%」。物理（core.js）は変更なし。

