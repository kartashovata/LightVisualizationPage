/**
 * @author Tatiana Kartashova
 * based on Cuttle, C. (2013). Research Note: A practical approach to cubic illuminance measurement.
 * and Kartashova, T., Sekulovksi, D., de Ridder, H., Pas, S. F., & Pont, S. C. (2016). The global structure * of the visual light field and its relation to the physical light field. =
 */


// Translation of 6 illiminance measurement to intensity, light vector direction and diffuseness
/**
* vertical cube sensor 1 (0 in the array) faces x axis, sensor 2 y axis, sensor 3 z axis, pairs of sensors 1-4, 2-5, 3-6
* if cube is oriented differently, rotation is needed
* diagonal cube 1 faces x axis (looking up-ish), 2 - y-axis. looks up-ish. pairs of sensors 1-4, 2-5, 3-6
*/
function MeasToProperties( sixmeas ,Diagonal_cube) {

	function vecComponent(axPlus,axMinus){return axPlus-axMinus}
	function vecNorm(x,y,z){
		length=Math.sqrt(x*x+y*y+z*z);
		return [x/length, y/length, z/length]
	}
	function vecLength(x,y,z){
		return Math.sqrt(x*x+y*y+z*z)
	}

	function resY(v,w){return 0.707*(v-w)}
	function resX(u,v,w){return 0.816*u-0.408*(v+w)}
	function resZ(u,v,w){return 0.577*(u+v+w)}

	function lightVec(sixmeas){
		if(Diagonal_cube){
			var u=vecComponent(sixmeas[0],sixmeas[3]);
			var v=vecComponent(sixmeas[1],sixmeas[4]);
			var w=vecComponent(sixmeas[2],sixmeas[5]);
			var uvwNorm=vecNorm(u,v,w);
			//console.log(uvwNorm);
			//console.log([resX(uvwNorm[0],uvwNorm[1],uvwNorm[2]), resY(uvwNorm[1],uvwNorm[2]), resZ(uvwNorm[0],uvwNorm[1],uvwNorm[2])])
			return vecNorm(resX(uvwNorm[0],uvwNorm[1],uvwNorm[2]), resY(uvwNorm[1],uvwNorm[2]), resZ(uvwNorm[0],uvwNorm[1],uvwNorm[2]));
		}else{
			return vecNorm(vecComponent(sixmeas[0],sixmeas[3]), vecComponent(sixmeas[1],sixmeas[4]), vecComponent(sixmeas[2],sixmeas[5]));
		}
	} /** lightVec([3,2,4,4,5,6]); should produce result -0.267261, -0.801784, -0.534522 */

	function intensity(sixmeas){//mean spherical illuminance
		var symmE,scalE;
		function tildaEu(axPlus,axMinus){
			return (axPlus+axMinus-Math.abs(vecComponent(axPlus,axMinus)))/2
		}
		symmE=(tildaEu(sixmeas[0],sixmeas[3])+tildaEu(sixmeas[1],sixmeas[4])+tildaEu(sixmeas[2],sixmeas[5]))/3;
		scalE=vecLength(vecComponent(sixmeas[0],sixmeas[3]), vecComponent(sixmeas[1],sixmeas[4]), vecComponent(sixmeas[2],sixmeas[5]))/4+symmE;
		return scalE
	}

	function diffuseness(sixmeas){
		return 1-vecLength(vecComponent(sixmeas[0],sixmeas[3]), vecComponent(sixmeas[1],sixmeas[4]), vecComponent(sixmeas[2],sixmeas[5]))/(4*intensity(sixmeas))
	}

	return [lightVec(sixmeas),intensity(sixmeas),diffuseness(sixmeas)]
}
