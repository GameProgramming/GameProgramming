var projectile : Rigidbody;

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
		
		//Debug.Log (clone.tag);	
		inputFire = false;
		reloadProgress = 50;
	}
}

function SetInputFire () {
	inputFire = true;
}