#pragma strict
private var owner : GameObject;
private var mesh : Transform;
private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;
private var freezer : FreezingRay;

private var velo :Vector3 = Vector3.zero;

@System.NonSerialized
private var terrain :Terrain;

var hp : int = 100;
var maxHp : int = 100;
private var lastAttack :Attack;


function Start () {
	mesh = transform.Find("Ufo");
	bulletSpawn = transform.Find("Ufo/BulletSpawn");
	freezer = transform.Find("Ufo/FreezingRay").GetComponent(FreezingRay);
	velo = Vector3.zero;
	terrain = Terrain.activeTerrain;
	transform.Find("EngineParticles").particleSystem.enableEmission = false;
}

function Update () {
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
		hp = Mathf.Max(0, hp);
	}
}


function NetApplyDamage (attack :Attack) {
	lastAttack = attack;
	hp -= attack.damage;
	hp = Mathf.Max(0, hp);
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

function GameOver () {
	this.enabled = false;
}

@script RequireComponent (NetworkView)