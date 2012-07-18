#pragma strict
private var owner : GameObject;
private var mesh : Transform;
private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;
private var freezer : FreezingRay;

private var velo :Vector3 = Vector3.zero;

var explosion :GameObject;

@System.NonSerialized
private var terrain :Terrain;

var hp : int = 100;
var maxHp : int = 100;
private var lastAttack : Attack;

private var px : float; 
private var pz : float; 

private var mapCenter :Transform;
private var game :GameStatus;

function PlayAudio(audio : AudioClip){
	transform.audio.clip=audio;
	if(!transform.audio.isPlaying){
	    	   	transform.audio.Play();
	}
}
function StopAudio(){
	if(transform.audio.isPlaying){
	    	   	transform.audio.Pause();
	}
}

function Awake () {
	px = transform.position.x;
	pz = transform.position.z;
	
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	mapCenter = GameObject.Find("/Game/MapCenter").transform;
	
	mesh = transform.Find("Ufo");
	bulletSpawn = transform.Find("Ufo/BulletSpawn");
	freezer = transform.Find("Ufo/FreezingRay").GetComponent(FreezingRay);
	velo = Vector3.zero;
	terrain = Terrain.activeTerrain;
	if (transform.Find("EngineParticles"))
		transform.Find("EngineParticles").particleSystem.enableEmission = false;
	if (transform.Find("DamageParticles"))
		transform.Find("DamageParticles").particleSystem.enableEmission = false;
}

function PlayUfoSounds(){
	var pxRound:float = Mathf.Round(px * 10.0f) / 10.0f;
	var pzRound:float = Mathf.Round(pz * 10.0f) / 10.0f;
	
	var posXRound:float = Mathf.Round(transform.position.x  * 10.0f) / 10.0f;
	var posZRound:float = Mathf.Round(transform.position.z * 10.0f) / 10.0f;

	if(pxRound != posXRound || pzRound != posZRound){
		px = transform.position.x;
		pz = transform.position.z;
		if(!transform.Find("MoveSound").audio.isPlaying){
	    	   	transform.Find("MoveSound").audio.Play();
		}	
	}else if(pxRound == posXRound && pzRound == posZRound){
		if(!transform.Find("HoverSound").audio.isPlaying){
	    	   	transform.Find("HoverSound").audio.Play();
		}
	}
}

function Update () {

	if (owner && !transform.parent)
		owner = null;
	
	if (owner) {
		PlayUfoSounds();
	}
	
	if (owner && networkView.isMine) {
		if (playerMotor.inputFire && bulletSpawn.GetComponent(BulletSpawn).reloadProgress <= 0) {
			bulletSpawn.GetComponent(BulletSpawn).Fire();
		}
		freezer.SetActive(playerMotor.inputAltFire);
	}
}

function FixedUpdate () {
	var terrH :float = terrain.SampleHeight(transform.position) + 2.0 + 0.5 * Mathf.Sin(Time.time*2);
	
	if (hp > 0) {
		if (owner && owner.networkView.isMine) {
			velo += Time.deltaTime * playerMotor.inputMoveDirection;
			terrH += 10.0;
		}
		velo.y = 0.03*(terrH - transform.position.y);
		velo *= 0.91;
	} else {
		velo.y -= 0.003;
		transform.eulerAngles.y += velo.y * 30.0;
		transform.eulerAngles.z += 1.0;
		velo += transform.forward * 0.002;
		if (transform.position.y <= terrH + 2) {
			// hit the ground
			Crash();
		}
	}
	if (owner && owner.networkView.isMine) {
		playerMotor.SetVelocity(1.0*velo);
	} else if (owner == null) {
		transform.position += velo;
	}
	
	if (Vector3.SqrMagnitude(mapCenter.position - transform.position)
				> game.mapRadius*game.mapRadius) {
		var attack = new Attack();
		attack.damage = 20;
		ApplyDamage(attack);
	}
}

function IsCrashing () :boolean {
	return hp <= 0;
}


function Move (offset : Vector3) {
	
}

function Release () {
	if (owner) {
		owner.transform.position.y += 0.2;
	}
	
	owner = null;
	transform.parent = null;
	transform.Find("EngineParticles").particleSystem.enableEmission = false;
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer(null);
}

function PickItem(player :GameObject) {
	owner = player;
	//collider.enabled = false;
	playerMotor = player.GetComponent(CharacterMotorSF);
	owner.transform.position = transform.position;
	owner.transform.rotation = transform.rotation;
	transform.parent = owner.transform;
	transform.localPosition = Vector3.zero;
	transform.localRotation = Quaternion.identity;
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer (player.transform);
	freezer.ConnectToPlayer (player.transform);
	var ps :ParticleSystem = transform.Find("EngineParticles").particleSystem;
	ps.enableEmission = true;
	ps.startColor = player.GetComponent(PlayerStatus).team.color;
}

function ApplyDamage (attack :Attack) {
	if (Network.isServer) {
		lastAttack = attack;
		hp -= attack.damage;
		if (hp < maxHp / 2 && transform.Find("DamageParticles")) {
			transform.Find("DamageParticles").particleSystem.enableEmission = true;
		}
		hp = Mathf.Max(0, hp);
	}
}


function NetApplyDamage (attack :Attack) {
	lastAttack = attack;
	hp -= attack.damage;
	hp = Mathf.Max(0, hp);
	if (hp < maxHp / 2 && transform.Find("DamageParticles")) {
		transform.Find("DamageParticles").particleSystem.enableEmission = true;
	}
}

function Crash () {
	if (owner) {
		var attack = new Attack();
		attack.damageType = DamageType.Crash;
		attack.damage = 10000; // lethal, i hope ;)
		attack.attacker = lastAttack ? lastAttack.attacker : null;
		owner.SendMessage("ApplyDamage", attack);
		owner = null;
	}
	if (Network.isServer) {
		Network.Destroy (gameObject);
	}
//	else
//		Destroy(gameObject);
}

function OnDestroy() {
	Debug.Log("Destroy UFO");
	if (Network.isServer) {
		GameObject.FindGameObjectWithTag("Game").SendMessage("LogDestruction", networkView.viewID);
	}
	if (hp <= 0) {
		Instantiate(explosion, transform.position, transform.rotation);
	}
	
	if (owner) {
		owner.SendMessage("OnItemDestruction", gameObject, SendMessageOptions.DontRequireReceiver);
		var attack = new Attack();
		attack.damageType = DamageType.Crash;
		attack.damage = 10000; // lethal, i hope ;)
		attack.attacker = lastAttack ? lastAttack.attacker : null;
		owner.SendMessage("ApplyDamage", attack, SendMessageOptions.DontRequireReceiver);
		owner = null;
	}
}

function GetOwner () : GameObject {
	return owner;
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
	var nHp :int = hp;
    stream.Serialize(nHp);
    if (nHp != hp) {
    	var a :Attack = new Attack();
    	a.damage = hp - nHp;
    	NetApplyDamage(a);
    }
}

function OnPlayerConnected (player :NetworkPlayer) {
	networkView.RPC("NetSyncPos", player, transform.localPosition);
}

@RPC
function NetSyncPos ( pos :Vector3 ) {
	transform.localPosition = pos;
}

function GameOver () {
	this.enabled = false;
}

@script RequireComponent (NetworkView)