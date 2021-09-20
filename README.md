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

1.通常のSQLServerをPHPで使えるように以下のページからドライバーのダウンロード<br>
https://docs.microsoft.com/ja-jp/sql/connect/php/download-drivers-php-sql-server?view=sql-server-ver15
「Microsoft Drivers for PHP for SQL Server (Windows) のダウンロード」をクリックしてダウンロード
→C:\xampp\php\extなどDDLがあるページでダウンロードファイルを実行し、php_pdo_sqlsrv_73_ts_x86.dllなどが展開されていることを確認<br>

参考:https://codezine.jp/article/detail/5736s

2:phpinfoからThreadセーフか否かを判断し、とphpのバージョンと同一のDDLファイルのextensionをphp.iniに記述<br>
php7.4を使っていて、スレッドセーフなら以下を記載<br>
例<br>
extension=php_pdo_sqlsrv_74_ts_x64.dll<br>
extension=php_sqlsrv_74_ts_x64.dll<br>
参考:https://atmarkit.itmedia.co.jp/ait/articles/1810/23/news023.html<br>
参考:https://docs.microsoft.com/ja-jp/sql/connect/php/loading-the-php-sql-driver?view=sql-server-ver15

3:phpinfoでpdo_sqlsrvが有効化されていることを確認<br>
参考:https://codezine.jp/article/detail/5736

4.通常のwindows認証からSQLServer認証に切り替える(saユーザーでパスワード作成)<br>
参考:https://www.purin-it.com/sqlserver-make-user

5.対象のコンピューターによって拒否されたため、接続できませんでした・・のようなメッセージがでるので、ローカルPCのTCP解放(有効)をする。1433固定でよいかと。<br>
参考:https://symfoware.blog.fc2.com/blog-entry-1385.html

6.SQLSERVER側が動的IPだったりすることがあると上記の症状が解決されないので、ポートを1433固定する。<br>
参考:https://knowledge.autodesk.com/ja/support/vault-products/learn-explore/caas/sfdcarticles/sfdcarticles/JPN/How-to-configure-SQL-Server-to-use-a-static-port.html

## laravel-mixを使ったビルド
コマンドプロンプトでは動かないので、git bashかcygwinなどを使う
以下コマンドでlaravel-mixのコマンドが見れる
```
./node_modules/laravel-mix/bin/cli.js --help 
```

watchコマンド
```
./node_modules/laravel-mix/bin/cli.js  --mix-config=webpack.mix.js watch

```
