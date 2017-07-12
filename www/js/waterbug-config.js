// widths and padding
var canvasWidth = 1000; // this will be the exported width of the image
var elementPadding = 40; // padding around the logo and credit text

// logo configuration
// the name of the logo object should match the value of the corresponding radio button in the HTML.
var logos = {
    'dmn': {
        whitePath: '../img/dmn.png', // path to white logo
        blackPath: '../img/dmn.png', // path to black logo
        w: 128, // width of logo
        h: 128, // height of logo
        display: 'DMN'
    },
    'gl': {
        whitePath: '../img/gl.png', // path to white logo
        blackPath: '../img/gl.png', // path to black logo
        w: 128, // width of logo
        h: 128, // height of logo
        display: 'GuideLive'
    },
    'sports': {
        whitePath: '../img/sports.png', // path to white logo
        blackPath: '../img/sports.png', // path to black logo
        w: 128, // width of logo
        h: 128, // height of logo
        display: 'SportsDay'
    },
};

// logo opacity for colors
var whiteLogoAlpha = '1';
var blackLogoAlpha = '1';

// type
var fontWeight = 'normal'; // font weight for credit
var fontSize = '20pt'; // font size for credit
var fontFace = "Helvetica"; // font family for credit
var fontShadow = 'rgba(0,0,0,0.7)'; // font shadow for credit
var fontShadowOffsetX = 0; // font shadow offset x
var fontShadowOffsetY = 0; // font shadow offset y
var fontShadowBlur = 10; // font shadow blur

// app load defaults
var currentCrop = 'twitter'; // default crop size
var currentLogo = 'dmn'; // default logo slug
var currentLogoColor = 'white'; // default logo color
var currentTextColor = 'white'; // default text color
var defaultImage = '../img/test-kitten.jpg'; // path to image to load as test image
var defaultLogo = logos[currentLogo].whitePath; // path to default logo
