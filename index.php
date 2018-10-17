<?php
if(file_exists("count.dat")){
$num=sscanf(file_get_contents("count.dat"),"%d,%d,%d");
}else{
$num=array(0,0,0);
}
?>
<html lang="ja">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<title> Absolute Simon </title>
<meta http-equiv="Content-Script-Type" content="text/javascript">
</head>
<body bgcolor="white" Text="black" 
Link="blue" Vlink="red" Alink="lime">
<h1>Absolute Simon</h1>
<img src="icon.png" alt="Nyanchan Games logo">

<p>難易度を選択してください。</p>
<p>
<a href="game.html?dif=easy">Easy</a> プレイ回数:
<?php
echo($num[0]);
?>
<br>
 <a href="game.html?dif=normal">Normal</a> プレイ回数:
<?php
echo($num[1]);
?>
<br>
<a href="game.html?dif=hard">Hard</a> プレイ回数:
<?php
echo($num[2]);
?>
</p>
<hr>
<p>
<a href="help.html">説明を見る</a>　<a href="score.php">ランキングを見る</a>
</p>
</body>
</html>