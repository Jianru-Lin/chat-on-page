echo STEP1: rm -rf ../chrome-client/server/
rm -rf ../chrome-client/server/

echo STEP2: mkdir ../chrome-client/server
mkdir ../chrome-client/server

echo STEP3: cp -r ../server/src/message/web_ui/public/* ../chrome-client/server/
cp -r ../server/src/message/web_ui/public/* ../chrome-client/server/

echo STEP4: jade --pretty -o ../chrome-client/server/ ../server/src/message/web_ui/view/index.jade
jade --pretty -o ../chrome-client/server/ ../server/src/message/web_ui/view/index.jade

echo STEP5: cp ../server/src/message/web_ui/public/js/web-api.js ../chrome-client/background/
cp ../server/src/message/web_ui/public/js/web-api.js ../chrome-client/background/

echo STEP6: cp ../server/src/message/web_ui/public/js/json-request.js ../chrome-client/background/
cp ../server/src/message/web_ui/public/js/json-request.js ../chrome-client/background/

echo STEP7: cp ./override/server/js/json-request.js ../chrome-client/server/js/
cp ./override/server/js/json-request.js ../chrome-client/server/js/