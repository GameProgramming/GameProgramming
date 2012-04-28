var teamNumber = 1;
var teamBase : Transform;
var fullHp : int = 50;
var stunDuration = 3.0;
var respawnTimeout = 3.0;

private var hp : int = fullHp;
private var stunTime;
private var killTime;
private var gameState : GameStatus;
private var died : boolean = false;
private var stunned : boolean = false;
//InvokeRepeating("Regenerate",5,5);
//var damageSound : AudioClip;


function Update () {
//  if(hp==0){
//  	//audio.PlayOneShot(damageSound);
//  	gameObject.GetComponent("Detonator").Explode();
//  }
  
  if(stunned && Time.time > stunTime + stunDuration) {
  	stunned = false;
  	GetComponent(CharacterMotor).canControl = true;
	}
  	
	if (died && Time.time > killTime + respawnTimeout)
		Respawn();
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
	if (died) //we're already dead
		return;
	gameState = GameObject.FindWithTag("Game").GetComponent("GameStatus");
	gameState.IncreaseScore(ball.GetShootingTeam());
	
	died = true;
	killTime = Time.time;
}

function Stun () {
	if(GetComponent(CharacterMotor).canControl) {
		GetComponent(CharacterMotor).canControl = false;
	}
	stunned = true;
	stunTime = Time.time;
}

function Respawn () {
	transform.position = teamBase.position;
	hp = fullHp;
	died = false;
	
	Stun();
}
