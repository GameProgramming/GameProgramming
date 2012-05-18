var projectile : Rigidbody;
var damage = 5;

private var shootingTeam : int;
private var player : PlayerStatus;

var reloadProgress = 0;

@System.NonSerialized
var inputFire : boolean = false;

function Start () {
	
}

function Update () {
	reloadProgress -= Time.deltaTime;
	if(inputFire && reloadProgress <= 0){
	    Spawnpoint = transform;
		SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);	
		var clone : Rigidbody;	
		clone = Instantiate(projectile, SpawnVector, Spawnpoint.rotation);
		
		clone.velocity = Spawnpoint.TransformDirection (SpawnVector.forward*20);
		if(clone.GetComponent("Damage")) {
			clone.GetComponent("Damage").dmg = damage;
			clone.GetComponent("Damage").team = shootingTeam;
		}
			
		inputFire = false;
		reloadProgress = 50;
	}
}