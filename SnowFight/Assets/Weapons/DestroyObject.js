var explosion : GameObject;


function OnCollisionEnter(collision : Collision){
	if (Network.isServer) {
		collision.gameObject.SendMessage("OnHitByObject", gameObject, SendMessageOptions.DontRequireReceiver);
		networkView.RPC("NetHitSomething", RPCMode.All);
	}
}

@RPC
function NetHitSomething (){
	var explosionClone = Instantiate(explosion,transform.position,transform.rotation);
	explosionClone.GetComponent("Detonator").Explode();
	var trail :TrailRenderer = GetComponent(TrailRenderer);
	if (trail) {
		rigidbody.isKinematic = true;
		rigidbody.detectCollisions = false;
		renderer.enabled = false;
		yield WaitForSeconds(trail.time);
	}
	Destroy(gameObject);
}

@script RequireComponent (NetworkView)