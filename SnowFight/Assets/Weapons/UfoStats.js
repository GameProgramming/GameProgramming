


function Start () {
//	Debug.Log("ufostart");
}

function Update () {
//	if (transform.parent.transform.parent.transform.tag == "Player"){
//				player = transform.parent.transform.parent.transform;
//				player.GetComponent(PlayerStatus).Die(null);
//			}
}

function OnCollisionEnter (collision : Collision) {
	var ballPosition = collision.transform.position;
	var ufoPosition = gameObject.transform.position;
	var inversePosition = gameObject.transform.InverseTransformPoint(collision.transform.position);
	if(collision.rigidbody && collision.rigidbody.tag.Equals("Projectile")){
		var damageObject : Damage = collision.transform.GetComponent("Damage");
		var attack :Attack = new Attack();
		attack.damage = 0;
		// TODO: Macht das hier beim UFO irgendeinen Sinn???
		if (inversePosition.y > 0.9) {
			attack.damage = damageObject.GetHeadDamage();
		} else if (inversePosition.z < -0.3) {
			attack.damage = damageObject.GetBehindDamage();
		} else {
			attack.damage = damageObject.GetFrontDamage();
		}		
		transform.parent.gameObject.SendMessage("ApplyDamage", attack);
	}
}
