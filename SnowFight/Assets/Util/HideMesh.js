#pragma strict

private var meshRenderers :MeshRenderer[];
private var skinnedRenderers :SkinnedMeshRenderer[];

var hideMeshOnRuntime : boolean = false;

function Start () {

	meshRenderers = GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = GetComponentsInChildren.<SkinnedMeshRenderer> ();

}

function Update () {

	
	if (hideMeshOnRuntime) {
	
		for (var rend : MeshRenderer in meshRenderers) {
			rend.enabled = false;
		}

		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			rend.enabled = false;
		}
		
	} else {
	
		for (var rend : MeshRenderer in meshRenderers) {
			rend.enabled = true;
		}

		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			rend.enabled = true;
		}
		
	}
	
}