# remove server dir
echo STEP1: remove server dir
rm -rf ../chrome-client/server/

# create server dir
echo STEP2: create server dir
mkdir ../chrome-client/server

# copy all css and js file
echo STEP3: copy all css and js file
cp -r ../server/src/message/web_ui/public/* ../chrome-client/server/

# compile index.jade
echo STEP4: compile index.jade
jade --pretty -o ../chrome-client/server/ ../server/src/message/web_ui/view/index.jade

# copy web-api.js
echo STEP5: copy web-api.js
cp ../server/src/message/web_ui/public/js/web-api.js ../chrome-client/background/

# copy json-request.js
echo STEP6: copy json-request.js
cp ../server/src/message/web_ui/public/js/json-request.js ../chrome-client/background/

# copy server-event.js
echo STEP7: copy server-event.js
cp ../server/src/message/web_ui/public/js/server-event.js ../chrome-client/background/

# override json-request.js
echo override json-request.js
cp ./override/server/js/json-request.js ../chrome-client/server/js/

# override server-event.js
echo override server-event.js
cp ./override/server/js/server-event.js ../chrome-client/server/js/