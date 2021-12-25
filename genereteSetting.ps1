$path = Split-Path -Parent $MyInvocation.MyCommand.Path

#実行個所を現在地(カレントディレクトリ)にする
Set-Location $path
#Write-Host($path)
# ファイル読み込み
# StreamReaderのコンストラクタに直接 「$path + "\test.txt"」を入力するとエラーになるので分ける
#最初の1行は出力されない?画面では見えない

#Write-Host($path)

$fileName = $path + "\account.csv"
#Write-Host($fileName)

#csv読み込み
function Load-File-List($fileName) {
#これで一気にハッシュのリストを作れる!
$fileList = Import-Csv $fileName -Delimiter `t
   
return $fileList
}

function Get-Target-Data($fileName, $account) {
    $fileData = Load-File-List $fileName
    $targetData = $null
    foreach ($eachLine in $fileData) {
        if ($eachLine.account -eq $account){
            $targetData = $eachLine
            break
        }
    }
    return $targetData
}

function convertFile($path, $eachLine) {
#テンプレートファイルに追加
$templateFile = $path +'\template.txt'

#filegetcontentsに近い
$contents = Get-Content $templateFile

$url = $eachLine.url
$contents2 = $contents  -replace  "%{{url}}%","$url"

$settingFile = $path + '\hogehoge.txt'
Write-Output $contents2 > $settingFile

}  

#引数
#Write-Host $Args[0]

$eachLine = Get-Target-Data $fileName $Args[0]

convertFile $path $eachLine
