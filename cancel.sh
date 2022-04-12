#!bin/sh

version=`grep -oE "\"version\": \"1\.[0-9]{1,3}\"" manifest.json`
regex='\.([0-9]{1,3})"$'
[[ $version =~ $regex ]]
patch=${BASH_REMATCH[1]}
newPatch=$((patch - 1))
echo -e "\033[0;31m building back version 1.$newPatch \033[0m"
sed -i "s/\"version\": \"1\.[[:digit:]]\+\"/\"version\": \"1.$newPatch\"/" manifest.json
rm -f DarkTheme.zip
zip -FS DarkTheme.zip *.js *.png manifest.json
echo -e "\033[0;31mdone\033[0m"