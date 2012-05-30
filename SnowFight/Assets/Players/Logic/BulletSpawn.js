var projectile : Rigidbody;
var damage = 5;
var reloadTime = 30;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

var reloadProgress = 0;

@System.NonSerialized
var inputFire : boolean = false;

function Start() {
	player = transform.parent.GetComponent(PlayerStatus);
	motor = transform.parent.GetComponent(CharacterMotorSF);
}

function Update () {
	reloadProgress -= Time.deltaTime;
	if(inputFire && reloadProgress <= 0){
		player.SubtractSnowball();
	    Spawnpoint = transform;
	  	var clone : Rigidbody;	
		clone = Instantiate(projectile, Spawnpoint.position, Spawnpoint.rotation);
		
		clone.velocity = 30 * Spawnpoint.TransformDirection (Vector3.forward
								+ new Vector3(0, 0.03+motor.rotationY*.015,0) );
		if(clone.GetComponent("Damage")) {
			clone.GetComponent("Damage").dmg = damage;
			clone.GetComponent("Damage").team = player.team;
		}
		
		inputFire = false;
		reloadProgress = reloadTime;
	}
}