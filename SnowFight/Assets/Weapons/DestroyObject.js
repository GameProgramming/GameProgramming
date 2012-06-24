var explosion : GameObject;

function Update () {

}

function OnCollisionEnter(collision : Collision){
	if (Network.isServer) {
		networkView.RPC("NetHitSomething", RPCMode.All);
	}
}

@RPC
function NetHitSomething (){
	var explosionClone = Instantiate(explosion,transform.position,transform.rotation);
	explosionClone.GetComponent("Detonator").Explode();
	Destroy(gameObject);
}