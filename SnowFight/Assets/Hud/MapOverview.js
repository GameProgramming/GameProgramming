
var mode = false;

function Awake () {
}

function Update () {
	if (Input.GetButtonUp("Map")) {
		mode = !mode;
		SetMode(mode);
	}
}

function SetMode ( m :boolean ) {
	mode = m;
	var camFollow :SmoothFollow = GameObject.FindGameObjectWithTag("MainCamera").GetComponent(SmoothFollow);
	if (m) {
		camFollow.target = transform;
	} else {
		camFollow.target = gameObject.Find("CameraTarget").transform;
	}
	
}