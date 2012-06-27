#pragma strict

var offset :float = 0;
private var height :float = 0;

@System.NonSerialized
private var terrain :Terrain;

function Start () {
	terrain = Terrain.activeTerrain;
    height = transform.position.y - terrain.SampleHeight(transform.position);
}

function Update () {
	transform.position.y = terrain.SampleHeight(transform.position) + height + offset;
}