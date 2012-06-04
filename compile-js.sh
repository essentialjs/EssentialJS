#!/bin/bash
#
# Concatenates and optionally compresses javascript files
# Use the -compress option to compress, eg: compile-js.sh -compress 
#
# Requires Node.js and uglifyjs module (installed globally)
#
# Some common Uglify JS options:
# -b 	beautify (don't remove whitespace)
# -nm 	don't mangle variable or function names
# -nc 	remove top-most comment from the first file
# -o 	output to file

ESSENTIAL='
js/constructive.js
js/essentialns.js
js/xhr.js
js/elements.js
'

ESSENTIALS='
js/modernizr-prefix.js
js/modernizr.js
js/constructive.js
js/essentialns.js
js/xhr.js
js/elements.js
js/json2.js
js/ZeroClipboard.js
'

APP='
app/main.js
'

if [[ $# -gt 0 && $1 == '-compress' ]]
then
	echo "Concatenating and compressing javascript files..."
	for file in $ESSENTIAL
	do
		cat $file
	done | uglifyjs -nc -o essential.min.js
	for file in $ESSENTIALS
	do
		cat $file
	done | uglifyjs -nc -o modernizr+essential+json+clipboard.min.js
	for file in $APP
	do
		cat $file
	done | uglifyjs -nc -o app.min.js
else
	echo "Concatenating javascript files..."
	for file in $ESSENTIAL
	do
		cat $file
	done > essential.js
	for file in $ESSENTIALS
	do
		cat $file
	done > modernizr+essential+json+clipboard.js
	for file in $APP
	do
		cat $file
	done > app.js
fi