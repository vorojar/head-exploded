import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Software WebGL (no GPU on this VM): ANGLE + SwiftShader. Chrome 128+
// requires --enable-unsafe-swiftshader to allow the software fallback.
Config.setChromiumOpenGlRenderer('swangle');
Config.setChromiumFlags({'enable-unsafe-swiftshader': true});
