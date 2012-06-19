
@System.NonSerialized
var team :Team;

//This ID should be set when he wants to spawn at a certain base.
var spawnBaseID : int;
var respawnTimeout = 5.0;

private var gameOver = false;

enum PlayerState {Alive, Dead, Frozen, InVehicle}
private var formerItem :GameObject;

var fullHp : int = 10;
private var hp : int = fullHp;
private var killTime = -respawnTimeout;

private var state : PlayerState;
private var frozen :float;

var maximumSnowballCapacity : int = 10;
private var currentSnowballs : int = 0;

var maxCollectionSnowTime : float;
private var collectionSnowTime : float;

class Attack {
	var attacker :GameObject;
	var damageType :DamageType;
	var damage :int;
}

private var lastAttack :Attack;

function Start() {
	gameOver = false;
	SetState(PlayerState.Dead);
	
	team = transform.parent.gameObject.GetComponent("Team");
	if (team == null) {
		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
	}
}

function Update () {
	if (!gameOver) {
		switch (state) {
		case PlayerState.Dead:
			if (Time.time > killTime + respawnTimeout && spawnBaseID > 0) {
				Respawn();
			}
			break;
		case PlayerState.Frozen:
			frozen -= Time.deltaTime;
			if (frozen <= 0) {
				SetState(PlayerState.Alive);
				gameObject.SendMessage ("OnDefrost", SendMessageOptions.DontRequireReceiver);
			}
			frozen = Mathf.Clamp(frozen, 0, 100);
			break;
		case PlayerState.Alive:
			collectionSnowTime += Time.deltaTime;
			if (hp <= 0) {
				Die();
			}
			break;
		case PlayerState.InVehicle:
			
			break;
		}
	}
}

