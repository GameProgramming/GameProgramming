#pragma strict

private var eulerAngles : Vector3;

function Start () {
	
	eulerAngles = transform.rotation.eulerAngles;
}

function Update () {
	eulerAngles.y = 0;
	transform.rotation = Quaternion.Euler(eulerAngles);
}