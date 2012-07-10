private var life : int;
var initialLife : int = 10;

function Start(){
	life = initialLife;
}


function Update(){
	if(life > 0){
		//do stuff	
	}else{
		//die die die
	}
}

function OnControllerColliderHit (hit : ControllerColliderHit){
	if(hit.gameObject.tag == "Door" && KeyCode.UpArrow){
		var door : GameObject = hit.gameObject;
		door.GetComponent("DoorFunctions").Open();
	}
} 

function OnTriggerEnter(col : Collider) {
	if (col.gameObject.tag == "Player") {
		player = col.gameObject;
		player.GetComponent("Player").Kill();
	}
}