# 公開時の出典と利用範囲

確認日: 2026-10-17

- CesiumJS 1.146: Apache-2.0。使用バージョンの LICENSE.md 全文（第三者通知を含む）を `dist/licenses/CesiumJS-LICENSE.txt` に保存。
- satellite.js 6.0.1: MIT。使用バージョンの全文を `dist/licenses/satellite-js-LICENSE.txt` に保存。
- Natural Earth II: 提供元がパブリックドメインと明示。出典を画面と `credits.html` に表示。
- Cesium ionサービス・商用画像サービス・APIキー設定を削除。CesiumJS本体のCDN配信と標準クレジット表示は保持。
- 軌道データはソフトウェア配布物に含めない。CelesTrakデータをアプリの独自ライセンスに含めたり、再配布許諾済みと主張しない。
- CelesTrakは起動時・カタログ切替時・取得操作時に取得。定期取得・自動再試行・強制再取得なし、最短2時間（GPS24時間）。エラー後は全カタログの取得停止。同一オリジン内の制限であり、異なるブラウザ・利用者間の総量制御ではない。
- 公開規模が増える場合やデータを再配信・同梱する場合は、別途データ提供者の条件・許諾を確認する。より保守的な運用ではオンライン取得を使わず、利用権限を確認済みのローカルJSONのみを使う。
- 第三者のロゴをアプリのブランド素材として追加しない。標準のライブラリクレジットを隠さない。公式提携・承認を主張しない。

公式資料:

- https://github.com/CesiumGS/cesium/blob/1.146/LICENSE.md
- https://github.com/shashwatak/satellite-js/blob/6.0.1/LICENSE.md
- https://www.naturalearthdata.com/about/terms-of-use/
- https://celestrak.org/usage-policy.php
- https://celestrak.org/NORAD/documentation/gp-data-formats.php

権利リスクをゼロとする法的保証ではない。アプリ独自コードの配布ライセンスは第三者のコード・データと分けて決定すること。GitHub Pagesには `dist` のみを配信できる。既存ホスティングの識別情報、Git認証情報、検証用データは公開用ファイルに含めない。

## 2026-10-17の修正

独自コード・文書にMITライセンスを設定（著作権表示AnySpOC）。第三者OSS・素材・データは各自の条件を維持。標準の星空・太陽・月をskyBox:falseで無効化。NORAD IDとOMM数値・日時・件数を検証し、IDも表示時にエスケープ。JSONは12 MiB/25,000件を上限とする。軌道データは引き続き配布物へ含めない。
