#pragma strict

var teams :Team[];

var currentLevel : String;
var allLevels : String[];

//var numBigSnowBalls = 3;
//var bigSnowBallPrefab : GameObject;
//var ballSpawnPoints : GameObject[];

@System.NonSerialized 
var winner :Team;
var gameOver : boolean;
var gameOverTime = 0.0;

var playerPrefab : GameObject;
var player : GameObject; // the human player on this side of the connection.

var overviewCam : MapOverview;

var botNumber :int = 4;

function Awake () {
	gameOver = false;
	
	for (var t in GameObject.FindObjectsOfType(Team)) {
		if (t.GetComponent(Team).GetTeamNumber() != 0)
			teams += [t.GetComponent(Team)];
	}

	overviewCam = transform.FindChild("OverviewCam").GetComponent(MapOverview);
	
//	ballSpawnPoints = GameObject.FindGameObjectsWithTag("BallSpawn");
}

function OnNetworkLoadedLevel () {
	// add the main player.
	var pl :GameObject = Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
	AddPlayer(pl);
	SetMainPlayer(pl);
	
	if (Network.isServer) {
		// add the bots.
		for (var i :int = 0; i < botNumber; i++) {
			var b :GameObject = Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
			AddPlayer(b);
			SetBot(b);
		}
	}
	
	//overviewCam.GetComponent(MapOverview).SetPlayerCam( player.transform.FindChild("CameraTarget") );
}

function SetMainPlayer (pl :GameObject) {
	player = pl;
	overviewCam.SetPlayer(pl.transform);
	overviewCam.ResetPlayerCam();
	pl.SendMessage("OnSetMainPlayer");
}

function SetBot (pl :GameObject) {
	if (pl == player) player = null; // koennte schief gehen.. besser niemals zu diesem fall kommen lassen!
	pl.SendMessage("OnSetBot");
}

/*
 * Places a new Player into the smallest team;
 */
function AddPlayer ( player :GameObject ) {
	var minSize : float = 1000;
	var minTeam : Team;
	for (var t : Team in teams) {
		var s = t.GetBalancedSize();
		if (s < minSize) {
			minSize = s;
			minTeam = t;
		} 
	}
	minTeam.AddPlayer(player);
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
	Application.LoadLevel("Main");//Application.loadedLevelName);
}

function TeamWins (t :Team) {
	winner = t;
	
	gameOver = true;
	gameOverTime = Time.time;
	
	
	// jedem erzaehlen, dass das spiel vorbei ist.
	for (var go in FindObjectsOfType(GameObject))
		go.SendMessage("GameOver", SendMessageOptions.DontRequireReceiver);	
}

//this happens when something falls off the level and into the death box
function OnTriggerEnter (other : Collider) {
	//~ playerLink=col.GetComponent (PlayerStatus);
	if (!other.GetComponent (PlayerStatus)) { // not the player or the bots
		//destroy the object
		Destroy(other.gameObject);
	}
	else  { //otherwise tell the player to die
		other.gameObject.SendMessage ("Respawn", null, SendMessageOptions.DontRequireReceiver);
	}
}

//function GetSnowBallSpawns() : GameObject[] {
//	return ballSpawnPoints;
//}

function GetTeams () : Team[] {
	return teams;
}

function GetTeamById ( id :int ) : Team {
	for (var t :Team in teams) {
		if (t.teamNumber == id) {
			return t;
		} 
	}
	return null;
}


function GetCurrentLevel () : String {
	return currentLevel;
}

function GetAllLevels () : String[] {
	return allLevels;
}