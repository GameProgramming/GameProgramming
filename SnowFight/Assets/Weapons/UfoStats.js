


function Start () {
//	Debug.Log("ufostart");
}

function Update () {
//	if (transform.parent.transform.parent.transform.tag == "Player"){
//				player = transform.parent.transform.parent.transform;
//				player.GetComponent(PlayerStatus).Die(null);
//			}
}

function OnHitByObject (other :GameObject) {
	var ufoPosition = gameObject.transform.position;
	var inversePosition = gameObject.transform.InverseTransformPoint(other.transform.position);
	if(other.rigidbody && other.rigidbody.tag.Equals("Projectile")){
		var damageObject : Damage = other.GetComponent("Damage");
		var attack :Attack = new Attack();
		attack.damage = damageObject.GetFrontDamage();
		attack.attacker = damageObject.GetShooter();
		transform.parent.gameObject.SendMessage("ApplyDamage", attack);
	}
}
