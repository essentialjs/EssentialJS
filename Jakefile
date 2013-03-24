var fs = require('fs'), zlib = require('zlib');
var uglify = require('uglify-js');
var less = require('less');

var MODERNIZR_FILES = [
  'modernizr-prefix.js',
  'modernizr.js'];

var ESSENTIAL_FILES = [
  'resolver.js',
  'generator.js',
  'essentialns.js',
  'page.js',
  'xhr.js',
  'elements.js',
  'roles.js'];

var EXTRAS_FILES = [
  'json2.js',
  'ZeroClipboard.js'];

function combine(files) {
  var all = '';
  files.forEach(function(file, i) {
    if (file.match(/^.*js$/)) {
      all += "\n" + fs.readFileSync('js/'+file).toString();
    }
  });
  return all;
}

function combine_and_minify(files) {

  var all = '';
  files.forEach(function(file, i) {
    if (file.match(/^.*js$/)) {
      all += fs.readFileSync('js/'+file).toString();
    }
  });

  var ast = uglify.parser.parse(all);
  ast = uglify.uglify.ast_mangle(ast);
  ast = uglify.uglify.ast_squeeze(ast);
  return uglify.uglify.gen_code(ast);
}

desc('Uglify JS');
task('minify', [], function(params) {
  var license = fs.readFileSync('js/license.txt').toString();

  var out = fs.openSync('essential.min.js', 'w+');
  fs.writeSync(out, license);
  fs.writeSync(out, combine_and_minify(ESSENTIAL_FILES));

  var out = fs.openSync('modernizr+essential+json+clipboard.min.js', 'w+');
  fs.writeSync(out, combine_and_minify(MODERNIZR_FILES));
  fs.writeSync(out, license);
  fs.writeSync(out, combine_and_minify(ESSENTIAL_FILES));
  fs.writeSync(out, "\n");
  fs.writeSync(out, combine_and_minify(EXTRAS_FILES));
});

desc('GZip JS');
task('gzip', [], function(params) {
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream('essential.min.js'),
      out = fs.createWriteStream('essential.min.js.gz');
  inp.pipe(gzip).pipe(out);
});

desc('Combine files');
task('combine',function(params){
  var license = fs.readFileSync('js/license.txt').toString();

  var out = fs.openSync('essential.js', 'w+');
  fs.writeSync(out, license);
  fs.writeSync(out, combine(ESSENTIAL_FILES));

  var out = fs.openSync('modernizr+essential+json+clipboard.js', 'w+');
  fs.writeSync(out, combine(MODERNIZR_FILES));
  fs.writeSync(out, license);
  fs.writeSync(out, combine(ESSENTIAL_FILES));
  fs.writeSync(out, "\n");
  fs.writeSync(out, combine(EXTRAS_FILES));
});

desc('Make CSS files for demos');
task('css',function(params){
  var basic = fs.readFileSync('app/css/basic.less').toString();
  less.Parser({}).parse(basic,function(css){
    var out = fs.openSync('app/css/basic.css', 'w+');
    fs.writeSync(out, css);
  })
});

desc('Build all files');
task('default',function(params){
  jake.Task['combine'].invoke();
  jake.Task['minify'].invoke();
  jake.Task['gzip'].invoke();
});
