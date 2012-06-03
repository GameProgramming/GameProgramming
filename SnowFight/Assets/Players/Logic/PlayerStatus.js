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
private var collectionSnowTime : float;

private var terrain :TerrainSnow;

//InvokeRepeating("Regenerate",5,10);
//var damageSound : AudioClip;

function Start() {
	gameOver = false;
	
	terrain = GameObject.Find("/Terrain").GetComponent("TerrainSnow");
	team = transform.parent.gameObject.GetComponent("Team");
	if (team == null) {
		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
	}
}

function Update () {
	//Every one second collect a snowball.
	collectionSnowTime += Time.deltaTime;
	if (collectionSnowTime >= 1.5) {
		collectionSnowTime = 0.0;
		//Collect snowball.
		CollectSnow();
	}
	if (!gameOver) {

		if (died && Time.time > killTime + respawnTimeout)
			Respawn();
	}
	
	
}

function Regenerate () {
	if (!gameOver && hp < fullHp) {
		hp += 5;
		hp = Mathf.Min(hp, fullHp);
	}
}

function OnCollisionEnter (collision : Collision) {

	if(collision.rigidbody && collision.rigidbody.tag.Equals("Projectile")){
		var ball :Damage = collision.transform.GetComponent("Damage");
		
		if (ball) {
			hp -= ball.GetDamage();
			hp = Mathf.Max(0, hp);
		}
		
		gameObject.SendMessage ("OnHit", SendMessageOptions.DontRequireReceiver);										
		gameObject.SendMessage ("ReleaseBall", SendMessageOptions.DontRequireReceiver);
		
		if (hp <= 0) {
			Die(ball);
		}
	}
}

function Die (ball : Damage) {
	if (died) //we're already dead
		return;
	
	if (ball) {
		team.LoseTickets(1);
	}
	
	died = true;
	killTime = Time.time;
	
	gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
}

function Respawn () {
	respawning = true;
	
	var teamSpawnPoints = team.GetSpawnPoints();
	
	if (teamSpawnPoints && teamSpawnPoints.Length > 0) {
		transform.position = teamSpawnPoints[Random.Range(0,teamSpawnPoints.Length-1)].position;
		transform.position.y += 5;
	}
	
	hp = fullHp;
	died = false;
	
	gameObject.SendMessage ("OnRespawn", SendMessageOptions.DontRequireReceiver);
}

function CollectSnow() {
	if (currentSnowballs < maximumSnowballCapacity && terrain.SnowAvailable(transform.position)) {
		currentSnowballs += 1;
		terrain.GrabSnow(transform.position);
	}
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