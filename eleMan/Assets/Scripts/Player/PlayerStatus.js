// ThirdPersonStatus: Handles the player's state machine.

// Keeps track of inventory, health, lives, etc.


var health : int = 6;
var maxHealth : int = 6;
@System.NonSerialized
var lives = 0;

// sound effects.
//~ var struckSound: AudioClip;
//~ var deathSound: AudioClip;
@System.NonSerialized
var levelStateMachine : LevelStatus;		// link to script that handles the level-complete sequence.
private var playerNumber = 0;
private var levelCompleted = false;
//private var remainingItems : int;	// total number to pick up on this level. Grabbed from LevelStatus.
private var spawnPoint : SpawnPoint;
private var playersOrientation:Vector3;

private var element : GameObject;
private var morphed : boolean = false;

@System.NonSerialized
var cameraTimer = 0.0;
private var focus : CameraFocus;

function Start()
{
	levelStateMachine = FindObjectOfType(LevelStatus);
	if (!levelStateMachine)
		Debug.Log("No link to Level Status");
	
	pController = GetComponent(PlayerController);
	if (!pController)
		Debug.Log("No link to Player Controller");
	
//	remainingItems = levelStateMachine.itemsNeeded;
	playersOrientation = transform.forward; //check original orientation
	levelCompleted = false;
	
	Spawn ();
}

// Utility function used by HUD script:
//function GetRemainingItems() : int
//{
//	return remainingItems;
//}

//~ function ApplyDamage (damage : int)
//~ {
	//~ if (struckSound)
		//~ AudioSource.PlayClipAtPoint(struckSound, transform.position);	// play the 'player was struck' sound.

	//~ health -= damage;
	//~ if (health <= 0)
	//~ {
		//~ SendMessage("Die");
	//~ }
//~ }


function AddLife (powerUp : int)
{
	lives += powerUp;
	health = maxHealth;
}

function AddHealth (powerUp : int)
{
	health += powerUp;
	
	if (health>maxHealth)		// We can only show six segments in our HUD.
	{
		health=maxHealth;	
	}		
}

function OnDeath ()
{
	// play the death sound if available.
	//~ if (deathSound)
	//~ {
		//~ AudioSource.PlayClipAtPoint(deathSound, transform.position);

	//~ }
		
	lives--;
	health = maxHealth;
	
	//Debug.Log("Died. Lives: " + lives);
	
	//Game Over!
//	if(lives < 0)
		levelStateMachine.GameOver();
//	else {
//		// If we've reached here, the player still has lives remaining, so respawn.
//		cameraTimer = 1.0;
//		Spawn ();
//	}
}

function Spawn () {
	// reset the character's speed
	SendMessage("ResetSpeed", SendMessageOptions.DontRequireReceiver);
	
	if(!spawnPoint)
		Debug.Log("No spawnPoint");
		
	// (NOTE: "HidePlayer" also disables the player controls.)
	SendMessage("HidePlayer");
	// reset the character's position to the spawnPoint
	if (spawnPoint)
		transform.position = spawnPoint.transform.position;
	
	//this is actually only for multiplayer-mode
	GameObject.FindWithTag("MainCamera").GetComponent(CameraFocus).setSwitch(playerNumber, false);

	yield WaitForSeconds(2.0);	// give the sound time to complete. 
	
	SendMessage("ShowPlayer");	// Show the player again, ready for...		
}

function LevelCompleted(inGoal : boolean)
{
	Debug.Log("Completed: " + playerNumber, this);
	if (inGoal) {
		//Debug.Log("InGoal " + playerNumber, this);
		levelCompleted = true;
		levelStateMachine.PlayerCompleted(this);
	}
	else {
		//Debug.Log("Out of goal " + playerNumber, this);
		levelCompleted = false;
	}
}

function GetPlayerNumber () {
	return playerNumber;
}

function GetLevelCompleted () {
	return levelCompleted;
}

function SetPlayerNumber (number : int) {
	playerNumber = number;
}

function SetCurrentRespawn (currentSpawn:SpawnPoint) {
	spawnPoint = currentSpawn;
}

function Reset () {
	gameObject.tag = "Player";
}

@script RequireComponent (PlayerController)