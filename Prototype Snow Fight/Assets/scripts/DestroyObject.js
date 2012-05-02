var explosion : GameObject;

function Update () {

}
function OnCollisionEnter(collision : Collision){
	var explosionClone = Instantiate(explosion,transform.position,transform.rotation);
	
//	if (collision.gameObject.CompareTag("Player") || collision.gameObject.CompareTag("Bot")) {
//		//explosionClone.GetComponent("Detonator").autoCreateGlow = true;
//		explosionClone.GetComponent("Detonator").GlowOnHit();
//	}
	explosionClone.GetComponent("Detonator").Explode();
	Destroy(gameObject);
}