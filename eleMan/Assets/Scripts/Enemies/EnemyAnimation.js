
var right : boolean;
var walkingSpeed : float;
private var leftSpeed : Vector3 = Vector3(-1, 0, 0);
private var rightSpeed : Vector3 = Vector3(1, 0, 0);
var progress :float =  0;
var interval :float = 10;

function Start() {
	leftSpeed *= walkingSpeed;
	rightSpeed *= walkingSpeed;
}

function Update() {
	progress += Time.deltaTime;
	
	if (progress >= interval) {
		progress = 0;
		right = !right;
	}
	if (right) {
		WalkRight();
	} else {
		WalkLeft();
	}
}

function WalkRight() {
	rigidbody.MovePosition(rigidbody.position + rightSpeed * Time.deltaTime);
}

function WalkLeft() {
	rigidbody.MovePosition(rigidbody.position + leftSpeed * Time.deltaTime);
}