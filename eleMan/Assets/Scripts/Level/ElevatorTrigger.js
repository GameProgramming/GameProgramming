var destination : Transform;
private var move : boolean = false;

function Start () {
}

function Update() {
	if (move) {
		transform.position.y += 0.01;
	}
}

function OnCollisionEnter (collision : Collider) {
	if (collision.gameObject.tag == "Playder") {
		move = true;
	}
}