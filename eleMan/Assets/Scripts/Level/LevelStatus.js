// LevelStatus: Master level state machine script.
var levelGoal: GameObject;
var mainCamera: GameObject;

// This is where info like the number of items the player must collect in order to complete the level lives.
var spawnPoints : SpawnPoint[];
var initialSpawnPointIndex:int = 0;

//var itemsNeeded: int = 20;	// This is how many fuel canisters the player must collect.


// Awake(): Called by Unity when the script has loaded.
private var playerLink: GameObject;
private var players: GameObject[];

private var elapsedTime : float = 0.0;

private var currentSpawnPoint : SpawnPoint;
private var levelCompleted = false;

var skin : GUISkin;
private var labelText;
private var labelTextTimeout = 0.0;

function Awake()
{
	labelText = "Level 1";
	labelTextTimeout = 10.0;
	
	if(!spawnPoints)
		Debug.Log("You might have forgotten to add the SpawnPoints to the LevelStatus script. You need to add at least one.", this);

	//~ levelGoal.GetComponent(MeshCollider).isTrigger = false;
	if (!levelGoal)
		Debug.Log("You might have forgotten to add the LevelGoal to the LevelStatus script.", this);
	else
		levelGoal.GetComponent(Collider).isTrigger = true;
		
	//get the links to all players
	players =  GameObject.FindGameObjectsWithTag ("Player");
		
	if (players.length == 0)
		Debug.Log("LevelStatus:  Could not get link to Player");
		
	//Set initial Spawn Point
	currentSpawnPoint = spawnPoints[initialSpawnPointIndex];
	
	//Make sure all spawnpoint settings are ok
	SpawnPoint.currentRespawn = currentSpawnPoint;
	currentSpawnPoint.SetActive(true); //Activate initial spawn point
	
	SetPlayersSpawn ();
}

function ActivateNewSpawnPoint (sP : SpawnPoint) {
	//~ Debug.Log("LevelStatus:  New Spawn Point");
	currentSpawnPoint = sP;
	
	SetPlayersSpawn ();
}

function SetPlayersSpawn () {
	//Set spawnpoints for all players
	for (var i=0; i < players.Length; i++)  {
		players[i].gameObject.SendMessage ("SetCurrentRespawn", currentSpawnPoint, SendMessageOptions.DontRequireReceiver);
	}
}

function PlayerCompleted (player:PlayerStatus)
{
	//set status of calling player
	Debug.Log("Player completed: " + player.GetPlayerNumber(), this);
	
	//check if ALL players have rached the goal
	levelCompleted = true;
	for (var i=0; i < players.Length; i++)  {
		if (!players[i].GetComponent(PlayerStatus).GetLevelCompleted())
			levelCompleted = false;
	}
	
	if (levelCompleted) {
		//LEVEL COMPLETE!!
		LevelCompleted();
	}
}

function LevelCompleted () {
	Debug.Log("Level completed.", this);
	Awake();
	
	labelText = "Level completed";
	yield WaitForSeconds (0.1);
	
	for (var i=0; i < players.Length; i++)  {
		players[i].gameObject.SendMessage ("SetControllable", false, SendMessageOptions.DontRequireReceiver);
	}
	
	//yield WaitForSeconds (2.0);
	//Application.LoadLevel(Application.loadedLevelName);
}

function GameOver () {
//	Debug.Log("Game Over.", this);
	yield WaitForSeconds (2.0);
	elapsedTime = 0.0;
	Application.LoadLevel(Application.loadedLevelName);
}

function IsCompleted () {
	return levelCompleted;
}

function GetLabelText () {
	return labelText;
}

function Update () {
	
	if (!levelCompleted) {
		elapsedTime += Time.deltaTime;
	}
	
//	labelTextTimeout -= 0.1;
//	
//	if (labelTextTimeout <= 0) {
//		labelTextTimeout = 0;
//		
//		labelText = "";
//	}
	
	if (Input.GetButtonDown ("Restart")) {
		Application.LoadLevel(Application.loadedLevelName);
	}
}

function OnGUI() {

	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	GUI.Label(Rect (100, 30, 200, 50), "Elapsed Time: ");
	var time = Mathf.Round(elapsedTime * 10.0) / 10.0;
	GUI.Label(Rect (300, 30, 80, 50), time.ToString());
	
	if (levelCompleted) {
		GUI.color = new Color(0.4, 0.4, 0.9, 0.8);
		GUI.Box(Rect(0,0,Screen.width,Screen.height),"");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-98, 80, 25), labelText, "winnerShadow");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-100, 80, 25), labelText, "winner");
	}
}