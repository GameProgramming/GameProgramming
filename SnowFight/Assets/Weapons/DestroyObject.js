var explosion : GameObject;
var destructionDelay :float = 0;


function OnCollisionEnter(collision : Collision){
	if (Network.isServer) {
		collision.gameObject.SendMessage("OnHitByObject", gameObject, SendMessageOptions.DontRequireReceiver);
		networkView.RPC("NetHitSomething", RPCMode.All);
	}
}

function SelfDestruct() {
	if (Network.isServer) {
		networkView.RPC("NetHitSomething", RPCMode.All);
	}
}

@RPC
function NetHitSomething (){
	var explosionClone = Instantiate(explosion,transform.position,transform.rotation);
	explosionClone.GetComponent("Detonator").Explode();
	var trail :TrailRenderer = GetComponent(TrailRenderer);
	if (trail) {
		destructionDelay = Mathf.Max(destructionDelay, trail.time); 
	}
	if (destructionDelay > 0) {
		for (var rb :Rigidbody in GetComponentsInChildren(Rigidbody)) {
			rb.isKinematic = true;
			rb.detectCollisions = false;
		}
		for (var rd :MeshRenderer in GetComponentsInChildren(MeshRenderer)) {
			rd.enabled = false;
		}
		for (var ps :ParticleSystem in GetComponentsInChildren(ParticleSystem)) {
			ps.enableEmission = false;
		}
		yield WaitForSeconds(destructionDelay);
	}
	Destroy(gameObject);
}

@script RequireComponent (NetworkView)