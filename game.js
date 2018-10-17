//Absolute Simon
//Nyanchan Games 2016

//定数、でもconstがたまに動かないとかいううわさなので変数で
//処理状況
var beforeStart=0;
var playingNotes=1;
var answering=2;

//変数
var currentState=beforeStart;//現在の状態
var notes=[];//ノートデータ
var answer="";//答えのデータ
var score;//得点
var level;//レベル
var noteNumber;//出力するノートの数
var noteInterval;//ノート間の感覚
var noteMonitor;//ノート出力中の状態監視用
var rnd;//乱数で使う。いちいちvarするのはなんかいやだというただの好み。
var rnd2;//これも
var difficulty;//難易度
var btnSwitch=[];//ボタンをコントロールするとき、有効化・無効化するボタンのフラグだけ立てる
var loaded=false;//サウンドがロードされたかどうか

//通信用
var xhr= new XMLHttpRequest();//動的にサーバ側と通信したい

//サウンドの読み込み
//PCならここで読み込み、スマートデバイスならあとでやる
if(!isSmartDevice()){
	loaded=true;
}else{
	loaded=false;
alert("すいません。一応スマホでも遊べるように努力したし動くんですが、まともなパフォーマンスが出ないです…。なので、よかったらPCからアクセスしてみてください！");//ネタ
}
//オーディオオブジェクトを作っておく、PCなら勝手に読み込んでおいてくれる
startSND=new Audio("audio/start.mp3");
processSND=new Audio("audio/process.mp3");
errorSND=new Audio("audio/error.mp3");
scoreSND=new Audio("audio/score.mp3");
	var notesSND=[];//各音階の配列
	for(i=1;i<9;i++){
	notesSND.push(new Audio("audio/note"+i+".mp3"));//順番にオーディオオブジェクトを突っ込んでおく
	}
gameoverSND=new Audio("audio/gameover.mp3");

window.onload=function(){//難易度情報の受け取り
	difficulty=document.location.search.substring(5);//ブラウザから難易度を拾う
	if(difficulty!="easy" && difficulty!="normal" && difficulty!="hard"){//未定義の難易度がやってきた
document.startForm.gameStartBTN.disabled="true";
		document.getElementById("scoreArea").innerHTML="Undefined difficulty:"+difficulty;
		return;
	}
	document.getElementById("scoreArea").innerHTML="難易度 : "+difficulty;
	//難易度により、有効化するボタンを設定
	if(difficulty=="easy") btnSwitch=[true,false,false,false,true,false,false,true];
	if(difficulty=="normal") btnSwitch=[true,false,true,false,true,false,false,true];
	if(difficulty=="hard") btnSwitch=[true,true,true,true,true,true,true,true];
}

function startGame(){//ゲーム開始処理
	if(!loaded){//まだサウンドを読み込んでなかったら
		loadSounds();
		return;
	}
	startSND.play();
	//押せないようにしていたボタンを押せるようにする
	for(i=0;i<8;i++){
		if(btnSwitch[i]) document.keyboardForm.elements[i].disabled="";
	}
	document.startForm.gameStartBTN.disabled="true";//開始ボタンは押せないようにする
	document.getElementById("scorePostArea").innerHTML="";//ランキングフォームを空にしておく
	//データ初期化
	notes=[];
	answer="";
	score=0;
level=0;
	noteNumber=1;
	noteMonitor=0;
	//難易度別にノート感覚を設定
	if(difficulty=="easy") noteInterval=1200;
	if(difficulty=="normal") noteInterval=1000;
	if(difficulty=="hard") noteInterval=700;
	//サーバーにリクエストを投げて、プレイ回数を増やす。結果は面倒なので見ない。
	xhr.open("GET","count.php?count="+difficulty);
	xhr.send();
	//一息ついてからゲーム開始
	setTimeout("generateNote();",1200);
}
function generateNote(){//ノートを発生させる
	if(noteMonitor==0) currentState=playingNotes;//初回のノート発生時は、内部状態を遷移させる
	if(noteMonitor==noteNumber-1){//新しく１音追加する
		switch(difficulty){//難易度による分岐
			case "easy":
				rnd2=Math.floor(Math.random()*3);
				if(rnd2==0) rnd=1;
				if(rnd2==1) rnd=5;
				if(rnd2==2) rnd=8;
			break;
			case "normal":
				rnd2=Math.floor(Math.random()*4);
				if(rnd2==0) rnd=1;
				if(rnd2==1) rnd=3;
				if(rnd2==2) rnd=5;
				if(rnd2==3) rnd=8;
			break;
			case "hard":
				rnd=Math.floor(Math.random()*8)+1;//どのノートでも出していい
			break;
		}
		notes.push(rnd);//ノートデータに追記
	}else{//今までに出たノートを再生
		rnd=notes[noteMonitor];
	}
	notesSND[rnd-1].load();//これをやらないと連続再生してくれない、currentPosition=0はだめだった
	notesSND[rnd-1].play();
	noteMonitor++;//生成したので増やす
	if(noteMonitor==noteNumber){//規定数に達したので終了
		currentState=answering;//状態遷移
		noteMonitor=0;//次は答えてもらうので、モニターはリセット
	}else{//まだ続く
		setTimeout("generateNote();",noteInterval);
	}
}

