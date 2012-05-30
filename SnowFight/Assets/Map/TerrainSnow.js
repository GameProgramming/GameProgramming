#pragma strict

private var terrainData :TerrainData;
private var terrain :Terrain;
private var hmWidth :int;
private var hmHeight :int;
private var alphaMap :float[,,];
private var aWidth :int;
private var aHeight :int;
var snowAmount :int[,] = new int[512,512];
var maxAmount = 5.0;

private var alphaMapBackup :float[,,];

private var redrawTime :float;

function Start () {
	terrain = GetComponent(Terrain);
	terrainData = terrain.terrainData;
	
	hmWidth = terrainData.size.z;
    hmHeight = terrainData.size.x;
    aWidth = terrainData.alphamapWidth;
	aHeight = terrainData.alphamapHeight;
	
	Debug.Log("terrain of "+aWidth.ToString()+"x"+aHeight.ToString());
	
	snowAmount = new int[aWidth, aHeight];
	for (var x = 0; x < aWidth; x++) {
		for (var y = 0; y < aHeight; y++) {
			snowAmount[x,y] = maxAmount;
		}
	}
	
	alphaMap = terrainData.GetAlphamaps(0, 0, aWidth, aHeight);
	
	if (Debug.isDebugBuild) {
		// store initial alpha map...
    	alphaMapBackup = terrainData.GetAlphamaps(0, 0, aWidth, aHeight);
    }
    
    redrawTime = Time.time;
}

function Update () {
//	var x = (terrainData.alphamapWidth-1) * Random.value;
//	var y = (terrainData.alphamapHeight-1) * Random.value;
//	var newMapsels :float[,,] = new float[1,1,3];
//	newMapsels[0,0,0] = 0.0;
//	newMapsels[0,0,1] = 0.0;
//	newMapsels[0,0,2] = 0.0;
//	terrainData.SetAlphamaps(x,y, newMapsels);

	if (Time.time > redrawTime) {
		redrawTime = Time.time + 0.5;
		terrainData.SetAlphamaps(0,0, alphaMap);
	}
}

function  OnApplicationQuit () {
	// restore terrain data...  otherwise it changes the level permanently.
	if (Debug.isDebugBuild) {
	    terrainData.SetAlphamaps(0, 0, alphaMapBackup);
	}
}

function SnowAvailable (pos :Vector3) :boolean {
	var x = pos.z * aWidth / hmWidth;
	var y = pos.x * aHeight / hmHeight;
	
	return snowAmount[x,y] > 0;
}

function GrabSnow (pos :Vector3) {
	var x = pos.z * aWidth / hmWidth;
	var y = pos.x * aHeight / hmHeight;
	
	snowAmount[x,y] = snowAmount[x,y] - 1;
	var alph = snowAmount[x,y] / maxAmount;
	alphaMap[x,y,0] = alph;
	alphaMap[x,y,2] = 1-alph;
}