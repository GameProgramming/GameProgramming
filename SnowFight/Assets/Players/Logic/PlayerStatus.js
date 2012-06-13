@System.NonSerialized
var team :Team;

var fullHp : int = 10;
var respawnTimeout = 5.0;
//The maximum number of snowballs a player can carry.
var maximumSnowballCapacity : int = 10;
//The current number of snowballs the player carries.
private var currentSnowballs : int = 0;

private var hp : int = fullHp;
private var killTime = -respawnTimeout; // prevents "double spawn" at start

private var died : boolean = true;
private var respawning : boolean = false;
private var gameOver = false;
var maxCollectionSnowTime : float;
private var collectionSnowTime : float;



//This ID should be set when he wants to spawn at a certain base.
var spawnBaseID : int;

//InvokeRepeating("Regenerate",5,10);
//var damageSound : AudioClip;

function Start() {
	gameOver = false;
	
	team = transform.parent.gameObject.GetComponent("Team");
	if (team == null) {
		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
	}
}

function Update () {
	//Every one second collect a snowball.
	collectionSnowTime += Time.deltaTime;
//	if (CollectSnowPossible()) {
//		//Collect snowball.
//		CollectSnow();
//	}
	if (!gameOver) {

		if (died && Time.time > killTime + respawnTimeout && spawnBaseID > 0)
			Respawn();
	}
}

function Regenerate () {
	if (!gameOver && hp < fullHp) {
		hp += 5;
		hp = Mathf.Min(hp, fullHp);
	}
}

function OnControllerColliderHit(hit : ControllerColliderHit){
	
}

function OnCollisionEnter (collision : Collision) {
	//Get all required positions.
	var ballPosition = collision.transform.position;
	var playerPosition = gameObject.transform.position;
	var inversePosition = gameObject.transform.InverseTransformPoint(collision.transform.position);
	if(collision.rigidbody && collision.rigidbody.tag.Equals("Projectile")){
		//Get the damage Object
		var damageObject : Damage = collision.transform.GetComponent("Damage");
		var damage = 0;
		//If the ball hits the player in the head.
		if (inversePosition.y > 0.9) {
			damage = damageObject.GetHeadDamage();
			//Debug.Log("Hit in the head.");
			//Debug.Log(damage);
		//He hits the player from behind.
		} else if (inversePosition.z < -0.3) {
			damage = damageObject.GetBehindDamage();
			//Debug.Log("Hit from behind.");
			//Debug.Log(damage);
		} else {
			damage = damageObject.GetFrontDamage();
			//Debug.Log("Hit from side or front.");
			//Debug.Log(damage);
		}
		
		if (damage > 0) {
			hp -= damage;
			hp = Mathf.Max(0, hp);
		}
		
		gameObject.SendMessage ("OnHit", SendMessageOptions.DontRequireReceiver);										
		gameObject.SendMessage ("ReleaseBall", SendMessageOptions.DontRequireReceiver);
		
		if (hp <= 0) {
			Die(damageObject);
		}
	}
}

function Die (ball : Damage) {
	// ATTENTION: ball can be null, because there are special ways of dieing.
	
	
	if (died) //we're already dead
		return;
	
	if (transform.tag.Equals("Player")) {
		var mapOverview = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
		mapOverview.SetMode(true);
	}
	
	if (transform.tag.Equals("Player")) {
		spawnBaseID = 0;
	}
	
	if (ball) {
		team.LoseTickets(1);
	}
	

	
	died = true;
	killTime = Time.time;
	
	gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
	gameObject.SendMessage ("RemoveTarget", SendMessageOptions.DontRequireReceiver);
	

	

}

function Respawn () {
	respawning = true;
	
//	var teamSpawnPoints = team.GetSpawnPoints();
//	
//	if (teamSpawnPoints && teamSpawnPoints.Length > 0) {
//		transform.position = teamSpawnPoints[Random.Range(0,teamSpawnPoints.Length-1)].position;
//		transform.position.y += 5;
//	}
	//This would be the new code
	var newPosition : Vector3 = team.GetSpawnPoint(spawnBaseID);
	transform.position = newPosition;
	
	hp = fullHp;
	currentSnowballs = maximumSnowballCapacity;
	died = false;
	
	gameObject.SendMessage ("OnRespawn", SendMessageOptions.DontRequireReceiver);
	var overviewCam = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
	overviewCam.SetMode(false);
}

function CollectSnow() {
//	if (currentSnowballs < maximumSnowballCapacity
		// REMOVED: && terrain.SnowAvailable(transform.position)
		// TODO: neuer mechanismus.
//		) {
		collectionSnowTime = 0.0;
		currentSnowballs += 1;
		//terrain.GrabSnow(transform.position);
//	}
}

function CollectSnowPossible() : boolean {
	if (currentSnowballs < maximumSnowballCapacity && collectionSnowTime >= maxCollectionSnowTime && !died) {
		return true;
	}
	return false;
}

function GetFullHp () : int {
	return fullHp;
}

function GetHp () : int {
	return hp;
}

function IsDead () : boolean {
	return died;
}

function GameOver () {
	gameOver = true;
}

function SubtractSnowball() {
	if (currentSnowballs > 0) {
		currentSnowballs -= 1;
	}
}

function GetMaximumSnowballs () : int  {
	return maximumSnowballCapacity;
}

function GetCurrentSnowballs () : int {
	return currentSnowballs;
}

function GetSpawnBaseID () : int {
	return spawnBaseID;
}

function SetSpawnBaseID (newSpawnBaseID : int) {
	spawnBaseID = newSpawnBaseID;
	killTime = Time.time;
}