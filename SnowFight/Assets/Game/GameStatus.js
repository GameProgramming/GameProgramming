#pragma strict

var teams :Team[];

var numBigSnowBalls = 3;
var bigSnowBallPrefab : GameObject;
var ballSpawnPoints : GameObject[];

@System.NonSerialized 
var winner :Team;
var gameOver : boolean;
var gameOverTime = 0.0;

function Awake () {
	gameOver = false;
	
	for (var t in GameObject.FindObjectsOfType(Team)) {
		teams += [t.GetComponent(Team)];
	}

	ballSpawnPoints = GameObject.FindGameObjectsWithTag("BallSpawn");

//	for (var i = 0; i<numBigSnowBalls; i++) {
//		Instantiate(bigSnowBallPrefab, Vector3(0,-50,0), Quaternion.identity);
//	}
}

function Update () {
	
	if (!gameOver) {
		// if every other team has lost, one team wins.
		// TODO: special case: what if every team has lost?
		var winCandidate :Team = null;
		for (var t :Team in teams) {
			if (!t.HasLost()) {
				if (winCandidate) {
					winCandidate = null;
					break;
				} else { 
					winCandidate = t;
				}
			}
		}
		if (winCandidate) {
			TeamWins(winCandidate);
		}
	}
	
	if (Input.GetButtonDown ("Restart")) {
		Restart();
	}
}

function Restart() {
	Application.LoadLevel(Application.loadedLevelName);
}

function TeamWins (t :Team) {
	winner = t;
	
	gameOver = true;
	gameOverTime = Time.time;
	
	var bots = GameObject.FindGameObjectsWithTag ("Bot");
	for (var bot in bots)
	    bot.BroadcastMessage("GameOver");
	    
    GameObject.FindGameObjectWithTag("Player").BroadcastMessage("GameOver");
}

//this happens when something falls off the level and into the death box
function OnTriggerEnter (other : Collider) {
	//~ playerLink=col.GetComponent (PlayerStatus);
	if (!other.GetComponent (PlayerStatus)) { // not the player or the bots
		//destroy the object
		Destroy(other.gameObject);
	}
	else  //otherwise tell the player to die
		other.gameObject.SendMessage ("Die", null, SendMessageOptions.DontRequireReceiver);
}

function GetSnowBallSpawns() : GameObject[] {
	return ballSpawnPoints;
}