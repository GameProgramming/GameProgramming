var projectile : Rigidbody;
var damage = 5;

function Update () {

	if(Input.GetButtonDown("Fire1")){
	    Spawnpoint = transform.Find("/Player/BulletSpawnPoint");	
		SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);	
		var clone : Rigidbody;	
		clone = Instantiate(projectile, SpawnVector, Spawnpoint.rotation);
		
		clone.velocity = Spawnpoint.TransformDirection (SpawnVector.forward*20);
	}
}