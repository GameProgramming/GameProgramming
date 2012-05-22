var highestPositionY : float;
var lowestPositionY : float;
private var activated : boolean = false;
private var moveDown : boolean = false;
private var moveUp : boolean = false;

function Start () {
}

function Update() {
	if (moveDown && activated) {
		transform.position.y -= 0.01;
	} else if (moveUp && activated) {
		transform.position.y += 0.01;
	}
	if (transform.position.y <= lowestPositionY) {
		moveUp = true;
		moveDown = false;
	} else if (transform.position.y >= highestPositionY) {
		moveDown = true;
		moveUp = false;
	}
}

function Activate() {
	activated = true;
}