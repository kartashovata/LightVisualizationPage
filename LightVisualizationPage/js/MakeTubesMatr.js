/**
 * @author Tatiana Kartashova
 * based on Trilinear interpolation wikipedia page and algorithm for tubes drawing,
 * see Kartashova, T., Sekulovksi, D., de Ridder, H., Pas, S. F., & Pont, S. C. (2016). The global structure * of the visual light field and its relation to the physical light field.
 */

// Creating a matrix for tubes basing on the input matrix of light properties
/**
*
*/
function MakeTubesMatr( measArray, stepSize, nSteps, nTubesX, nTubesY, nTubesZ ) {
	var all,minXYZ,maxXYZ,resultingMatr;
	//resultingMatr initial [positionXYZ, vectorXYZ, intensity, diffuseness]; output [nTubes,nSteps, positionXYZ, vectorXYZ, intensity, diffuseness]

	function defineBorders() {//finds minimum and maximum x,y, and z in the measArray
			minXYZ=[];
	    maxXYZ=[];
		for (i = 3; i < 6; i++){//3 and 6 because of input positions of values
	        all=[];
	        for (j = 0; j < measArray.length; j++) {
	        	all[j]=measArray[j][i];
	        }
	        minXYZ[i-3]=all.sort(function(a, b){return a - b})[0];
	        maxXYZ[i-3]=all.sort(function(a, b){return a - b})[all.length-1];
	     }
	    return 1;
	}

	function checkIfInBorders([x,y,z]){//checks if the input point is still in the borders of the grid

		if ( minXYZ !== undefined && maxXYZ !== undefined) {
			if (x>=minXYZ[0] && x<=maxXYZ[0] && y>=minXYZ[1] && y<=maxXYZ[1] && z>=minXYZ[2] && z<=maxXYZ[2]){return true} else {return false}
		} else {
			console.log('minXYZ or maxXYZ undefined');
			return false;
		}
	}

	function mysortfunction(a, b) {

		  var x1 = a[3];
		  var x2 = b[3];

		  var y1 = a[4];
		  var y2 = b[4];

			var z1 = a[5];
			var z2 = b[5];

		  if (x1 < x2) return -1;
		  if (x1 > x2) return 1;
		  if (y1 < y2) return -1;
		  if (y1 > y2) return 1;
			if (z1 < z2) return -1;
			if (z1 > z2) return 1;

		  return 0;
	}

	function findSurrounding([x,y,z]){
		var surrounding=[];//clear surrounding array

    var mA1=measArray.sort(mysortfunction);//sort mA
		//filter neihbours
		var xyz=[x,y,z];//to make loop for three parameters
		var minmaxxyz=[]; // to save min and max of parameters;
    //console.log(['xyz',xyz]);
		for (var j = 3; j < 6; j++){
		    for (var i = 0; i < mA1.length; i++) {//go through the list to define neihbouring values
					if(mA1[i][j]<=xyz[j-3] &&mA1[i+1][j]>=xyz[j-3]){//compares if the point value is between sorted list values
            // if yes, then stops comparison
							break;
					}
				}

				if (i<mA1.length){//if inside of the list, filter all elements with two values
					function checkValue(val) {//filtering function for smaller element in the list
						return val[j] == mA1[i][j];
					}
					function checkValue1(val) {//filtering function for smaller element in the list
						return val[j] == mA1[i+1][j];
					}
					minmaxxyz[j-3]=[mA1[i][j], mA1[i+1][j]];//saving border values
					mA1=mA1.filter(checkValue).concat(mA1.filter(checkValue1));//saving suitable elements
				}else //if on the border of the list, filter the values of a single value
          {if (xyz[j-3]==mA1[0][j]) {//in case if the value is equal to the first value of the list (smallest)
					function checkValue(val) {//filtering function
						return val[j] == mA1[0][j];
					}
					minmaxxyz[j-3]=[mA1[0][j], mA1[0][j]];//saving border values (repetition of the same)
					mA1=mA1.filter(checkValue);//saving suitable elements
				} else if (xyz[j-3]==mA1[i-1][j]) {//in case if we passed all the list, and value is equal to the top one
					function checkValue(val) {//filtering function
						return val[j] == mA1[i-1][j];
					}
					minmaxxyz[j-3]=[mA1[i-1][j], mA1[i-1][j]];//saving border values (repetition of the same)
					mA1=mA1.filter(checkValue);//saving suitable elements
				}}
		}
		//filtering only the elements, all position values (xyz) of which fit the condition - getting the final list of neighbours
		var binarMM=[[0,0,0],[0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1]];
		for (var i = 0; i < 8; i++){
				function checkValue2(val) {
					return val[3] == minmaxxyz[0][binarMM[i][0]] && val[4] == minmaxxyz[1][binarMM[i][1]] && val[5] == minmaxxyz[2][binarMM[i][2]]
				}
        surrounding[i]=mA1.filter(checkValue2)[0];
			}

        return surrounding;
}

function myInterpolate(surroundingArr,point){//linear interpolation, based on formulas in https://en.wikipedia.org/wiki/Trilinear_interpolation
			//surroundingArr - 8 points of format [[vector],intnsity,diffuseness, x,y,z]
			//point - coordinates of point to get interpolated coordinates
			var xyzd=[];//differences between point and surrounding gridPoints
			if(surroundingArr[4][3]!=surroundingArr[0][3]){
				xyzd[0]=(point[0]-surroundingArr[0][3])/(surroundingArr[4][3]-surroundingArr[0][3]);
			} else {xyzd[0]=0;};
			if (surroundingArr[2][4]!=surroundingArr[0][4]){
				xyzd[1]=(point[1]-surroundingArr[0][4])/(surroundingArr[2][4]-surroundingArr[0][4]);
			}else {xyzd[1]=0;};
			if(surroundingArr[1][5]!=surroundingArr[0][5]){
				xyzd[2]=(point[2]-surroundingArr[0][5])/(surroundingArr[1][5]-surroundingArr[0][5]);
			}else {xyzd[2]=0;};


			function interpolateEssence(paramVal){//interpolation is done for each parameter separately, vector components are calculated separately too
				//paramVal - array with 8 values of surrounding grid
				var c00=paramVal[0]*(1-xyzd[0])+paramVal[4]*xyzd[0];
				var c01=paramVal[1]*(1-xyzd[0])+paramVal[5]*xyzd[0];
				var c10=paramVal[2]*(1-xyzd[0])+paramVal[6]*xyzd[0];
				var c11=paramVal[3]*(1-xyzd[0])+paramVal[7]*xyzd[0];

				var c0=c00*(1-xyzd[1])+c10*xyzd[1];
				var c1=c01*(1-xyzd[1])+c11*xyzd[1];

				var c=c0*(1-xyzd[2])+c1*xyzd[2];
				//console.log(c);
				return c;
			}

			function getCol(matrix, col){//function to obtain a column of an array
       var column = [];
       for(var i=0; i<matrix.length; i++){
          column.push(matrix[i][col]);
       }
       return column;
    	}
	  //light vector (vector components are calculated separately)
		var vector=[interpolateEssence(getCol(getCol(surroundingArr,0),0)), interpolateEssence(getCol(getCol(surroundingArr,0),1)), interpolateEssence(getCol(getCol(surroundingArr,0),2))];
		//intensity
		var intensity=interpolateEssence(getCol(surroundingArr,1));
    //diffuseness
    var diffuseness=interpolateEssence(getCol(surroundingArr,2));

		return [vector,intensity,diffuseness];//output - array with values of vector, intensity and diffusenes
}


	var allGrid=[];
			//init the grid matrix
			for ( var i = 0; i < nTubesX; i++ ) {
					allGrid[i] = [];
					for ( var j = 0; j < nTubesY; j++ ) {
					allGrid[i][j] = [];
				}
			}

//HERE THE MAIN ALGORITHM
defineBorders();
//making a small indent inside the volume of the grid, so that all the tubes are drawn, even if they go out of the volume
var indent=[stepSize+(maxXYZ[0]-minXYZ[0])/50, stepSize+(maxXYZ[1]-minXYZ[1])/50, stepSize+(maxXYZ[2]-minXYZ[2])/50];
var minXYZ1=[], maxXYZ1=[];
for (i = 0; i < 3; i++){
  minXYZ1[i]=minXYZ[i]+indent[i];
  maxXYZ1[i]=maxXYZ[i]-indent[i];
}

for (i = 0; i < nTubesX; i++){//first making matrix with the grid of points
	for (j = 0; j < nTubesY; j++){
		for (k = 0; k < nTubesZ; k++){
			allGrid[i][j][k]=[minXYZ1[0]+(maxXYZ1[0]-minXYZ1[0])*i/(nTubesX-1), minXYZ1[1]+(maxXYZ1[1]-minXYZ1[1])*j/(nTubesY-1), minXYZ1[2]+(maxXYZ1[2]-minXYZ1[2])*k/(nTubesZ-1)];
		}
	}
}
    //console.log('allGrid');
    //console.log(allGrid);
	resultingMatr=[];
	var stepsMatr=[];

	for (i = 0; i < nTubesX; i++){//picking only points on the boders of the grid
			for (j = 0; j < nTubesY; j++){
				for (k = 0; k < nTubesZ; k++){
					//if(allGrid[i][j][k][0]==minXYZ1[0] || allGrid[i][j][k][0]==maxXYZ1[0] || allGrid[i][j][k][1]==minXYZ1[1] || allGrid[i][j][k][1]==maxXYZ1[1] || allGrid[i][j][k][2]==minXYZ1[2] || allGrid[i][j][k][2]==maxXYZ1[2]){
						resultingMatr.push(allGrid[i][j][k]);
						stepsMatr.push(0);
					//}
				}
			}
		}

      //  console.log(temp);
	for (i = 0; i < resultingMatr.length; i++){//calculating interpolations for the starting points
			surrArr=findSurrounding(resultingMatr[i]);
			resultingMatr[i]=resultingMatr[i].concat(myInterpolate(surrArr,resultingMatr[i]));

	}
	var newPoint=[];
	for (j=0;j<nSteps;j++){//calculating all steps...
			for (i = 0; i < resultingMatr.length; i++){//...for all points
					if (j==0){//on the first step the array is 2-dimensional, thus different referencing
						newPoint=[resultingMatr[i][0]+resultingMatr[i][3][0]*stepSize, resultingMatr[i][1]+resultingMatr[i][3][1]*stepSize, resultingMatr[i][2]+resultingMatr[i][3][2]*stepSize];//calculating new point as step in vector direction
					}
					else{//all other steps
						newPoint=[resultingMatr[i][j][0]+resultingMatr[i][j][3][0]*stepSize, resultingMatr[i][j][1]+resultingMatr[i][j][3][1]*stepSize, resultingMatr[i][j][2]+resultingMatr[i][j][3][2]*stepSize];//calculating new point as step in vector direction
					}

					if (checkIfInBorders(newPoint)){//check if the new point is still in the measured volume
						surrArr=findSurrounding(newPoint);//find surrounding points
            if (j==0){//if first step
							newPoint=newPoint.concat(myInterpolate(surrArr,newPoint));//make interpolation
							resultingMatr[i]=[resultingMatr[i].slice(),newPoint];//add new point to the array
							stepsMatr[i]=stepsMatr[i]+1;
        		}
            else{//not first step
							newPoint=newPoint.concat(myInterpolate(surrArr,newPoint));//make interpolation
  						resultingMatr[i].push(newPoint);//add new point to the array
							stepsMatr[i]=stepsMatr[i]+1;
						}
					}else{//if new point is out of the volume, copy the previous point
						if (j==0){//if first step
              resultingMatr[i]=[resultingMatr[i].slice(),resultingMatr[i].slice()];
							stepsMatr[i]=stepsMatr[i]+1;
							}
            else{//not first step, move just a bit forward to avoid ugly tube finish
							newPoint=resultingMatr[i][resultingMatr[i].length-1].slice();
							//console.log(newPoint);
							newPoint[0]=newPoint[0]+newPoint[3][0]*stepSize/1000;
							newPoint[1]=newPoint[1]+newPoint[3][1]*stepSize/1000;
							newPoint[2]=newPoint[2]+newPoint[3][2]*stepSize/1000;
  						resultingMatr[i].push(newPoint);

						}
					}
		}
}
	//console.log('resultingMatr');
	//console.log(stepsMatr);
	return [resultingMatr,stepsMatr];//output: [nTubes,nSteps, (positionX, positionY, positionZ, vectorXYZ, intensity, diffuseness)]

}
