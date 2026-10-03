# パズルの発想を変えるための調査と改修

調査方法: 2026-10-03、下記13作品の開発元・販売元の説明を確認。実ゲーム全編のプレイや動画全編分析を行ったという意味ではない。具体的な図柄、キャラクター、ステージ配置は転用していない。

| 作品と一次資料 | 確認した特徴 | LUMA FLOWで採る設計原則 |
|---|---|---|
| [Portal 2](https://www.thinkwithportals.com/about.php) | 空間を接続して解く物理パズル | 入口だけでなく、離れた出口の方向から逆算する |
| [Poly Bridge 3](https://store.steampowered.com/app/1850160/Poly_Bridge_3/) | 吊橋、多層橋、跳躍、油圧など | 一筆を坂以外の支柱・フック・重しとしても使う |
| [Patrick's Parabox](https://store.steampowered.com/app/1260520/) | 入れ子の構造、各問題に新しい発想 | 左右反転だけで面数を増やさず、判断の違いを一文で記録する |
| [World of Goo 2](https://store.steampowered.com/app/3385670/World_of_Goo_2/) | 橋、塔、液体の誘導、異なる特性の部品 | 水路の建築と、貯水・射出・中継を組み合わせる |
| [Opus Magnum](https://store.steampowered.com/app/558990/Opus_Magnum/) | 自由な機械設計と解法の最適化 | 一つのお手本に固定せず、安定して届く別解を許す |
| [Baba Is You](https://store.steampowered.com/app/736260/) | 規則の操作が新しい相互作用を作る | 単に障害を増やすのでなく、物の役割を変えて考えさせる |
| [Besiege](https://www.spiderlinggames.com/) | 部品を組み立てる物理建築 | 描いた線同士の組立、支柱と上置きの順序を課題にする |
| [Cut the Rope](https://www.zeptolab.com/franchise/cut-the-rope) | 切る順序・運動・部品の相互作用 | 落とす順序、出口の速度、受け止める場所を考える |
| [Where's My Water?](https://apps.apple.com/us/app/wheres-my-water/id449735650) | 水・汚水・蒸気などで用途が変わる | 水の色とタンクの対応をルールにし、経路を分離する |
| [Mini Metro](https://dinopoloclub.com/games/mini-metro/) | 限られた資源でネットワークを設計 | 共用部分と独立した枝を考える分配課題 |
| [Contraption Maker](https://store.steampowered.com/app/241240/Contraption_Maker/) | 部品の組合せによる装置と連鎖 | 描線→吸入口→上方吐出口→転送→別の描線という因果連鎖 |
| [Human Resource Machine](https://tomorrowcorporation.com/humanresourcemachine) | 段階的な命令導入、任意の最適化 | 通常クリアの許容幅を保ち、インク評価で再挑戦できる |
| [Crayon Physics Deluxe](https://store.steampowered.com/app/26900/Crayon_Physics_Deluxe/) | 描いた形を物体にする | 自由描画の核を保ち、部品選択だけのゲームにしない |

## 前版の問題

材料が違っても、同じ一本坂と同じタンク配置を繰り返していた。通常材への置換失敗テストは材料の効果を証明するが、ステージ間の発想の違いは証明しない。クリア成功率だけで「面白い」と断定しない。

## 今回の実装

46面を独立モジュールで置換。1・4・10・13は基本操作と材料の導入として保持。転送リング、貯水起動ポンプ、色別タンクを追加。支柱、フック、重心、漏れ塞ぎ、二段中継、出口からの逆算、色別の経路分離、終盤の複合回路を組み合わせる。各面のpuzzleConceptは設計上の意図であり、完全に異なる50ジャンルを意味しない。

物理検証では粒子IDと色を転送中も保持し、ポンプ内の水を水量保存と失敗判定へ含める。転送中の架空の直線がリレーやタンクを通過した扱いにならないようにする。新しい素材を無効化した場合、何も描かない場合、必要な一筆を省いた場合の検証を行う。
