# remove server dir
echo remove server dir
rm -rf ../chrome-client/server/

# create server dir
echo create server dir
mkdir ../chrome-client/server

# copy all css js img audio files
echo copy all css js img audio files
cp -r ../server/src/message/web_ui/public/* ../chrome-client/server/

# compile index.jade
echo compile index.jade
jade --pretty -o ../chrome-client/server/ ../server/src/message/web_ui/view/index.jade

# copy json-request.js
echo copy json-request.js
cp ../server/src/message/web_ui/public/js/json-request.js ../chrome-client/background/

# copy message-manager.js
echo copy message-manager.js
cp ../server/src/message/web_ui/public/js/message-manager.js ../chrome-client/background/

# override json-request.js
echo override json-request.js
cp ./override/server/js/json-request.js ../chrome-client/server/js/