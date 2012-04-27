var teamNumber = 1;
var totalHp : int = 50;
var hp : int = totalHp;
InvokeRepeating("Regenerate",5,5);
//var damageSound : AudioClip;


function Update () {
  if(hp==0){
  	//audio.PlayOneShot(damageSound);
  	gameObject.GetComponent("Detonator").Explode();
  }
}

function Regenerate () {
  hp = totalHp;
}

function OnCollisionEnter (collision : Collision) {
	if(collision.rigidbody.tag.Equals("Projectile")){
		var ball = collision.rigidbody.GetComponent("Damage");
		hp = hp - ball.dmg;
		//audio.PlayOneShot(damageSound);
		
		GameState = GameObject.Find("Main Camera").GetComponent("Game");
		GameState.UpdateScore(ball.team);
	}

}
