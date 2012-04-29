var teamNumber = 1;
var teamBase : Transform;
var fullHp : int = 10;
var stunDuration = 1.0;
var respawnTimeout = 5.0;

private var hp : int = fullHp;
private var stunTime;
private var killTime;
private var gameState : GameStatus;
private var died : boolean = false;
private var stunned : boolean = false;
//InvokeRepeating("Regenerate",5,5);
//var damageSound : AudioClip;

var anim : Animation;
anim = transform.Find("Model").GetComponent(Animation);
anim["hit"].speed = 10;
anim["hit"].layer = 2;
anim["hit"].wrapMode = WrapMode.Once;

anim["die"].speed = 10;
anim["die"].layer = 3;
anim["die"].wrapMode = WrapMode.Once;
anim["die"].weight = 100;

function Update () {
//  if(hp==0){
//  	//audio.PlayOneShot(damageSound);
//  	gameObject.GetComponent("Detonator").Explode();
//  }
  
  if(!died && stunned && Time.time > stunTime + stunDuration) {
  	stunned = false;
  	GetComponent(CharacterMotorSF).canControl = true;
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
		
		anim.CrossFade("hit");
		
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
	
	GetComponent(CharacterMotorSF).canControl = false;
	
	anim.CrossFade("die");
}

function Stun () {
	if (died) return;
	if(GetComponent(CharacterMotorSF).canControl) {
		GetComponent(CharacterMotorSF).canControl = false;
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
