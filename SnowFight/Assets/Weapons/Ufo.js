#pragma strict
private var owner : GameObject;
private var mesh : Transform;
private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;

private var progress :float = 0;

private var velo :Vector3 = Vector3.zero;

@System.NonSerialized
private var terrain :Terrain;

function Start () {
	mesh = transform.Find("Ufo");
	bulletSpawn = transform.Find("Ufo/BulletSpawn");
	velo = Vector3.zero;
	terrain = Terrain.activeTerrain;
}

function FixedUpdate () {
	var terrH :float = terrain.SampleHeight(transform.position) + 3.0 + 0.5 * Mathf.Sin(Time.time*2);
	if (owner) {
		velo += Time.deltaTime * playerMotor.inputMoveDirection;
		terrH += 10.0;
	}
	velo.y = 0.1*(terrH - transform.position.y);
	velo *= 0.95;
	if (owner) {
		owner.transform.position += velo;
	} else {
		transform.position += velo;
	}
}


function Move (offset : Vector3) {
	
}

function Release () {
	owner = null;
	transform.parent = null;
	//collider.enabled = true;
	playerMotor.SetFloating(false);
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
	playerMotor.SetFloating(true);
}