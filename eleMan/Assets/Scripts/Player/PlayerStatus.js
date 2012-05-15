// ThirdPersonStatus: Handles the player's state machine.

// Keeps track of inventory, health, lives, etc.


//~ var health : int = 6;
//~ var maxHealth : int = 6;
//~ var lives = 4;

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
	//~ lives += powerUp;
	//~ health = maxHealth;
}

function AddHealth (powerUp : int)
{
	//~ health += powerUp;
	
	//~ if (health>maxHealth)		// We can only show six segments in our HUD.
	//~ {
		//~ health=maxHealth;	
	//~ }		
}


//function FoundItem (numFound: int)
//{
//	remainingItems-= numFound;
//
//// NOTE: We are deliberately not clamping this value to zero. 
//// This allows for levels where the number of pickups is greater than the target number needed. 
//// This also lets us speed up the testing process by temporarily reducing the collecatbles needed. 
//// Our HUD will clamp to zero for us.
//
//	if (remainingItems == 0)
//	{
//		//~ levelStateMachine.UnlockLevelExit(); // ...and let our player out of the level.
//	}
//}

function OnDeath ()
{
	cameraTimer = 1.0;
	Spawn ();
	// play the death sound if available.
	//~ if (deathSound)
	//~ {
		//~ AudioSource.PlayClipAtPoint(deathSound, transform.position);

	//~ }
		
	//~ lives--;
	//~ health = maxHealth;
	
	//~ if(lives < 0)
		//~ Application.LoadLevel("GameOver");	
	
	//~ // If we've reached here, the player still has lives remaining, so respawn.
	//~ respawnPosition = Respawn.currentRespawn.transform.position;
	//~ Camera.main.transform.position = respawnPosition - (transform.forward * 4) + Vector3.up;	// reset camera too
	//~ // Hide the player briefly to give the death sound time to finish...
	//~ SendMessage("HidePlayer");
	
	//~ // Relocate the player. We need to do this or the camera will keep trying to focus on the (invisible) player where he's standing on top of the FalloutDeath box collider.
	//~ transform.position = respawnPosition + Vector3.up;

	//~ yield WaitForSeconds(1.6);	// give the sound time to complete. 
	
	//~ // (NOTE: "HidePlayer" also disables the player controls.)

	//~ SendMessage("ShowPlayer");	// Show the player again, ready for...	
	//~ // ... the respawn point to play it's particle effect
	//~ Respawn.currentRespawn.FireEffect ();
}

function Spawn () {
	// reset the character's speed
	SendMessage("ResetSpeed", SendMessageOptions.DontRequireReceiver);
	
	if(!spawnPoint)
		Debug.Log("No spawnPoint");
		
	SendMessage("HidePlayer");
	// reset the character's position to the spawnPoint
	if (spawnPoint)
		transform.position = spawnPoint.transform.position;
	
	//TODO: change for multiplayer... when player dies, set focus to other..
	GameObject.FindWithTag("MainCamera").GetComponent(CameraFocus).setSwitch(playerNumber, false);

	yield WaitForSeconds(2.0);	// give the sound time to complete. 
	
	// (NOTE: "HidePlayer" also disables the player controls.)

	SendMessage("ShowPlayer");	// Show the player again, ready for...		
}

function LevelCompleted(inGoal : boolean)
{
	Debug.Log("Completed: " + playerNumber, this);
	if (inGoal) {
		Debug.Log("InGoal " + playerNumber, this);
		levelCompleted = true;
		levelStateMachine.PlayerCompleted(this);
	}
	else {
		Debug.Log("Out of goal " + playerNumber, this);
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