document.onkeydown=function(key){//回答用ショートカットキー処理
if(currentState!=answering) return;//回答待ち状態でのみ入力を受け付ける
var keyCode=key.keyCode-48;//inputAnswerに直接渡せるように変換しておく
if(keyCode<1 || keyCode>8) return;//使用しないキーが押されたので帰る、いちいち音が鳴ったらうざいよね
if(!btnSwitch[keyCode-1]){//有効化されてないボタンが押されたらエラー音
errorSND.play();//これはわざわざ負荷をかけてまで連続再生しなくてもいい
return;
}
inputAnswer(keyCode);
return;
}


function inputAnswer(pressed){//音階のボタンを押したときの動作
	if(currentState!=answering){//回答可能な状態でなかったらはじく
		errorSND.play();
		return;
	}
	processSND.play();
	answer=""+pressed//どのノートを押したかを拾う
	if(notes[noteMonitor]!=answer){//問題と違うのを押しちゃった
		gameoverSND.play();
		for(i=0;i<8;i++){
			if(btnSwitch[i]) document.keyboardForm.elements[i].disabled="true";//音階のボタンを押せないようにする
		}
		document.startForm.gameStartBTN.disabled="";//開始ボタンを戻す
		createScorePost();
return;
	}
	noteMonitor++;//外れてなかったので、モニターを更新
//スコアの加算
	if(difficulty=="easy") score++;//easyなら1ポイント
	if(difficulty=="normal") score+=2;//normalなら2ポイント
	if(difficulty=="hard") score+=3;//hardなら3ポイント

	if(noteMonitor==noteNumber){//全部正解したので、次の問題へ
		scoreSND.play();
		level++;
		noteNumber++;//次はノートが１個増える
		noteMonitor=0;
		if(level%4==0 && noteInterval>200) noteInterval-=50//だんだん早くする
		currentState=beforeStart;
		setTimeout("generateNote();",1200);	//一息ついてから次の問題へ
	}
		document.getElementById("scoreArea").innerHTML="スコア:"+score+" / レベル "+level;
}
function isSmartDevice(){//スマートデバイスかどうかの判定
var ret=false;
if( navigator.userAgent.indexOf('iPhone') > 0) ret=true;
if( navigator.userAgent.indexOf('iPad') > 0) ret=true;
if( navigator.userAgent.indexOf('iPod') > 0) ret=true;
if( navigator.userAgent.indexOf('Android') > 0) ret=true;
return ret;
}

function loadSounds(){//スマートデバイス用、サウンドの読み込み
	document.startForm.gameStartBTN.disabled="true";
	document.getElementById("scoreArea").innerHTML="読み込み中…";
	startSND.load("audio/start.mp3");
	processSND.load("audio/process.mp3");
	errorSND.load("audio/error.mp3");
	scoreSND.load("audio/score.mp3");
	for(i=1;i<9;i++){
		if(btnSwitch[i-1]) notesSND[i-1].load("audio/note"+i+".mp3");//重たくなるので、使わない音は読み込まない
	}
	gameoverSND.load("audio/gameover.mp3");
	loaded=true;
	setTimeout("loadComplete();",10000);//10秒あれば読み込んでくれるでしょう
}

function loadComplete(){//読み込み終了の通知
	alert("読み込みが終了しました。もう一度「開始」ボタンを押してください。");
	document.getElementById("scoreArea").innerHTML="開始できます";
	document.startForm.gameStartBTN.disabled="";
}

function createScorePost(){//スコア送信用のフォームを出力
	if(score==0) return;//スコアがないんだからエントリーできるわけないよね
	var scorePostText="<hr>\n";
	scorePostText+="<h2>ランキングにエントリーできます</h2>\n";
	scorePostText+="<form action=\"score.php\" method=\"post\" name=\"scorePostForm\">\n";
	scorePostText+="<input type=\"hidden\" name=\"score\" value=\""+score+"\">\n";
	scorePostText+="<input type=\"hidden\" name=\"difficulty\" value=\""+difficulty+"\">\n";
	scorePostText+="<label><input type=\"text\" name=\"player\" maxlength=\"20\">名前</label>\n";
	scorePostText+="<input type=\"submit\" value=\"エントリー\" onclick=\"return checkInput();\">\n";
	scorePostText+="</form>\n";
	document.getElementById("scorePostArea").innerHTML=scorePostText;
}
function checkInput(){//名前が入力されてるか確認
	if(document.scorePostForm.player.value==""){
		alert("エントリーしたい名前を入力してください。");
		return false;
	}else{
		return true;
	}
}

