# GitHub Pages公開時のライセンス・配布確認

確認日：2026-10-18。対象：このリポジトリのソースと、GitHub Pagesへ配信する `dist`。個人の技術展示という利用目的で確認しています。

## 今回の判定

今回の構成でGitHub Pagesへの公開を禁止する明示的な条項は、確認したライセンス・公式利用方針の範囲では見つかりませんでした。これは、第三者素材を将来追加した場合や、商用SaaS・データ再配布等へ用途を変えた場合までを承認するものではありません。

| 対象 | 確認結果・対応 |
| --- | --- |
| アプリ独自コード・文書 | MIT。著作権表示はAnySpOC。ルートLICENSEとWeb配布用ORBIT-MIT.txtが同じ内容であることを自動確認。 |
| CesiumJS 1.146 | Apache-2.0。使用版の公式LICENSE全文と同梱ファイルを再取得して照合し、改行形式等を正規化した本文が一致。主ライセンスと第三者コードの集約通知を公開ページから読める状態で保持。上流ライブラリ自体は未改変。 |
| ApacheのNOTICE | 公式リリースCesium-1.146.zip全体を点検した記録では独立したNOTICEは見つからず、集約LICENSEは公式ZIPルートの本文と完全一致。別途NOTICEを省いたという状態ではない。独立したNOTICEがないことを、第三者の著作権表示を省略してよいという意味には扱わない。 |
| satellite.js 6.0.1 | MIT。使用版の公式LICENSEと改行正規化後に全文一致。著作権・許諾・免責の本文を公開ページへ同梱。上流ライブラリ自体は未改変。 |
| Natural Earth II | 提供元がラスタ/ベクタ地図データをパブリックドメインと明示。出典表示も保持。 |
| 星空・太陽・月 | ViewerのskyBox:falseで標準の素材を無効化。これらの個別画像を独自に同梱・使用する構成ではない。 |
| Cesium ion / Bing / Google画像 | ionの画像・地形・ジオコーダーは使用しない。APIキー入力や画像追加機能なし。地球はCesium同梱Natural Earth II。標準のCesiumクレジットは保持。 |
| 軌道データ | リポジトリ・配信ファイル・Pages成果物に実データを同梱しない。MIT許諾の対象外であることを明示。テストは合成要素。 |
| CelesTrakへのアクセス | 起動時・カタログ切替時・取得操作時に直接取得。同一ブラウザ/オリジンで最短2時間、GPS24時間。定期取得・自動再試行なし。非200応答や通信エラー後は停止。利用者全体・別ブラウザ・別オリジン間の取得量を一括制御するものではない。共有IPの多人数運用や再配信は別途運用確認が必要。 |
| CDN | Cesium公式CDNとjsDelivrから版固定のコード/アセットを取得。jsDelivrは規則に従う個人・商用の利用を認めている。CDNの継続提供や将来の改変を保証するものではなく、ソフトウェア/データの権利を追加で付与するものでもない。 |
| GitHub Pages | 個人の技術展示用。商用取引や商用SaaSを主目的とする運用への変更はPages制限に照らして再判断。認証情報・秘密情報・実データを配信しない。 |
| 公開処理 | GitHub標準のブランチ配信を使用。独自Actionsワークフローや追加のnpm依存は導入しない。公開スクリプトはNode.js標準機能とGit/GitHub CLIで確認・テスト後にdistだけを配信ブランチへ通常プッシュする。 |

## 自動化した確認

`npm test` は入力・表示安全性・取得制御等32項目の回帰テストです。

`npm run verify:publication` は以下を確認します。

- `licenses.lock.json` に記録した正規化SHA-256とライセンス本文が一致すること。
- 独自コードMIT許諾のルート版と配布版が一致すること。
- ライセンスへのリンクがあり、標準星空を無効化した構成であること。
- PagesのプロジェクトURLでも解決する相対パスであること。
- 配信物に `.git`、`.openai`、軌道データJSON、典型的な秘密情報パターンを含めないこと。

ライセンスのハッシュ照合は本文の欠落・意図しない変更を検知する検査です。将来の利用目的の契約解釈、すべての秘密情報の不存在、全依存コードの脆弱性不存在を証明する検査ではありません。

公開スクリプトは、テストと配布チェック成功後に `dist` だけを `gh-pages` ブランチへプッシュします。配信される10ファイルにはアプリ、HTML/CSS、検証・取得コード、3つのライセンス全文とJekyll無効化用マーカーが含まれます。公開先がこのブランチのルートであることを確認します。

## 原文・照合先

- Apache-2.0：https://www.apache.org/licenses/LICENSE-2.0
- CesiumJS使用版：https://raw.githubusercontent.com/CesiumGS/cesium/1.146/LICENSE.md
- CesiumJSリリース：https://github.com/CesiumGS/cesium/releases/tag/1.146
- satellite.js使用版：https://raw.githubusercontent.com/shashwatak/satellite-js/6.0.1/LICENSE.md
- Natural Earth：https://www.naturalearthdata.com/about/terms-of-use/
- CelesTrak：https://celestrak.org/usage-policy.php
- GP形式：https://celestrak.org/NORAD/documentation/gp-data-formats.php
- jsDelivr：https://github.com/jsdelivr/jsdelivr/blob/master/Terms%20of%20Use.md
- GitHub Pages制限：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub Pages配信設定：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 人間による確認が必要になる変更

実データのサーバー保存・再配信、利用者数の大幅増加、商用SaaSへの転用、追加画像/地形/3Dモデルの利用、非公開技術の追加を行う場合は、この確認をそのまま流用せず、それぞれの提供元条件や適用契約を再確認してください。
