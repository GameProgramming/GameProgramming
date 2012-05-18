// This script must be attached to a game object to tell Unity where the player starts in the level.

/*
Respawn: Allows players to respawn to this point in the level, effectively saving their progress.

The Respawn object has three main states and one interim state: Inactive, Active and Respawn, plus Triggered.

- Inactive: Player hasn't reached this point and the player will not respawn here.

- Active: Player has touched this respawn point, so the player will respawn here.

- Respawn: Player is respawning at this respawn point.

Respawn objects also require a simple collider, so the player can activate them. The collider is set as a trigger.

*/

//~ var activeRespawn : spawnTriggerObject;	// set this to the initial respawn point for the level.
private var RespawnState = 0;
//// ...and for the light:
//private var respawnLight : Light;

private var status:LevelStatus;
// The currently active respawn point. Static, so all instances of this script will share this variable.
static var currentRespawn : SpawnPoint;

function Awake()
{	
			
	status = FindObjectOfType(LevelStatus);
			
	//respawnLight = transform.Find("SpotlightDown").GetComponent(Light);
	//respawnLight.intensity = 1;
			
	RespawnState = 0;
	
	if (currentRespawn == this) {
		//Debug.Log("SpawnPoint:  Initial Spawn activated", this);
		SetActive(true);
	}
}

function OnTriggerEnter()
{
	//~ Debug.Log("SpawnPoint:  Pad triggered!", this);
	if (currentRespawn != this)		// make sure we're not respawning or re-activating an already active pad!
	{
		if(!currentRespawn)
			Debug.Log("SpawnPoint:  No CurrentRespawn!", this);
		// turn the old respawn point off
		currentRespawn.SetActive (false);
		
				// Set the current respawn point to be us
		currentRespawn = this;
		status.ActivateNewSpawnPoint(this);
		SetActive (true);
	}
}

function SetActive (activate : boolean) 
{
	//Set the spawn point active
	if (activate) {
		RespawnState = 1;	
	
//	if(!respawnLight)
//			Debug.Log("SpawnPoint:  No light1!", this);
//			
//		respawnLight.intensity = 8;
	}
	//Set the spawn point inactive
	else {
		RespawnState = 0;
		
//		if(!respawnLight)
//			Debug.Log("SpawnPoint:  No light!2", this);
			
	//	respawnLight.intensity = 1;
		//~ respawnTriggerObject.isTrigger = true;
	}
}


function SetInitialRespawn (sP : SpawnPoint) {
	currentRespawn = sP;
	Debug.Log("SpawnPoint:  SetCurrentRespawn -- called from LevelStatus", this);
}

// We'll draw a gizmo in the scene view, so it can be found....
function OnDrawGizmos() {
	Gizmos.DrawIcon(transform.position, "Player_Icon.tif");
}