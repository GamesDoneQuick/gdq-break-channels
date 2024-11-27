varying vec2 vTextureCoord;
varying vec2 vNormalCoord;

varying vec4 color;
varying vec3 normal;

uniform sampler2D uSampler;
uniform sampler2D normalSampler;
uniform sampler2D gradientSampler;

uniform vec2 lightVec;
uniform vec4 normalClamp;

//------------------------------------------------------------------------

void main(void) {
	float clip = step(3.5, step(normalClamp.x, vNormalCoord.x) +
	                           step(normalClamp.y, vNormalCoord.y) +
	                           step(vNormalCoord.x, normalClamp.z) +
	                           step(vNormalCoord.y, normalClamp.w));

	float strength = 0.5;

	vec4 color = texture2D(uSampler, vTextureCoord.xy);

	vec3 normal =
	    normalize(texture2D(normalSampler, vNormalCoord.xy).rgb * 2.0 -
	              1.0); // normal texture
	vec3 lightDir = normalize(vec3(lightVec.x, lightVec.y, 0.0));
	float NdotL = dot(normal, lightDir);
	float light = (NdotL + 1.0) * 0.5;

	vec4 shine = texture2D(gradientSampler, vec2(light, 0.5));

	color.rgb = mix(color, shine, strength * shine.a).rgb * clip;

	gl_FragColor = color;
}
