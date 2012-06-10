#pragma strict
private var owner : GameObject;
private var itemMesh : Transform;
private var weaponMesh : Transform;
private var bulletSpawn : Transform;

function Start () {
	itemMesh = transform.Find("Item");
	weaponMesh = transform.Find("Weapon");
	bulletSpawn = transform.Find("Weapon/BulletSpawn");
	weaponMesh.renderer.enabled = false;
	itemMesh.renderer.enabled = true;
}

function Update () {
	
}


function Move (offset : Vector3) {
	
}

function Release () {
	transform.parent = null;
	weaponMesh.renderer.enabled = false;
	itemMesh.renderer.enabled = true;
	collider.enabled = true;
}

function PickItem(player :GameObject) {
	owner = player;
	collider.enabled = false;
	transform.parent = owner.transform;
	transform.localPosition = Vector3.zero;
	transform.localRotation = Quaternion.identity;
	weaponMesh.renderer.enabled = true;
	itemMesh.renderer.enabled = false;
}