#pragma strict
private var owner : GameObject;
private var mesh : Transform;
private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;
private var freezer : FreezingRay;

private var velo :Vector3 = Vector3.zero;

@System.NonSerialized
private var terrain :Terrain;

function Start () {
	mesh = transform.Find("Ufo");
	bulletSpawn = transform.Find("Ufo/BulletSpawn");
	freezer = transform.Find("Ufo/FreezingRay").GetComponent(FreezingRay);
	velo = Vector3.zero;
	terrain = Terrain.activeTerrain;
}

function Update () {
	if (owner) {
		if (playerMotor.inputFire && bulletSpawn.GetComponent(BulletSpawn).reloadProgress <= 0) {
			bulletSpawn.GetComponent(BulletSpawn).Fire();
		}
		freezer.SetActive(playerMotor.inputAltFire);
	}
}

function FixedUpdate () {
	var terrH :float = terrain.SampleHeight(transform.position) + 2.0 + 0.5 * Mathf.Sin(Time.time*2);
	if (owner) {
		velo += Time.deltaTime * playerMotor.inputMoveDirection;
		terrH += 10.0;
	}
	velo.y = 0.03*(terrH - transform.position.y);
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
	
	var parent = GameObject.Find("Items");
	if (parent)
		transform.parent = parent.transform;
		
	//collider.enabled = true;
	playerMotor.SetFloating(false);
	GameObject.FindGameObjectWithTag("OverviewCam")
		.GetComponent(MapOverview).ResetPlayerCam();
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
	
	if (player.CompareTag("Player")) {
		GameObject.FindGameObjectWithTag("OverviewCam")
		.GetComponent(MapOverview).SetPlayerCam(transform.Find("UfoCam"));
	}

}
