// widths and padding
var canvasWidth = 1000; // this will be the exported width of the image
var elementPadding = 40; // padding around the logo and credit text

// logo configuration
// the name of the logo object should match the value of the corresponding radio button in the HTML.
var logos = {
    'dmn': {
        path: '../img/dmn.png',
        w: 100, // width of logo
        h: 100, // height of logo
        display: 'DMN'
    },
    'gl': {
        path: '../img/gl.png',
        w: 100, // width of logo
        h: 100, // height of logo
        display: 'GuideLive'
    },
    'sports': {
        path: '../img/sports.png',
        w: 100, // width of logo
        h: 100, // height of logo
        display: 'SportsDay'
    },
};


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
var currentFont = 'gwebi';
var defaultImage = '../img/test-kitten.jpg'; // path to image to load as test image
var defaultLogo = logos[currentLogo].path; // path to default logo
var currentAlign = '70x60xstartxtop';
