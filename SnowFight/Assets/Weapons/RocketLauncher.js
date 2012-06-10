#pragma strict
private var owner : GameObject;
private var itemMesh : Transform;
private var weaponMesh : Transform;
private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;

private var progress :float = 0;

function Start () {
	itemMesh = transform.Find("Item");
	weaponMesh = transform.Find("Weapon");
	bulletSpawn = transform.Find("Weapon/BulletSpawn");
	weaponMesh.renderer.enabled = false;
	itemMesh.renderer.enabled = true;
}

function Update () {
	if (owner) {
		if (playerMotor.inputFire && progress == 0 && bulletSpawn.GetComponent(BulletSpawn).reloadProgress <= 0 
			&& owner.GetComponent(PlayerStatus).GetCurrentSnowballs() > 0) {
			progress = 1;
			//gameObject.SendMessage ("OnLoadThrow", SendMessageOptions.DontRequireReceiver);
		} else if (progress > 0) {
			progress += Time.deltaTime * 4;
			if (!playerMotor.inputFire) {
				if (progress > 2) {
					bulletSpawn.GetComponent(BulletSpawn).Fire();
					//gameObject.SendMessage ("OnThrow", SendMessageOptions.DontRequireReceiver);
				}
				progress = 0;
			}
		} else {
			//gameObject.SendMessage ("OnUnloadThrow", SendMessageOptions.DontRequireReceiver);
			progress = 0;
		}
	}
}


function Move (offset : Vector3) {
	
}

function Release () {
	owner = null;
	transform.parent = null;
	weaponMesh.renderer.enabled = false;
	itemMesh.renderer.enabled = true;
	collider.enabled = true;
}

function PickItem(player :GameObject) {
	owner = player;
	collider.enabled = false;
	playerMotor = player.GetComponent(CharacterMotorSF);
	transform.parent = owner.transform;
	transform.localPosition = Vector3.zero;
	transform.localRotation = Quaternion.identity;
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer (player.transform);
	weaponMesh.renderer.enabled = true;
	itemMesh.renderer.enabled = false;
}