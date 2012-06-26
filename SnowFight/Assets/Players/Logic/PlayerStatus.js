
@System.NonSerialized
var team :Team;
private var teamNumber : int;

//This ID should be set when he wants to spawn at a certain base.
@System.NonSerialized
var spawnBaseID : int;
var respawnTimeout = 5.0;

private var gameOver = false;

enum PlayerState {Alive, Dead, Frozen, InVehicle}
private var formerItem :GameObject;

var fullHp : int = 10;
private var hp : int = fullHp;
private var killTime = -respawnTimeout;

private var state : PlayerState = PlayerState.Dead;
private var frozen :float;

var maximumSnowballCapacity : int = 10;
private var currentSnowballs : int = 0;

var maxCollectionSnowTime : float;
private var collectionSnowTime : float;

private var isMainPlayer :boolean = false;
private var game :GameStatus;

class Attack {
	var attacker :GameObject;
	var damageType :DamageType;
	var damage :int;
}

private var lastAttack :Attack;

function Awake () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
}

function Start() {
	gameOver = false;
	SetState(PlayerState.Dead);
	
//	team = transform.parent.gameObject.GetComponent("Team");
//	if (team == null) {
//		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
//	}
}

function JoinTeam (t :Team) {
	if (networkView.isMine) {
		networkView.RPC("NetJoinTeam", RPCMode.AllBuffered, t.teamNumber);
	}
}

@RPC
function NetJoinTeam (teamId : int) {
	team = game.GetTeamById(teamId);
	transform.parent = team.transform;
	gameObject.SendMessage("OnJoinTeam", team, SendMessageOptions.DontRequireReceiver);
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
	if (!IsHittable()) {
		return;
	}
	
	if(hit.gameObject.CompareTag("BigSnowball")){
	
		var ballPosition = hit.transform.position;
		var playerPosition = gameObject.transform.position;
		var inversePosition = gameObject.transform.InverseTransformPoint(hit.transform.position);
		var ball :BigSnowBall = hit.gameObject.GetComponent(BigSnowBall);
		var damageObject :BigSnowBallDamage = hit.transform.GetComponent(BigSnowBallDamage);
		var lastOwner : GameObject = ball.GetLastOwner();
		
		if (hit.rigidbody.velocity.sqrMagnitude > 0.04 && lastOwner != gameObject) {
			var attack = new Attack();
			attack.damage = damageObject.GetDamage();
			// todo: die groesse vielleicht noch mit rein.
			attack.attacker = lastOwner;
			ApplyDamage(attack);
			ball.SmashBallToSnowfield();
		}
	}
}

function OnHitByObject (otherObj : GameObject) {
	if (!IsHittable()) {
		return;
	}
	
	var ballPosition = otherObj.transform.position;
	var playerPosition = gameObject.transform.position;
	var inversePosition = gameObject.transform.InverseTransformPoint(otherObj.transform.position);
	
	if(otherObj.rigidbody && otherObj.rigidbody.CompareTag("Projectile")){
		var damageObject : Damage = otherObj.GetComponent(Damage);
		var attack = new Attack();
		
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
	if (Network.isServer) {
		networkView.RPC("NetDie", RPCMode.Others);
		NetDie();
		team.LoseTickets(1);
	}
}

@RPC
function NetDie () {
	if (IsMainPlayer()) {
		var mapOverview = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
		mapOverview.SetMode(true);
		
		spawnBaseID = 0;
	}
	
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

function IsRidingUfo () : boolean {
	return state == PlayerState.InVehicle;
	//return transform.FindChild("Ufo")!=null;
//	return gameObject.FindWithTag("Ufo");
}


function GetTeam () {
	return team;
}

function Respawn () {
	if (networkView.isMine) {
		networkView.RPC("NetRespawn", RPCMode.All, spawnBaseID);
	}
}

@RPC
function NetRespawn ( spawnBase :int ) {

	Debug.Log("Net respawn ");
	//spawnBaseID = spawnBase;
	
	var newPosition : Vector3 = team.GetSpawnPoint(spawnBaseID);
	newPosition.y += 5;
	transform.position = newPosition;
	
	hp = fullHp;
	currentSnowballs = maximumSnowballCapacity;
	SetState(PlayerState.Alive);
	frozen = 0;
	
	gameObject.SendMessage ("OnRespawn", SendMessageOptions.DontRequireReceiver);
	if (IsMainPlayer()) {
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
	if (Network.isServer && (IsHittable() || attack.damageType == DamageType.Crash)) {
		hp -= attack.damage;
		hp = Mathf.Max(0, hp);
		var dT :int = attack.damageType;
		networkView.RPC("NetApplyDamage", RPCMode.Others, hp, dT);
		Debug.Log("NetHit Send");
		gameObject.SendMessage ("OnHit", attack, SendMessageOptions.DontRequireReceiver);										
		gameObject.SendMessage ("ReleaseBall", null, SendMessageOptions.DontRequireReceiver);
				
		if (hp <= 0) {
			Die();
		}
	}
}

@RPC
function NetApplyDamage (newHp :int, damageType :int) {
	Debug.Log("NetHit Recv");
	//TODO: irgendwie den attacker durchs netzwerk uebertragen.
	lastAttack = new Attack();
	lastAttack.damage = hp - newHp;
	lastAttack.damageType = damageType;
	hp = newHp;
	
	gameObject.SendMessage ("OnHit", lastAttack, SendMessageOptions.DontRequireReceiver);										
	gameObject.SendMessage ("ReleaseBall", null, SendMessageOptions.DontRequireReceiver);
}

function OnItemChange (item : GameObject) {
	//var g :GameObject = im.GetItem();
	if (!IsDead()) {
		if (formerItem && formerItem.CompareTag("Ufo")) {
			SetState(PlayerState.Alive);
		}
		if (item && item.CompareTag("Ufo")) {
			SetState(PlayerState.InVehicle);
		}
	}
	formerItem = item;
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

function GetTeamNumber () : int {
	return team.GetTeamNumber();
}

function OnSetBot () {
	isMainPlayer = false;
}
function OnSetMainPlayer () {
	isMainPlayer = true;
}
function OnSetRemote () {
	isMainPlayer = false;
}

function IsMainPlayer () {
	return isMainPlayer;
}