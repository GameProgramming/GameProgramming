#pragma strict
var teams = 2;
var tabFade = 3.0;
var skyBox : UnityEngine.Material;
var fragsToWin = 10;

var skin : GUISkin;
private var score : int[];
private var fade = 0.0;
private var winner = 0;
private var gameOver : boolean;


function Start () {
	gameOver = false;
	
	if (skyBox && !RenderSettings.skybox)
		RenderSettings.skybox = skyBox;

	score = new int[teams];
	var i:int = 0;
	for (i = 0; i<teams; i++) {
		score[i] = 0;
	}
}

function OnGUI() {

	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	if (Time.time < fade) {
		GUI.Box (Rect (10, 10, 120, 100), "Team Frags");
		var i : int = 0;
		for (var specificScore : int in score) {
			if (i == 0) {
				var team1Score  = specificScore.ToString();
				GUI.Label (Rect (10, 40, 80, 25), "Team 1: ");
				GUI.Label (Rect (90, 40, 20, 25), team1Score);
			}
			if (i == 1) {
				var team2Score = specificScore.ToString();
				GUI.Label (Rect (10, 70, 80, 25), "Team 2: ");
				GUI.Label (Rect (90, 70, 20, 25), team2Score);
			}
			i++;
		}
	}	

	if (gameOver) {
		var winText : String;
		winText = "Team "+ winner.ToString() + " wins!";
		GUI.color = new Color(0.4, 0.4, 0.9, 0.8);
		GUI.Box(Rect(0,0,Screen.width,Screen.height),"");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-98, 80, 25), winText, "winnerShadow");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-100, 80, 25), winText, "winner");
			
		var scoreText : String;
		var j : int = 0;
		for (j = 0; j<teams-1; j++) {
			scoreText = scoreText + score[j].ToString() + " : ";
			scoreText = scoreText + score[j+1].ToString();
		}
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

function IncreaseScore(scoringTeam : int) {
	if (scoringTeam > 0) {
		score[scoringTeam-1]++;
		if(score[scoringTeam-1] >= fragsToWin) {
			//scoring team has won the game!!
			winner = scoringTeam;
			gameOver = true;
			
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