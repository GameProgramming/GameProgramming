var teamNumber = 1;
var teamBase : Transform;
var fullHp : int = 50;
var stunDuration = 3.0;

private var hp : int = fullHp;
private var isControllable = true;
private var stunTime;
private var gameState : GameStatus;
//InvokeRepeating("Regenerate",5,5);
//var damageSound : AudioClip;


function Update () {
  if(hp==0){
  	//audio.PlayOneShot(damageSound);
  	gameObject.GetComponent("Detonator").Explode();
  }
  
  if(!isControllable && Time.time > stunTime + stunDuration)
  	isControllable = true;
}

//function Regenerate () {
//  hp = fullHp;
//}

function OnCollisionEnter (collision : Collision) {
	if(collision.rigidbody && collision.rigidbody.tag.Equals("Projectile")){
		var ball = collision.transform.GetComponent("Damage");
		
		if (ball)
			hp -= ball.GetDamage();
		//audio.PlayOneShot(damageSound);
		
		if (hp > 0) {
			Stun();
		}
		else {
			Die(ball);
		}
	}

}

function Die (ball : Damage) {
	gameState = GameObject.Find("Game").GetComponent("GameStatus");
	gameState.IncreaseScore(ball.GetShootingTeam());
	
	hp = fullHp;
	Respawn ();
}

function Stun () {
	if(isControllable) {
		isControllable = false;
		stunTime = Time.time;
	}
}

function Respawn () {
	transform.position = teamBase.position;
}
