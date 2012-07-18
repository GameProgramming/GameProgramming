#pragma strict

var teams :Team[];
var neutralTeam :Team;

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
var playerS :PlayerStatus;

var overviewCam : MapOverview;

var botNumber :int = 4;
var botNames :String[] = ["Erwin", "Mark", "Konstantin", "Anton", "Bernhard", "Thomas",
						  "Moritz", "Karl", "Martin", "Sebastian", "Jan", "Egon", "Markus",
						  "Lukas", "Johann", "Wolfgang"];

var mapRadius :float = 500;

function Awake () {
	gameOver = false;
	
	for (var t in GameObject.FindObjectsOfType(Team)) {
		if (t.GetComponent(Team).GetTeamNumber() != 0) {
			teams += [t.GetComponent(Team)];
		} else {
			neutralTeam = t;
		}
	}

	overviewCam = transform.FindChild("OverviewCam").GetComponent(MapOverview);
	
//	ballSpawnPoints = GameObject.FindGameObjectsWithTag("BallSpawn");
}

function OnNetworkLoadedLevel () {
	// add the main player.
	var pl :GameObject = Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
	AddPlayer(pl);
    pl.GetComponent(PlayerStatus).SetName(GameObject.FindGameObjectWithTag("Main").
    										GetComponent(ConnectGuiMasterServer).playerName);
	SetMainPlayer(pl);
	botNumber = GameObject.FindGameObjectWithTag("Main").GetComponent(ConnectGuiMasterServer).GetBotCount();
	if (Network.isServer) {
		// add the bots.
		for (var i :int = 0; i < botNumber; i++) {
			var b :GameObject = Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
			AddPlayer(b);
			b.GetComponent(PlayerStatus).SetName(botNames[i % botNames.Length]);
			SetBot(b);
		}
	}
	
	//overviewCam.GetComponent(MapOverview).SetPlayerCam( player.transform.FindChild("CameraTarget") );
}

function SetMainPlayer (pl :GameObject) {
	player = pl;
	playerS = pl.GetComponent(PlayerStatus);
	overviewCam.SetPlayer(pl.transform);
	overviewCam.ResetPlayerCam();
	pl.SendMessage("OnSetMainPlayer");
}

function SetBot (pl :GameObject) {
	if (pl == player) player = null; // koennte schief gehen.. besser niemals zu diesem fall kommen lassen
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
		SendMessage("Restart");
	}
}

function Restart() {
	if (Network.isServer) {
		var levelLoad : NetworkLevelLoad = GameObject.FindGameObjectWithTag("Main").GetComponent(NetworkLevelLoad);
		levelLoad.LoadNewLevel(currentLevel);
	}
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
//		if (other.networkView) {
//			if (other.networkView.isMine) {
//				Debug.Log("Destroying "+other.gameObject+" because it fell from the map.");
//				Network.Destroy(other.gameObject);
//			}
//		} else {
//			Debug.Log("Destroying "+other.gameObject+" because it fell from the map.");
//			Destroy(other.gameObject);
//		}
	} else if (Network.isServer) { //otherwise tell the player to die
		Debug.Log("Killing "+other.gameObject+" because he/she fell from the map.");
		var attack = new Attack();
		attack.damage = 10000; // lethal, i hope ;)
		other.SendMessage("ApplyDamage", attack, SendMessageOptions.DontRequireReceiver);
		//other.gameObject.SendMessage ("Respawn", null, SendMessageOptions.DontRequireReceiver);
	}
}

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

function OnDrawGizmosSelected ()
{
	Gizmos.color = Color.red;
	Gizmos.DrawWireSphere (transform.Find("MapCenter").position, mapRadius);
}