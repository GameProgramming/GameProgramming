var highestPositionY : float;
var lowestPositionY : float;
var activated : boolean;
private var moveDown : boolean = false;
private var moveUp : boolean = false;

function Start () {
	Activate();
}

function Update() {
	if(activated){
		if (moveDown) {
			transform.position.y -= 0.05;
		} else if (moveUp) {
			transform.position.y += 0.05;
		}
		if (transform.position.y <= lowestPositionY) {
			moveUp = true;
			moveDown = false;
		} else if (transform.position.y >= highestPositionY) {
			moveDown = true;
			moveUp = false;
		}
	}
}

function Activate() {
	activated = true;
}