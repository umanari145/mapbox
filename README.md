# mapbox

ビルトインサーバーが一番楽

カレントディレクトリで下記コマンドを実行<br>
```
php -S localhost:8000
```

ブラウザから以下URLでアクセスすればOK<br>
http://localhost:8000

- api.php JSONの吐き出し
- mapbox.js 必要なJavaScriptファイル
- index.php エントリーポイント
- json/feature.json JSONレコードを格納

## geometry情報
https://blog.tagbangers.co.jp/ja/2020/08/26/getting-started-geojson-with-mapbox


## azure
https://docs.microsoft.com/ja-jp/cli/azure/install-azure-cli-macos

インストール
```
brew update && brew install azure-cli
```

https://qiita.com/ume67026265/items/03b49f1531c6cd38a701


## ローカルでのSQLSERVERの接続

1.通常のwindows認証からSQLServer認証に切り替える(saユーザーでパスワード作成)<br>
参考:https://www.purin-it.com/sqlserver-make-user

1.対象のコンピューターによって拒否されたため、接続できませんでした・・のようなメッセージがでるので、ローカルPCのTCP解放をする
1433固定でよいかと。
参考:https://symfoware.blog.fc2.com/blog-entry-1385.html

1.SQLSERVER側が動的IPだったりすることがあると上記の症状が解決されないので、ポートを1433固定する。
参考:https://knowledge.autodesk.com/ja/support/vault-products/learn-explore/caas/sfdcarticles/sfdcarticles/JPN/How-to-configure-SQL-Server-to-use-a-static-port.html