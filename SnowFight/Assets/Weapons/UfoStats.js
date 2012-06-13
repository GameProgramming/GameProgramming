
var life : int = 100;

function Start () {
	Debug.Log("ufostart");
}

function Update () {
//	if (transform.parent.transform.parent.transform.tag == "Player"){
//				player = transform.parent.transform.parent.transform;
//				player.GetComponent(PlayerStatus).Die(null);
//			}
}

function OnCollisionEnter (collision : Collision) {
	//Get all required positions.
	Debug.Log("ufo on colission");
	var ballPosition = collision.transform.position;
	var ufoPosition = gameObject.transform.position;
	var inversePosition = gameObject.transform.InverseTransformPoint(collision.transform.position);
	if(collision.rigidbody && collision.rigidbody.tag.Equals("Projectile")){
		//Get the damage Object
		var damageObject : Damage = collision.transform.GetComponent("Damage");
		var damage = 0;
		//If the ball hits the player in the head.
		if (inversePosition.y > 0.9) {
			damage = damageObject.GetHeadDamage();
			//Debug.Log("Hit in the head.");
			//Debug.Log(damage);
		//He hits the player from behind.
		} else if (inversePosition.z < -0.3) {
			damage = damageObject.GetBehindDamage();
			//Debug.Log("Hit from behind.");
			//Debug.Log(damage);
		} else {
			damage = damageObject.GetFrontDamage();
			//Debug.Log("Hit from side or front.");
			//Debug.Log(damage);
		}
		
		if (damage > 0) {
			life -= damage;
			life = Mathf.Max(0, life);
		}
		Debug.Log("ufo life:"+life);
		
					
		if (life <= 0) {
			if (transform.parent.transform.parent.transform.tag == "Player"){
				player = transform.parent.transform.parent.transform;
				player.GetComponent(PlayerStatus).Die(damageObject);
			}
			Destroy (gameObject);
		}
	}
}
