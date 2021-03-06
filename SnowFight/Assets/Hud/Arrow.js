var maxHeight :float = 20;
var minHeight :float = 13;
var jumpSpeed :float = 4;

private var map : MapOverview;
//False means downwards, true means upwards.
private var direction : boolean;

enum ArrowMode {Disabled, Jumping, Idle, Hinting, UpOut, DownOn};
private var mode :ArrowMode = ArrowMode.Disabled;

function Awake () {
	map = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
	transform.renderer.enabled = false;
	direction = false;
}

function FixedUpdate () {
	if (!map.GetMode() || mode == ArrowMode.Disabled) {
		renderer.enabled = false;
	} else {
		renderer.enabled = true;
		var speed = jumpSpeed * Time.deltaTime;
		if (mode == ArrowMode.Jumping || mode == ArrowMode.Hinting) {
			if (mode == ArrowMode.Hinting) speed /= 2;
			if (transform.localPosition.y <= minHeight) {
				direction = true;
			}
			if (transform.localPosition.y >= maxHeight) {
				direction = false;
			}
			if (direction) {
				transform.localPosition.y += speed;
			} else {
				transform.localPosition.y -= speed;
			}
			if (mode == ArrowMode.Hinting) {
				transform.rotation.eulerAngles.x = 4*(transform.localPosition.y - minHeight);
			} else {
				transform.rotation.eulerAngles.x = 0;
			}
		} else if (mode == ArrowMode.UpOut) {
			if (Mathf.Abs(transform.localPosition.y) < 1000) {
				transform.localPosition.y += (2+transform.localPosition.y)*Time.deltaTime;
			}
		} else if (mode == ArrowMode.DownOn) {
			transform.localPosition.y = Mathf.MoveTowards(transform.localPosition.y, minHeight, 2*speed);
			transform.rotation.eulerAngles.y += 40*Time.deltaTime;		
		} else {
			transform.localPosition.y = Mathf.Lerp(transform.localPosition.y, minHeight, 0.3);
			transform.rotation.eulerAngles.x = 0;
		}
		transform.rotation.eulerAngles.y += 40*Time.deltaTime;
	}
}

function SetArrowMode (m :ArrowMode) {
	if (mode == ArrowMode.UpOut) {
		transform.localPosition.y = maxHeight + jumpSpeed;
	}
	mode = m;
}

function SetColor (c :Color) {
	renderer.material.color = c;
}