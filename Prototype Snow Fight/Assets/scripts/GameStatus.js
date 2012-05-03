#pragma strict
var teams = 2;
var tabFade = 3.0;
var skyBox : UnityEngine.Material;
var fragsToWin = 10;
var spawnPointsTeam1 : Transform[];
var spawnPointsTeam2 : Transform[];
var teamBase1 : Transform;
var teamBase2 : Transform;
var numBigSnowBalls = 3;
var bigSnowBallPrefab : GameObject;
var ballSpawnPoints : Transform[];


var skin : GUISkin;
private var score : int[];
private var fade = 0.0;
private var winner = 0;
private var gameOver : boolean;
private var gameOverTime = 0.0;
private var distFromTop = 20;

function Awake () {
	gameOver = false;
	
	teamBase1.GetComponent(TeamBase).setTeamNumber(1);
	teamBase2.GetComponent(TeamBase).setTeamNumber(2);
	
	if (skyBox && !RenderSettings.skybox)
		RenderSettings.skybox = skyBox;

	score = new int[teams];
	var i:int = 0;
	for (i = 0; i<teams; i++) {
		score[i] = 0;
	}
	
	for (i = 0; i<numBigSnowBalls; i++) {
		Instantiate(bigSnowBallPrefab, Vector3(0,-50,0), Quaternion.identity);
//		Instantiate(bigSnowBallPrefab, ballSpawnPoints[Random.Range(0,ballSpawnPoints.Length-1)].position, Quaternion.identity);
	}
}

function OnGUI() {

	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	var j : int = 0;
		
	var scoreText : String = "";
	for (j = 0; j<teams-1; j++) {
			scoreText = scoreText + score[j].ToString() + " : ";
			scoreText = scoreText + score[j+1].ToString();
	}
	GUI.Label (Rect (0, 0, 80, 35), scoreText, "winnerShadow");
	GUI.Label (Rect (0, 0, 80, 35), scoreText);
	
	if (Time.time < fade) {
		GUI.Box (Rect (10, 10, 120, 50+teams*20), "Team Frags");
		var i : int = 0;
		for (i = 1; i <= score.Length; i++) {
			var teamScore  = score[i-1].ToString();
			GUI.Label (Rect (10, distFromTop + 20*i, 80, 25), "Team " + i + ": ", "teamFrags");
			GUI.Label (Rect (90, distFromTop + 20*i, 20, 25), teamScore, "teamFrags");
		
			
//			if (i == 0) {
//				var team1Score  = score[i].ToString();
//				GUI.Label (Rect (10, 40, 80, 25), "Team 1: ", "teamFrags");
//				GUI.Label (Rect (90, 40, 20, 25), team1Score, "teamFrags");
//			}
//			if (i == 1) {
//				var team2Score = score[i].ToString();
//				GUI.Label (Rect (10, 70, 80, 25), "Team 2: ", "teamFrags");
//				GUI.Label (Rect (90, 70, 20, 25), team2Score, "teamFrags");
//			}
		}
	}
		
	if (gameOver && Time.time > gameOverTime + 2) {
		var winText : String;
		winText = "Team "+ winner.ToString() + " wins!";
		GUI.color = new Color(0.4, 0.4, 0.9, 0.8);
		GUI.Box(Rect(0,0,Screen.width,Screen.height),"");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-98, 80, 25), winText, "winnerShadow");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-100, 80, 25), winText, "winner");
			
		
		
		
		GUI.Box(Rect(0,0,Screen.width,Screen.height),"");
		
		GUI.Label (Rect (Screen.width/2, Screen.height/2-73, 80, 35), scoreText, "winnerShadow");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-75, 80, 35), scoreText, "winner");
	}
}

function Update () {
	
	if (Input.GetKeyDown("tab")) {
		fade = Time.time + tabFade;
	}
	
	var levelName : String = Application.loadedLevelName;
	if (gameOver && Input.GetKeyDown("space")) {
		Application.LoadLevel(levelName);
	}
}

function IncreaseScore(scoringTeam : int, valueIncrease : int) {
	if (scoringTeam > 0) {
		score[scoringTeam-1] += valueIncrease;
		if(score[scoringTeam-1] >= fragsToWin) {
			//scoring team has won the game!!
			winner = scoringTeam;
			gameOver = true;
			gameOverTime = Time.time;
			
			var bots = GameObject.FindGameObjectsWithTag ("Bot");
			for (var bot in bots)
			    bot.BroadcastMessage("GameOver");
			    
		    GameObject.FindGameObjectWithTag("Player").BroadcastMessage("GameOver");
    
			
		}
	}
}

//this happens when something falls off the level and into the death box
function OnTriggerEnter (other : Collider) {
	//~ playerLink=col.GetComponent (PlayerStatus);
	if (!other.GetComponent (PlayerStatus)) { // not the player or the bots
		//destroy the object
		Destroy(other.gameObject);
	}
	else //otherwise tell the player to die
		other.gameObject.SendMessage ("Respawn", SendMessageOptions.DontRequireReceiver);
}

function GetTeamBases(teamNumber : int) : Transform[] {
	if  (teamNumber == 1) {
		return spawnPointsTeam1;
	}
	else { 
		return spawnPointsTeam2;
	}
}

function GetSnowBallSpawns() : Transform[] {
	return ballSpawnPoints;
}