function OnControllerColliderHit(hit : ControllerColliderHit){
<<<<<<< HEAD
	var damageObject;
	var damage = 0;
	 if (hit.rigidbody && hit.rigidbody.CompareTag("BigSnowball")) {
		damageObject = hit.transform.GetComponent("BigSnowBallDamage");
		damage = damageObject.GetDamage();
		
		if (damage > 0) {
			hp -= damage;
			hp = Mathf.Max(0, hp);
			
			gameObject.SendMessage ("OnHit", SendMessageOptions.DontRequireReceiver);							
			gameObject.SendMessage ("ReleaseBall", SendMessageOptions.DontRequireReceiver);
			
			if (hp <= 0) {
				Die(null);
			}
=======
	if (!IsHittable()) {
		return;
	}
	
	if(hit.gameObject.CompareTag("BigSnowball")){
	
		var ballPosition = hit.transform.position;
		var playerPosition = gameObject.transform.position;
		var inversePosition = gameObject.transform.InverseTransformPoint(hit.transform.position);
		var ball :BigSnowBall = hit.gameObject.GetComponent(BigSnowBall);
		
		if (hit.rigidbody.velocity.sqrMagnitude > 0.04) {
			var attack = new Attack();
			attack.damage = hit.rigidbody.velocity.sqrMagnitude;
			// todo: die groesse vielleicht noch mit rein.
			attack.attacker = ball.GetLastOwner();
>>>>>>> 13282f5bdb94cf710a9083e4c213de0b8e40647c
		}
	}
}

function OnCollisionEnter (collision : Collision) {
	if (!IsHittable()) {
		return;
	}
	
	var ballPosition = collision.transform.position;
	var playerPosition = gameObject.transform.position;
	var inversePosition = gameObject.transform.InverseTransformPoint(collision.transform.position);
	var damageObject;
	
	if(collision.rigidbody && collision.rigidbody.CompareTag("Projectile")){
<<<<<<< HEAD
		//Get the damage Object
		damageObject = collision.transform.GetComponent("Damage");
		var damage = 0;
		//If the ball hits the player in the head.
=======
		
		var damageObject : Damage = collision.transform.GetComponent(Damage);
		var attack = new Attack();
>>>>>>> 13282f5bdb94cf710a9083e4c213de0b8e40647c
		if (inversePosition.y > 0.9) {
			attack.damage = damageObject.GetHeadDamage();
		} else if (inversePosition.z < -0.3) {
			attack.damage = damageObject.GetBehindDamage();
		} else {
			attack.damage = damageObject.GetFrontDamage();
		}
		
		ApplyDamage(attack);
	}
}

function Die () {
	if (IsDead()) {
		return;
	}
	
	if (transform.tag.Equals("Player")) {
		var mapOverview = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
		mapOverview.SetMode(true);
	}
	
	if (transform.tag.Equals("Player")) {
		spawnBaseID = 0;
	}
<<<<<<< HEAD
	
//	if (ball) {
		team.LoseTickets(1);
//	}
	
=======
>>>>>>> 13282f5bdb94cf710a9083e4c213de0b8e40647c

	team.LoseTickets(1);
	
	SetState(PlayerState.Dead);
	killTime = Time.time;
	
	gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
	gameObject.SendMessage ("RemoveTarget", SendMessageOptions.DontRequireReceiver);
	
}

function Freeze (attack :Attack) {
	if (state == PlayerState.Alive) {
		frozen = attack.damage;
		ApplyDamage(attack);
		if (!IsDead()) {
			SetState(PlayerState.Frozen);
		}
	}
}

function IsFrozen () :boolean {
	return state == PlayerState.Frozen;
}

function IsHittable () :boolean {
	return state == PlayerState.Alive && !gameOver;
}

function GetTeam () {
	return team;
}

function Respawn () {
	var newPosition : Vector3 = team.GetSpawnPoint(spawnBaseID);
	newPosition.y += 5;
	transform.position = newPosition;
	
	hp = fullHp;
	currentSnowballs = maximumSnowballCapacity;
	SetState(PlayerState.Alive);
	frozen = 0;
	
	gameObject.SendMessage ("OnRespawn", SendMessageOptions.DontRequireReceiver);
	if (transform.tag.Equals("Player")) {
		var overviewCam = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
		overviewCam.ResetPlayerCam();
		overviewCam.SetMode(false);
	}

}

function CollectSnow() {
	collectionSnowTime = 0.0;
	currentSnowballs += 1;
}

function CollectSnowPossible() : boolean {
	return	currentSnowballs < maximumSnowballCapacity
		&&  collectionSnowTime >= maxCollectionSnowTime
		&&  state == PlayerState.Alive;
}

function GetFullHp () : int {
	return fullHp;
}

function GetHp () : int {
	return hp;
}

function IsDead () : boolean {
	return state == PlayerState.Dead;
}

function GameOver () {
	gameOver = true;
}

function SubtractSnowball() {
	SubtractSnowball(1);
}

function SubtractSnowball(x) {
	if (currentSnowballs > 0) {
		currentSnowballs -= x;
	}
}

function ApplyDamage (attack :Attack) {
	if (IsHittable() || attack.damageType == DamageType.Crash) {
		lastAttack = attack;
		hp -= attack.damage;
		hp = Mathf.Max(0, hp);
		
		gameObject.SendMessage ("OnHit", attack, SendMessageOptions.DontRequireReceiver);										
		gameObject.SendMessage ("ReleaseBall", null, SendMessageOptions.DontRequireReceiver);
		
		if (hp <= 0) {
			Die();
		}
	}
}

function OnItemChange (im :ItemManager) {
	var g :GameObject = im.GetItem();
	if (!IsDead()) {
		if (formerItem && formerItem.CompareTag("Ufo")) {
			SetState(PlayerState.Alive);
		}
		if (g && g.CompareTag("Ufo")) {
			SetState(PlayerState.InVehicle);
		}
	}
	formerItem = g;
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

private function SetState (s :PlayerState) {
	state = s;
	SendMessage("OnPlayerStateChange", state, SendMessageOptions.DontRequireReceiver);
}