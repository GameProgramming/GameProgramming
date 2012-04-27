var hp : int = 50;
InvokeRepeating("Regenerate",5,5);
//var damageSound : AudioClip;


function Update () {
  if(hp==0){
  	//audio.PlayOneShot(damageSound);
  	gameObject.GetComponent("Detonator").Explode();
  }
}

function Regenerate () {
  hp = hp + 1;
}

function OnCollisionEnter (collision : Collision) {
	if(collision.rigidbody){
		hp = hp - 5;
		//audio.PlayOneShot(damageSound);
	}

}
