var projectile : Rigidbody;
var damage = 5;

var reloadProgress = 0;

@System.NonSerialized
var inputFire : boolean = false;

function Update () {
	reloadProgress -= Time.deltaTime;
	if(inputFire && reloadProgress <= 0){
	    Spawnpoint = transform;
		SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);	
		var clone : Rigidbody;	
		clone = Instantiate(projectile, SpawnVector, Spawnpoint.rotation);
		
		clone.velocity = Spawnpoint.TransformDirection (SpawnVector.forward*20);
		inputFire = false;
		reloadProgress = 50;
	}
}