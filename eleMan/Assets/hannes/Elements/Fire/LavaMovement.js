private var pos :Vector3;

function Start() {
	pos = transform.position;
}

function Update () {
	transform.position = pos + Vector3(0,.2*Mathf.Sin(2 * Time.time),0);
}