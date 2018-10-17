<?php
if(!isset($_REQUEST["count"])) die("Error : No parameter");
$slot=-1;
if($_REQUEST["count"]=="easy") $slot=0;
if($_REQUEST["count"]=="normal") $slot=1;
if($_REQUEST["count"]=="hard") $slot=2;
if($slot==-1) die("Error : parameter out of range");
if(file_exists("count.dat")){
$num=sscanf(file_get_contents("count.dat"),"%d,%d,%d");
}else{
$num=array(0,0,0);
}
$num[$slot]++;
$fp=fopen("count.dat","w");
flock($fp,LOCK_EX);
fwrite($fp,sprintf("%d,%d,%d",$num[0],$num[1],$num[2]));
flock($fp,LOCK_UN);
fclose($fp);
die("OK");
?>
