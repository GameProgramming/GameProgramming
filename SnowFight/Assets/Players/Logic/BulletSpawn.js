var projectile : Rigidbody;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

private var weapon = "Snowball";

var reloadProgress = 0;

@System.NonSerialized
var inputFire : boolean = false;

function Start() {
	player = transform.parent.GetComponent(PlayerStatus);
	motor = transform.parent.GetComponent(CharacterMotorSF);
	SetWeapon("Snowball");
}

function Update () {
	if (Input.GetKeyDown (KeyCode.Alpha0))
		SetWeapon("Snowrocket");  
	if (Input.GetKeyDown (KeyCode.Alpha1))
		SetWeapon("Snowball");  
	
	reloadProgress -= Time.deltaTime;
}

function Fire () {
	if(reloadProgress <= 0 && player.GetCurrentSnowballs() > 0){
		player.SubtractSnowball();
	    Spawnpoint = transform;
	  	var clone : Rigidbody;	
		clone = Instantiate(projectile, Spawnpoint.position, Spawnpoint.rotation);
		
		clone.velocity = clone.GetComponent("Projectile").speed * Spawnpoint.TransformDirection (Vector3.forward
								+ new Vector3(0, 0.03+motor.rotationY*.015,0) );
		if(clone.GetComponent("Damage")) {
			clone.GetComponent("Damage").dmg = clone.GetComponent("Projectile").dmg;
			clone.GetComponent("Damage").team = player.team;
		}
		
		inputFire = false;
		reloadProgress = clone.GetComponent("Projectile").reloadTime;
	}
}

function SetWeapon (name :String) {
	weapon = name;
	projectile = AssetDatabase.LoadAssetAtPath("Assets/Weapons/" + weapon + ".prefab", typeof(Rigidbody));
}