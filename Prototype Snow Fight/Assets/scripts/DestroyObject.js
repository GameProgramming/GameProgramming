var explosion : GameObject;

function Update () {

}
function OnCollisionEnter(collision : Collision){
	var explosionClone = Instantiate(explosion,transform.position,transform.rotation);
	explosionClone.GetComponent("Detonator").Explode();
	Destroy(gameObject);
}