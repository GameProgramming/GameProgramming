private var pos :Vector3;

function Start() {
	pos = transform.position;
}

function Update () {
	transform.position = pos + Vector3(0,.15*Mathf.Sin(transform.position.x + transform.position.y + 2 * Time.time),0);
     transform.rotation.y = 20*Mathf.Sin(transform.position.x + 3 * Time.time);
}