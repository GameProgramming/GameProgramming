//Every enemy object has a left boundary and a right boundary.
//That has to be set to give him the "x"-boundary, where he walks between.

//Boolean indicating if he should move left or right.
var right : boolean;
var leftBoundary : float;
var rightBoundary : float;
var walkingSpeed : float;
private var leftSpeed : Vector3 = Vector3(-3, 0, 0);
private var rightSpeed : Vector3 = Vector3(3, 0, 0);

function Start() {
	//At the start walk whatever has been set.
	if (right) {
		WalkRight();
	} else {
		WalkLeft();
	}	
}

function Update() {
	//If he moves out of boundary, change.
	if (transform.position.x <= leftBoundary) {
		//Debug.Log("Test");
		right = true;
	} else if (transform.position.x >= rightBoundary) {
		right = false;
	}
	if (right == true) {
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